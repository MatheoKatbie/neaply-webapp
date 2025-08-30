import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

const addToCartSchema = z.object({
  workflowId: z.string().uuid(),
  pricingPlanId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(10).default(1),
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

    const { workflowId, pricingPlanId, quantity } = validation.data

    // Check if workflow exists and is published
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        plans: pricingPlanId
          ? {
              where: { id: pricingPlanId, isActive: true },
            }
          : false,
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.status !== 'published') {
      return NextResponse.json({ error: 'Workflow is not available for purchase' }, { status: 400 })
    }

    // If pricing plan is specified, validate it
    if (pricingPlanId) {
      const plan = workflow.plans && workflow.plans.find((p) => p.id === pricingPlanId)
      if (!plan) {
        return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
      }
    }

    // Check if user already owns this workflow
    const existingPurchase = await prisma.orderItem.findFirst({
      where: {
        workflowId,
        order: {
          userId: user.id,
          status: 'paid',
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'You already own this workflow' }, { status: 400 })
    }

    // Find or create user's cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      })
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        workflowId,
        pricingPlanId: pricingPlanId || null,
      },
    })

    if (existingCartItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          workflowId,
          pricingPlanId,
          quantity,
        },
      })
    }

    // Fetch updated cart with items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
      message: 'Item added to cart successfully',
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}
