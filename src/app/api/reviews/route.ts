import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

// Schema for creating a review
const createReviewSchema = z.object({
  workflowId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  bodyMd: z.string().optional(),
})

// Schema for querying reviews
const reviewQuerySchema = z.object({
  workflowId: z.string().uuid().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sortBy: z.enum(['newest', 'oldest', 'rating-high', 'rating-low', 'helpful']).optional().default('newest'),
})

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if user owns the workflow (has a paid or pending order)
    const userOwnsWorkflow = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['paid', 'pending'],
        },
        items: {
          some: {
            workflowId: validatedData.workflowId,
          },
        },
      },
    })

    if (!userOwnsWorkflow) {
      return NextResponse.json(
        { error: 'You must purchase this workflow before leaving a review' },
        { status: 403 }
      )
    }

    // Check if user already reviewed this workflow
    const existingReview = await prisma.review.findUnique({
      where: {
        workflowId_userId: {
          workflowId: validatedData.workflowId,
          userId: user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this workflow' },
        { status: 409 }
      )
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        workflowId: validatedData.workflowId,
        userId: user.id,
        rating: validatedData.rating,
        title: validatedData.title,
        bodyMd: validatedData.bodyMd,
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

    // Update workflow rating statistics
    await updateWorkflowRatingStats(validatedData.workflowId)

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

    console.error('Create Review API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = reviewQuerySchema.parse(queryParams)

    const page = parseInt(validatedParams.page)
    const limit = Math.min(parseInt(validatedParams.limit), 50) // Max 50 reviews per page
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'published', // Only show published reviews
    }

    if (validatedParams.workflowId) {
      where.workflowId = validatedParams.workflowId
    }

    // Build order by clause
    let orderBy: any = {}
    switch (validatedParams.sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'rating-high':
        orderBy = { rating: 'desc' }
        break
      case 'rating-low':
        orderBy = { rating: 'asc' }
        break
      case 'helpful':
        orderBy = { helpfulCount: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Fetch reviews and total count
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Transform data for frontend
    const transformedReviews = reviews.map((review) => ({
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
      workflow: validatedParams.workflowId
        ? undefined
        : {
            title: review.workflow.title,
            slug: review.workflow.slug,
          },
    }))

    return NextResponse.json({
      data: transformedReviews,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Get Reviews API Error:', error)
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
