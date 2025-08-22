import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import type { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '@/types/payment'

const createCheckoutSessionSchema = z.object({
  workflowId: z.string().uuid(),
  pricingPlanId: z.string().uuid().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

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
    const validation = createCheckoutSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { workflowId, pricingPlanId, successUrl, cancelUrl } = validation.data

    // Fetch workflow details
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        plans: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        seller: {
          include: {
            sellerProfile: true,
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

    // Determine pricing
    let priceCents: number
    let pricingPlan: any = null

    if (pricingPlanId) {
      pricingPlan = workflow.plans.find((plan) => plan.id === pricingPlanId)
      if (!pricingPlan) {
        return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
      }
      priceCents = pricingPlan.priceCents
    } else {
      priceCents = workflow.basePriceCents
    }

    if (priceCents <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
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

    // Create pending order
    const orderData: any = {
      userId: user.id,
      status: 'pending',
      totalCents: priceCents,
      currency: workflow.currency,
      provider: 'stripe',
      items: {
        create: {
          workflowId,
          unitPriceCents: priceCents,
          quantity: 1,
          subtotalCents: priceCents,
        },
      },
    }

    // Only include pricingPlanId if it has a value
    if (pricingPlanId) {
      orderData.items.create.pricingPlanId = pricingPlanId
    }

    const order = await prisma.order.create({
      data: orderData,
    })

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Prepare metadata - only include pricingPlanId if it has a value
    const metadata: Record<string, string> = {
      orderId: order.id,
      userId: user.id,
      workflowId,
    }

    if (pricingPlanId) {
      metadata.pricingPlanId = pricingPlanId
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: workflow.currency.toLowerCase(),
            product_data: {
              name: workflow.title,
              description: workflow.shortDesc,
              images: workflow.heroImageUrl ? [workflow.heroImageUrl] : undefined,
              metadata: {
                workflowId,
                sellerId: workflow.sellerId,
                storeName: workflow.seller.sellerProfile?.storeName || workflow.seller.displayName,
              },
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: cancelUrl || `${baseUrl}/checkout/cancelled?order_id=${order.id}`,
      customer_email: user.email,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        providerIntent: session.id,
      },
    })

    const response: CreateCheckoutSessionResponse = {
      sessionId: session.id,
      url: session.url!,
      orderId: order.id,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
