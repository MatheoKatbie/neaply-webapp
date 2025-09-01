import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

const addToCartSchema = z.object({
  workflowId: z.string().uuid(),
})

// POST /api/cart/items - Add item to cart
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validation = addToCartSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { workflowId } = validation.data

    // Check if workflow exists and is published
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
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
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.status !== 'published') {
      return NextResponse.json({ error: 'Workflow is not available for purchase' }, { status: 400 })
    }

    // Find or create user's cart
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        workflowId: workflowId,
      },
    })

    if (existingItem) {
      // Return error - workflow already in cart
      return NextResponse.json({ error: 'This workflow is already in your cart' }, { status: 400 })
    }

    // Add new item to cart
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        workflowId: workflowId,
        quantity: 1, // Always 1 for now
      },
    })

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
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
            sellerId: item.workflow.sellerId,
            seller: {
              displayName: item.workflow.seller.displayName,
              storeName: item.workflow.seller.sellerProfile?.storeName,
              slug: item.workflow.seller.sellerProfile?.slug,
              sellerProfile: item.workflow.seller.sellerProfile,
            },
          },
        })) || [],
    }

    return NextResponse.json({
      cart: transformedCart,
      message: 'Item added to cart successfully',
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}
