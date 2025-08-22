import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Check if review exists
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        status: 'published',
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if user is trying to vote on their own review
    if (review.userId === user.id) {
      return NextResponse.json({ error: 'You cannot vote on your own review' }, { status: 403 })
    }

    // Check if user already voted on this review
    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: user.id,
        },
      },
    })

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this review' }, { status: 409 })
    }

    // Create the helpful vote and update the review's helpful count
    await prisma.$transaction(async (tx) => {
      // Create the vote
      await tx.reviewHelpfulVote.create({
        data: {
          reviewId: reviewId,
          userId: user.id,
        },
      })

      // Update the review's helpful count
      await tx.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      })
    })

    return NextResponse.json({ message: 'Helpful vote added successfully' })
  } catch (error) {
    console.error('Add Helpful Vote API Error:', error)
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

    // Check if user has voted on this review
    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: user.id,
        },
      },
    })

    if (!existingVote) {
      return NextResponse.json({ error: 'You have not voted on this review' }, { status: 404 })
    }

    // Remove the helpful vote and update the review's helpful count
    await prisma.$transaction(async (tx) => {
      // Delete the vote
      await tx.reviewHelpfulVote.delete({
        where: {
          reviewId_userId: {
            reviewId: reviewId,
            userId: user.id,
          },
        },
      })

      // Update the review's helpful count
      await tx.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      })
    })

    return NextResponse.json({ message: 'Helpful vote removed successfully' })
  } catch (error) {
    console.error('Remove Helpful Vote API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
