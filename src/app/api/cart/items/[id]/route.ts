import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

// DELETE /api/cart/items/[id] - Remove item from cart
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: itemId } = await params

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (cartItem.cart.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Remove cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    // Fetch updated cart with items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            workflow: {
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
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Transform data for frontend
    const transformedCart = updatedCart
      ? {
          ...updatedCart,
          items: updatedCart.items.map((item) => ({
            ...item,
            workflow: {
              ...item.workflow,
              seller: {
                displayName: item.workflow.seller.displayName,
                storeName: item.workflow.seller.sellerProfile?.storeName,
                slug: item.workflow.seller.sellerProfile?.slug,
              },
            },
          })),
        }
      : null

    return NextResponse.json({
      cart: transformedCart,
      message: 'Item removed from cart successfully',
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
  }
}
