import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, STRIPE_CONNECT_CONFIG } from '@/lib/stripe'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { ratelimit, checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import type { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '@/types/payment'

const createCheckoutSessionSchema = z.object({
  workflowId: z.string().uuid(),
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

    // Apply rate limiting (20 checkout attempts per hour)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const identifier = getRateLimitIdentifier(user.id, ip)
    const rateLimitResult = await checkRateLimit(ratelimit.checkout, identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many checkout attempts. Please try again later.',
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      )
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

    const { workflowId, successUrl, cancelUrl } = validation.data

    // Fetch workflow details with seller's Stripe Connect info
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
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

    // Check if seller has Stripe Connect account set up
    if (!workflow.seller.sellerProfile?.stripeAccountId) {
      return NextResponse.json(
        {
          error: 'Seller payment setup incomplete. Please contact the seller.',
        },
        { status: 400 }
      )
    }

    // Check if seller's Stripe Connect account is ready
    if (!workflow.seller.sellerProfile.stripeOnboardingCompleted) {
      return NextResponse.json(
        {
          error: 'Seller payment setup incomplete. Please contact the seller.',
        },
        { status: 400 }
      )
    }

    // Use workflow base price
    const priceCents = workflow.basePriceCents

    // Handle free workflows (0 price) - create completed order directly
    if (priceCents === 0) {
      // Create order directly for free workflows
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'paid',
          totalCents: 0,
          currency: workflow.currency,
          provider: 'free',
          paidAt: new Date(),
          items: {
            create: {
              workflowId: workflow.id,
              unitPriceCents: 0,
              quantity: 1,
              subtotalCents: 0,
            },
          },
        },
        include: {
          items: {
            include: {
              workflow: {
                include: {
                  seller: {
                    include: {
                      sellerProfile: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      // Update workflow sales count
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { salesCount: { increment: 1 } },
      })

      return NextResponse.json({
        data: {
          orderId: order.id,
          type: 'free',
          message: 'Free workflow purchased successfully',
        },
      })
    }

    // Create Stripe checkout session for paid workflows
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: workflow.currency.toLowerCase(),
            product_data: {
              name: workflow.title,
              description: workflow.shortDesc,
              images: workflow.heroImageUrl ? [workflow.heroImageUrl] : undefined,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancelled`,
      metadata: {
        workflowId: workflow.id,
        userId: user.id,
        sellerId: workflow.sellerId,
        orderType: 'workflow',
      },
      payment_intent_data: {
        application_fee_amount: Math.round(priceCents * 0.1), // 10% platform fee
        transfer_data: {
          destination: workflow.seller.sellerProfile!.stripeAccountId,
        },
      },
    })

    return NextResponse.json({
      data: {
        sessionId: session.id,
        url: session.url,
        type: 'stripe',
      },
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
