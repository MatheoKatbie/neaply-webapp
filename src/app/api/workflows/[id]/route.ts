import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { updateWorkflowVersion } from '@/lib/workflow-version'
import { safeDecrypt } from '@/lib/encryption'
import { notifyFollowersNewWorkflow } from '@/lib/notifications'

// Helper function to compare semantic versions
function compareVersions(version1: string, version2: string): number {
  const parts1 = version1.split('.').map(Number)
  const parts2 = version2.split('.').map(Number)

  // Pad arrays to same length
  while (parts1.length < parts2.length) parts1.push(0)
  while (parts2.length < parts1.length) parts2.push(0)

  // Compare each part
  for (let i = 0; i < parts1.length; i++) {
    if (parts1[i] > parts2[i]) return 1
    if (parts1[i] < parts2[i]) return -1
  }
  return 0
}

// Schema de validation pour update
const updateWorkflowSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .optional(),
    shortDesc: z
      .string()
      .min(10, 'Short description must be at least 10 characters')
      .max(200, 'Short description cannot exceed 200 characters')
      .optional(),
    longDescMd: z
      .string()
      .min(50, 'Long description must be at least 50 characters')
      .max(5000, 'Long description cannot exceed 5000 characters')
      .optional(),
    heroImageUrl: z.string().url('Hero image URL must be valid').optional().or(z.literal('')),
    documentationUrl: z.string().url('Documentation URL must be valid').optional().or(z.literal('')),
    basePriceCents: z
      .number()
      .min(0, 'Base price cannot be negative')
      .max(1000000, 'Base price cannot exceed $10,000.00')
      .optional(),
    currency: z.string().optional(),
    // Sellers cannot set admin_disabled from this route; reserved for admins
    status: z.enum(['draft', 'published', 'unlisted', 'disabled']).optional(),
    platform: z.enum(['n8n', 'zapier', 'make', 'airtable_script']).optional(),
    jsonContent: z.any().optional(),
    n8nMinVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z (e.g., 1.0.0)')
      .optional()
      .or(z.literal('')),
    n8nMaxVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z (e.g., 1.0.0)')
      .optional()
      .or(z.literal('')),
    categoryIds: z.array(z.string()).min(1, 'At least one category must be selected').optional(),
    tagIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Validate that max version is greater than min version if both are provided
      if (data.n8nMaxVersion && data.n8nMaxVersion.trim() && data.n8nMinVersion && data.n8nMinVersion.trim()) {
        return compareVersions(data.n8nMaxVersion, data.n8nMinVersion) > 0
      }
      return true
    },
    {
      message: 'Maximum n8n version must be greater than minimum n8n version',
      path: ['n8nMaxVersion'],
    }
  )

// Helper function pour l'authentification côté serveur
async function getAuthenticatedSeller() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      sellerProfile: true,
    },
  })

  if (!dbUser || !dbUser.isSeller || !dbUser.sellerProfile) {
    return null
  }

  return dbUser
}

// Helper function pour générer un slug unique
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const seller = await getAuthenticatedSeller()
    if (!seller) {
      return NextResponse.json({ error: 'Authentication required - must be a seller' }, { status: 401 })
    }

    const { id } = await params
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }
    const workflowId = id

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        sellerId: seller.id,
      },
      include: {
        seller: {
          select: {
            displayName: true,
            sellerProfile: {
              select: {
                storeName: true,
                slug: true,
              },
            },
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            orderItems: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Decrypt JSON content for each version
    const workflowWithDecryptedContent = {
      ...workflow,
      versions: workflow.versions.map((version) => ({
        ...version,
        jsonContent: version.jsonContent ? safeDecrypt(version.jsonContent) : null,
      })),
    }

    return NextResponse.json({ data: workflowWithDecryptedContent })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const seller = await getAuthenticatedSeller()
    if (!seller) {
      return NextResponse.json({ error: 'Authentication required - must be a seller' }, { status: 401 })
    }

    const { id } = await params
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }
    const workflowId = id

    // Vérifier que le workflow appartient au seller
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        sellerId: seller.id,
      },
    })

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Parse et validation du body
    const body = await req.json()
    const validatedData = updateWorkflowSchema.parse(body)

    // Block status changes if admin has disabled this workflow
    if (existingWorkflow.status === 'admin_disabled' && typeof (body?.status as any) !== 'undefined') {
      return NextResponse.json(
        { error: 'This workflow was disabled by an admin and its status cannot be changed by the seller' },
        { status: 403 }
      )
    }

    // Préparer les données de mise à jour (exclure les champs de version et relations)
    const { jsonContent, n8nMinVersion, n8nMaxVersion, categoryIds, tagIds, ...workflowUpdateData } = validatedData

    // Si le titre change, mettre à jour le slug
    if (validatedData.title && validatedData.title !== existingWorkflow.title) {
      let baseSlug = generateSlug(validatedData.title)
      let slug = baseSlug
      let counter = 1

      // Vérifier l'unicité du slug
      while (true) {
        const existingSlug = await prisma.workflow.findFirst({
          where: {
            slug,
            id: { not: workflowId },
          },
        })

        if (!existingSlug) break

        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Utiliser une transaction pour mettre à jour le workflow et sa version
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le workflow
      const updatedWorkflow = await tx.workflow.update({
        where: { id: workflowId },
        data: workflowUpdateData as any,
      })

      // Mettre à jour ou créer la version si du JSON est fourni
      if (jsonContent !== undefined) {
        await updateWorkflowVersion(workflowId, jsonContent, n8nMinVersion, n8nMaxVersion)
      }

      // Mettre à jour les catégories si fournies
      if (categoryIds !== undefined) {
        // Supprimer toutes les anciennes relations
        await tx.workflowCategory.deleteMany({
          where: { workflowId: workflowId },
        })

        // Créer les nouvelles relations (validation garantit qu'il y a au moins 1 élément)
        await tx.workflowCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            workflowId: workflowId,
            categoryId: categoryId,
          })),
        })
      }

      // Mettre à jour les tags si fournis
      if (tagIds !== undefined) {
        // Supprimer toutes les anciennes relations
        await tx.workflowTag.deleteMany({
          where: { workflowId: workflowId },
        })

        // Créer les nouvelles relations (validation garantit qu'il y a au moins 1 élément)
        await tx.workflowTag.createMany({
          data: tagIds.map((tagId: string) => ({
            workflowId: workflowId,
            tagId: tagId,
          })),
        })
      }

      // Récupérer le workflow mis à jour avec toutes les relations
      return await tx.workflow.findUnique({
        where: { id: workflowId },
        include: {
          seller: {
            select: {
              displayName: true,
              sellerProfile: {
                select: {
                  storeName: true,
                  slug: true,
                },
              },
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          versions: {
            where: { isLatest: true },
            take: 1,
          },
        },
      })
    })

    const updatedWorkflow = result!

    // If workflow was just published (status changed from non-published to published), notify followers
    if (
      validatedData.status === 'published' &&
      existingWorkflow.status !== 'published'
    ) {
      try {
        await notifyFollowersNewWorkflow({
          sellerId: seller.id,
          storeName: seller.sellerProfile?.storeName || seller.displayName || 'Un vendeur',
          storeSlug: seller.sellerProfile?.slug || '',
          workflowId: updatedWorkflow.id,
          workflowTitle: updatedWorkflow.title,
          workflowSlug: updatedWorkflow.slug,
        })
        console.log('📧 Followers notified about new workflow:', updatedWorkflow.title)
      } catch (notifError) {
        console.error('Failed to notify followers:', notifError)
        // Don't fail the request if notification fails
      }
    }

    // UUIDs are already strings, no conversion needed
    return NextResponse.json({
      data: updatedWorkflow,
      message: 'Workflow updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const seller = await getAuthenticatedSeller()
    if (!seller) {
      return NextResponse.json({ error: 'Authentication required - must be a seller' }, { status: 401 })
    }

    const { id } = await params
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }
    const workflowId = id

    // Vérifier que le workflow appartient au seller
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        sellerId: seller.id,
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Vérifier s'il y a des ventes (on ne peut pas supprimer un workflow vendu)
    if (existingWorkflow._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete workflow with existing sales. You can disable it instead.' },
        { status: 400 }
      )
    }

    // Supprimer le workflow
    await prisma.workflow.delete({
      where: { id: workflowId },
    })

    return NextResponse.json({
      message: 'Workflow deleted successfully',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
