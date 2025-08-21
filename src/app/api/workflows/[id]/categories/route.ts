import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for category management
const manageCategoriesSchema = z.object({
  categoryIds: z.array(z.string().uuid()),
})

// Helper function for authentication
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

// PUT /api/workflows/[id]/categories - Update workflow categories
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authentication check
    const seller = await getAuthenticatedSeller()
    if (!seller) {
      return NextResponse.json({ error: 'Authentication required - must be a seller' }, { status: 401 })
    }

    const { id } = await params
    const workflowId = id

    // Check if workflow exists and belongs to seller
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { sellerId: true },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Access denied - not your workflow' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await req.json()
    const { categoryIds } = manageCategoriesSchema.parse(body)

    // Verify all categories exist
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })

    if (existingCategories.length !== categoryIds.length) {
      return NextResponse.json({ error: 'Some categories do not exist' }, { status: 400 })
    }

    // Update workflow categories using transaction
    await prisma.$transaction(async (tx) => {
      // Remove existing categories
      await tx.workflowCategory.deleteMany({
        where: { workflowId },
      })

      // Add new categories
      if (categoryIds.length > 0) {
        await tx.workflowCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            workflowId,
            categoryId,
          })),
        })
      }
    })

    // Fetch updated workflow with categories
    const updatedWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: updatedWorkflow,
      message: 'Workflow categories updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
