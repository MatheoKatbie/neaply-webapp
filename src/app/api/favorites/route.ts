import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

// GET /api/favorites - Get user's favorite workflows
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        workflow: {
          include: {
            seller: {
              include: {
                sellerProfile: true,
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
            _count: {
              select: {
                reviews: true,
                favorites: true,
                orderItems: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to match the expected format
    const transformedFavorites = favorites.map((favorite) => ({
      id: favorite.workflow.id,
      title: favorite.workflow.title,
      description: favorite.workflow.shortDesc,
      price: favorite.workflow.basePriceCents,
      currency: favorite.workflow.currency,
      seller: {
        id: favorite.workflow.seller.id,
        name: favorite.workflow.seller.sellerProfile?.storeName || favorite.workflow.seller.displayName,
        slug: favorite.workflow.seller.sellerProfile?.slug || '',
      },
      rating: parseFloat(favorite.workflow.ratingAvg.toString()),
      ratingCount: favorite.workflow.ratingCount,
      salesCount: favorite.workflow.salesCount,
      heroImage: favorite.workflow.heroImageUrl,
      categories: favorite.workflow.categories.map((cat) => cat.category.name),
      tags: favorite.workflow.tags.map((tag) => tag.tag.name),
      isFavorite: true,
      favoritedAt: favorite.createdAt,
    }))

    return NextResponse.json({
      success: true,
      favorites: transformedFavorites,
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST /api/favorites - Add workflow to favorites
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { workflowId } = await request.json()

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    // Check if workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_workflowId: {
          userId: user.id,
          workflowId: workflowId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json({ error: 'Workflow already in favorites' }, { status: 409 })
    }

    // Add to favorites
    await prisma.favorite.create({
      data: {
        userId: user.id,
        workflowId: workflowId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Workflow added to favorites',
    })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 })
  }
}

// DELETE /api/favorites - Remove workflow from favorites
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { workflowId } = await request.json()

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    // Remove from favorites
    const deletedFavorite = await prisma.favorite
      .delete({
        where: {
          userId_workflowId: {
            userId: user.id,
            workflowId: workflowId,
          },
        },
      })
      .catch(() => null)

    if (!deletedFavorite) {
      return NextResponse.json({ error: 'Workflow not in favorites' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow removed from favorites',
    })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 })
  }
}
