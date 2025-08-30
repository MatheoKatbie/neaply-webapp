import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
})

// PATCH /api/cart/items/[id] - Update cart item quantity
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Parse and validate request body
    const body = await request.json()
    const validation = updateCartItemSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { quantity } = validation.data

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

    // Update cart item
    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        updatedAt: new Date(),
      },
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
            pricingPlan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Transform data for frontend
    const transformedCart = {
      ...updatedCart,
      items:
        updatedCart?.items.map((item) => ({
          ...item,
          workflow: {
            ...item.workflow,
            seller: {
              displayName: item.workflow.seller.displayName,
              storeName: item.workflow.seller.sellerProfile?.storeName,
              slug: item.workflow.seller.sellerProfile?.slug,
            },
          },
        })) || [],
    }

    return NextResponse.json({
      cart: transformedCart,
      message: 'Cart item updated successfully',
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

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
            pricingPlan: true,
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
