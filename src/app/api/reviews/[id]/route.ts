import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

// Schema for updating a review
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  bodyMd: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reviewId = id

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID format' }, { status: 400 })
    }

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        status: 'published',
      },
      include: {
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
        workflow: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        bodyMd: review.bodyMd,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        helpfulCount: review.helpfulCount,
        user: {
          displayName: review.user.displayName,
          avatarUrl: review.user.avatarUrl,
        },
        workflow: {
          title: review.workflow.title,
          slug: review.workflow.slug,
        },
      },
    })
  } catch (error) {
    console.error('Get Review API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const reviewId = id

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID format' }, { status: 400 })
    }

    const body = await req.json()
    const validatedData = updateReviewSchema.parse(body)

    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: user.id,
      },
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 })
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Update workflow rating statistics if rating changed
    if (validatedData.rating !== undefined) {
      await updateWorkflowRatingStats(existingReview.workflowId)
    }

    return NextResponse.json({
      data: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        bodyMd: updatedReview.bodyMd,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        helpfulCount: updatedReview.helpfulCount,
        user: {
          displayName: updatedReview.user.displayName,
          avatarUrl: updatedReview.user.avatarUrl,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Update Review API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const reviewId = id

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID format' }, { status: 400 })
    }

    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: user.id,
      },
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 })
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    })

    // Update workflow rating statistics
    await updateWorkflowRatingStats(existingReview.workflowId)

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete Review API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update workflow rating statistics
async function updateWorkflowRatingStats(workflowId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      workflowId,
      status: 'published',
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  })

  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      ratingAvg: stats._avg.rating || 0,
      ratingCount: stats._count.rating || 0,
    },
  })
}
