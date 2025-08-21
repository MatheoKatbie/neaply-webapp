import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for tag management
const manageTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()),
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

// PUT /api/workflows/[id]/tags - Update workflow tags
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
    const { tagIds } = manageTagsSchema.parse(body)

    // Verify all tags exist
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
    })

    if (existingTags.length !== tagIds.length) {
      return NextResponse.json({ error: 'Some tags do not exist' }, { status: 400 })
    }

    // Update workflow tags using transaction
    await prisma.$transaction(async (tx) => {
      // Remove existing tags
      await tx.workflowTag.deleteMany({
        where: { workflowId },
      })

      // Add new tags
      if (tagIds.length > 0) {
        await tx.workflowTag.createMany({
          data: tagIds.map((tagId) => ({
            workflowId,
            tagId,
          })),
        })
      }
    })

    // Fetch updated workflow with tags
    const updatedWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: updatedWorkflow,
      message: 'Workflow tags updated successfully',
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
