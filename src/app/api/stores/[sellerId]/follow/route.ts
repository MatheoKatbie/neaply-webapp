import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/stores/[sellerId]/follow
 * Check if current user follows this store
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isFollowing: false, followersCount: 0 })
    }

    // Check if user follows this store
    const follow = await prisma.storeFollow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: user.id,
          sellerId,
        },
      },
    })

    // Get followers count
    const followersCount = await prisma.storeFollow.count({
      where: { sellerId },
    })

    return NextResponse.json({
      isFollowing: !!follow,
      followersCount,
    })
  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stores/[sellerId]/follow
 * Follow a store
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, isSeller: true },
      include: { sellerProfile: true },
    })

    if (!seller || !seller.sellerProfile) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Cannot follow yourself
    if (user.id === sellerId) {
      return NextResponse.json(
        { error: 'You cannot follow your own store' },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.storeFollow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: user.id,
          sellerId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this store' },
        { status: 400 }
      )
    }

    // Create follow
    const follow = await prisma.storeFollow.create({
      data: {
        followerId: user.id,
        sellerId,
      },
    })

    // Get current user info for notification
    const follower = await prisma.user.findUnique({
      where: { id: user.id },
      select: { displayName: true },
    })

    // Create notification for the seller
    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'new_follower',
        title: 'Nouveau follower ! 👥',
        message: `${follower?.displayName || 'Un utilisateur'} suit maintenant votre store`,
        link: `/store/${seller.sellerProfile.slug}`,
        metadata: {
          followerId: user.id,
          followerName: follower?.displayName,
        },
      },
    })

    // Get updated count
    const followersCount = await prisma.storeFollow.count({
      where: { sellerId },
    })

    return NextResponse.json({
      success: true,
      isFollowing: true,
      followersCount,
      followedAt: follow.createdAt,
    })
  } catch (error) {
    console.error('Error following store:', error)
    return NextResponse.json(
      { error: 'Failed to follow store' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stores/[sellerId]/follow
 * Unfollow a store
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Delete follow
    await prisma.storeFollow.delete({
      where: {
        followerId_sellerId: {
          followerId: user.id,
          sellerId,
        },
      },
    })

    // Get updated count
    const followersCount = await prisma.storeFollow.count({
      where: { sellerId },
    })

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followersCount,
    })
  } catch (error) {
    console.error('Error unfollowing store:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow store' },
      { status: 500 }
    )
  }
}
