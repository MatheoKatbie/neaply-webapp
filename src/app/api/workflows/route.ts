import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour un workflow
const createWorkflowSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  shortDesc: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(200, 'Short description cannot exceed 200 characters'),
  longDescMd: z
    .string()
    .min(10, 'Long description must be at least 10 characters')
    .max(5000, 'Long description cannot exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  heroImageUrl: z.string().url('Hero image URL must be valid').optional().or(z.literal('')),
  basePriceCents: z.number().min(0, 'Base price cannot be negative').max(100000, 'Base price cannot exceed €1000.00'),
  currency: z.string().default('EUR'),
  status: z.enum(['draft', 'published', 'unlisted', 'disabled']).default('draft'),
  jsonContent: z.any().optional(),
  n8nMinVersion: z.string().optional().or(z.literal('')),
  n8nMaxVersion: z.string().optional().or(z.literal('')),
  categoryIds: z.array(z.string()).min(1, 'At least one category must be selected'),
  tagIds: z.array(z.string()).min(1, 'At least one tag must be selected'),
})

const updateWorkflowSchema = createWorkflowSchema.partial()

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

  // Vérifier si l'utilisateur existe et est seller
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
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const seller = await getAuthenticatedSeller()
    if (!seller) {
      return NextResponse.json({ error: 'Authentication required - must be a seller' }, { status: 401 })
    }

    // Parse et validation du body
    const body = await req.json()
    console.log('Received body:', body) // Debug

    const validatedData = createWorkflowSchema.parse(body)

    // Générer un slug unique pour le workflow
    let baseSlug = generateSlug(validatedData.title)
    let slug = baseSlug
    let counter = 1

    // Vérifier l'unicité du slug
    while (true) {
      const existingSlug = await prisma.workflow.findUnique({
        where: { slug },
      })

      if (!existingSlug) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Utiliser une transaction pour créer le workflow et sa version
    const result = await prisma.$transaction(async (tx) => {
      // Créer le workflow
      const workflow = await tx.workflow.create({
        data: {
          sellerId: seller.id,
          title: validatedData.title,
          slug,
          shortDesc: validatedData.shortDesc,
          longDescMd: validatedData.longDescMd || null,
          heroImageUrl: validatedData.heroImageUrl || null,
          basePriceCents: validatedData.basePriceCents,
          currency: validatedData.currency,
          status: validatedData.status,
        },
      })

      // Créer la première version si du JSON est fourni
      if (validatedData.jsonContent) {
        await tx.workflowVersion.create({
          data: {
            workflowId: workflow.id,
            semver: '1.0.0',
            jsonContent: validatedData.jsonContent,
            n8nMinVersion: validatedData.n8nMinVersion || null,
            n8nMaxVersion: validatedData.n8nMaxVersion || null,
            isLatest: true,
          },
        })
      }

      // Créer les relations avec les catégories
      if (validatedData.categoryIds && validatedData.categoryIds.length > 0) {
        await tx.workflowCategory.createMany({
          data: validatedData.categoryIds.map((categoryId: string) => ({
            workflowId: workflow.id,
            categoryId: categoryId,
          })),
        })
      }

      // Créer les relations avec les tags
      if (validatedData.tagIds && validatedData.tagIds.length > 0) {
        await tx.workflowTag.createMany({
          data: validatedData.tagIds.map((tagId: string) => ({
            workflowId: workflow.id,
            tagId: tagId,
          })),
        })
      }

      // Récupérer le workflow avec toutes les relations
      return await tx.workflow.findUnique({
        where: { id: workflow.id },
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

    const workflow = result!

    // No need to convert UUIDs to strings - they're already strings

    return NextResponse.json(
      {
        data: workflow,
        message: 'Workflow created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues) // Debug
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

export async function GET(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const seller = await getAuthenticatedSeller()
    if (!seller) {
      return NextResponse.json({ error: 'Authentication required - must be a seller' }, { status: 401 })
    }

    // Paramètres de requête
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {
      sellerId: seller.id,
    }

    if (status && ['draft', 'published', 'unlisted', 'disabled'].includes(status)) {
      where.status = status
    }

    // Récupérer les workflows du seller
    const [workflows, totalCount] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          versions: {
            where: { isLatest: true },
            take: 1,
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
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workflow.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // No need to convert UUIDs to strings - they're already strings

    return NextResponse.json({
      data: workflows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
