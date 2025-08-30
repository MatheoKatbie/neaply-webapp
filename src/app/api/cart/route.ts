import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            workflow: {
              include: {
                seller: {
                  select: {
                    id: true,
                    displayName: true,
                    sellerProfile: {
                      select: {
                        storeName: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
            pricingPlan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Transform data for frontend
    const transformedCart = {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        workflow: {
          ...item.workflow,
          sellerId: item.workflow.sellerId,
          seller: {
            id: item.workflow.seller.id,
            displayName: item.workflow.seller.displayName,
            storeName: item.workflow.seller.sellerProfile?.storeName,
            slug: item.workflow.seller.sellerProfile?.slug,
            sellerProfile: item.workflow.seller.sellerProfile,
          },
        },
      })),
    }

    return NextResponse.json({
      cart: transformedCart,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// DELETE /api/cart - Clear user's cart
export async function DELETE() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user's cart (cascade will delete items)
    await prisma.cart.deleteMany({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
