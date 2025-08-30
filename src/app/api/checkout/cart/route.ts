import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, STRIPE_CONNECT_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

const createCartCheckoutSessionSchema = z.object({
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
    const validation = createCartCheckoutSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { successUrl, cancelUrl } = validation.data

    // Get user's cart with items
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
                  include: {
                    sellerProfile: true,
                  },
                },
              },
            },
            pricingPlan: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate all workflows are published and sellers have Stripe accounts
    for (const item of cart.items) {
      if (item.workflow.status !== 'published') {
        return NextResponse.json(
          { error: `Workflow "${item.workflow.title}" is not available for purchase` },
          { status: 400 }
        )
      }

      if (!item.workflow.seller.sellerProfile?.stripeAccountId) {
        return NextResponse.json(
          {
            error: `Seller payment setup incomplete for "${item.workflow.title}". Please contact the seller.`,
          },
          { status: 400 }
        )
      }

      if (!item.workflow.seller.sellerProfile.stripeOnboardingCompleted) {
        return NextResponse.json(
          {
            error: `Seller payment setup incomplete for "${item.workflow.title}". Please contact the seller.`,
          },
          { status: 400 }
        )
      }

      // Check if user already owns this workflow
      const existingPurchase = await prisma.orderItem.findFirst({
        where: {
          workflowId: item.workflowId,
          order: {
            userId: user.id,
            status: 'paid',
          },
        },
      })

      if (existingPurchase) {
        return NextResponse.json({ error: `You already own "${item.workflow.title}"` }, { status: 400 })
      }
    }

    // Calculate total and validate currency consistency
    let totalCents = 0
    let currency = ''
    const orderItems: any[] = []

    for (const item of cart.items) {
      const priceCents = item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
      const itemCurrency = item.pricingPlan ? item.pricingPlan.currency : item.workflow.currency
      const subtotal = priceCents * item.quantity

      if (currency === '') {
        currency = itemCurrency
      } else if (currency !== itemCurrency) {
        return NextResponse.json({ error: 'All items must use the same currency' }, { status: 400 })
      }

      totalCents += subtotal

      orderItems.push({
        workflowId: item.workflowId,
        unitPriceCents: priceCents,
        quantity: item.quantity,
        subtotalCents: subtotal,
        pricingPlanId: item.pricingPlanId || undefined,
      })
    }

    // Handle free total (all items are free)
    if (totalCents === 0) {
      const freeOrder = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'paid',
          totalCents: 0,
          currency: currency || 'USD',
          provider: 'free',
          paidAt: new Date(),
          items: {
            create: orderItems,
          },
        },
      })

      // Clear the cart after successful purchase
      await prisma.cart.delete({
        where: { id: cart.id },
      })

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const successUrl = `${baseUrl}/checkout/success?order_id=${freeOrder.id}`

      return NextResponse.json({
        sessionId: null,
        url: successUrl,
        orderId: freeOrder.id,
        isFree: true,
      })
    }

    if (totalCents < 0) {
      return NextResponse.json({ error: 'Invalid total price' }, { status: 400 })
    }

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'pending',
        totalCents,
        currency,
        provider: 'stripe',
        items: {
          create: orderItems,
        },
      },
    })

    // Group items by seller for Stripe Connect
    const itemsBySeller = new Map<string, typeof cart.items>()
    for (const item of cart.items) {
      const sellerId = item.workflow.sellerId
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, [])
      }
      itemsBySeller.get(sellerId)!.push(item)
    }

    // Handle cart checkout - single or multi-seller
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // If single seller, create one order and one session (simpler UX)
    if (itemsBySeller.size === 1) {
      const [sellerId, sellerItems] = Array.from(itemsBySeller.entries())[0]
      const seller = sellerItems[0].workflow.seller

      // Create single order with all items
      const singleOrder = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'pending',
          totalCents,
          currency,
          provider: 'stripe',
          items: {
            create: orderItems,
          },
        },
      })

      console.log('🛒 Cart checkout - Single order created:', {
        orderId: singleOrder.id,
        sellerId,
        totalCents,
        itemsCount: orderItems.length,
      })

      // Build line items for Stripe
      const lineItems = cart.items.map((item) => {
        const price = item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.workflow.title,
              description: item.workflow.shortDesc,
              images: item.workflow.heroImageUrl ? [item.workflow.heroImageUrl] : undefined,
              metadata: {
                workflowId: item.workflowId,
                sellerId: item.workflow.sellerId,
                storeName: seller.sellerProfile?.storeName || seller.displayName,
              },
            },
            unit_amount: price,
          },
          quantity: item.quantity,
        }
      })

      // Calculate platform fee (15% of total)
      const platformFeeAmount = Math.round(totalCents * (STRIPE_CONNECT_CONFIG.platformFeePercentage / 100))

      const metadata: Record<string, string> = {
        orderId: singleOrder.id,
        userId: user.id,
        cartId: cart.id,
        sellerId: sellerId,
        sellerAccountId: seller.sellerProfile!.stripeAccountId!,
        orderType: 'cart',
        isMultiSeller: 'false',
      }

      console.log('🛒 Cart checkout - Stripe session metadata for single seller:', metadata)

      // Create Stripe session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        metadata,
        success_url:
          successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${singleOrder.id}`,
        cancel_url: cancelUrl || `${baseUrl}/checkout/cancelled?order_id=${singleOrder.id}`,
        customer_email: user.email,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
        // Stripe Connect configuration
        payment_intent_data: {
          application_fee_amount: platformFeeAmount,
          transfer_data: {
            destination: seller.sellerProfile!.stripeAccountId!,
          },
        },
      })

      // Update order with Stripe session ID
      await prisma.order.update({
        where: { id: singleOrder.id },
        data: {
          providerIntent: session.id,
        },
      })

      console.log('🛒 Cart checkout - Stripe session created for single seller:', {
        sessionId: session.id,
        orderId: singleOrder.id,
        url: session.url,
      })

      return NextResponse.json({
        sessionId: session.id,
        url: session.url!,
        orderId: singleOrder.id,
        isMultiSeller: false,
      })
    }

    // Multi-seller case: create separate orders and sessions
    const ordersBySeller: Array<{
      order: any
      seller: any
      items: typeof cart.items
      sessionUrl: string
    }> = []

    // Create separate orders for each seller
    for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
      const seller = sellerItems[0].workflow.seller

      // Calculate total for this seller
      let sellerTotalCents = 0
      const sellerOrderItems: any[] = []

      for (const item of sellerItems) {
        const priceCents = item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
        const subtotal = priceCents * item.quantity

        sellerTotalCents += subtotal

        sellerOrderItems.push({
          workflowId: item.workflowId,
          unitPriceCents: priceCents,
          quantity: item.quantity,
          subtotalCents: subtotal,
          pricingPlanId: item.pricingPlanId || undefined,
        })
      }

      // Create order for this seller
      const sellerOrder = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'pending',
          totalCents: sellerTotalCents,
          currency,
          provider: 'stripe',
          items: {
            create: sellerOrderItems,
          },
        },
      })

      console.log(`🛒 Cart checkout - Order created for seller ${sellerId}:`, {
        orderId: sellerOrder.id,
        sellerId,
        sellerTotalCents,
        itemsCount: sellerOrderItems.length,
      })

      // Build line items for this seller
      const lineItems = sellerItems.map((item) => {
        const price = item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.workflow.title,
              description: item.workflow.shortDesc,
              images: item.workflow.heroImageUrl ? [item.workflow.heroImageUrl] : undefined,
              metadata: {
                workflowId: item.workflowId,
                sellerId: item.workflow.sellerId,
                storeName: seller.sellerProfile?.storeName || seller.displayName,
              },
            },
            unit_amount: price,
          },
          quantity: item.quantity,
        }
      })

      // Calculate platform fee for this seller (15% of seller total)
      const platformFeeAmount = Math.round(sellerTotalCents * (STRIPE_CONNECT_CONFIG.platformFeePercentage / 100))

      const metadata: Record<string, string> = {
        orderId: sellerOrder.id,
        userId: user.id,
        cartId: cart.id,
        sellerId: sellerId,
        sellerAccountId: seller.sellerProfile!.stripeAccountId!,
        orderType: 'cart',
        isMultiSeller: itemsBySeller.size > 1 ? 'true' : 'false',
        sellerTotal: sellerTotalCents.toString(),
      }

      console.log(`🛒 Cart checkout - Stripe session metadata for seller ${sellerId}:`, metadata)

      // Create Stripe session for this seller
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        metadata,
        success_url:
          successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${sellerOrder.id}`,
        cancel_url: cancelUrl || `${baseUrl}/checkout/cancelled?order_id=${sellerOrder.id}`,
        customer_email: user.email,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
        // Stripe Connect configuration
        payment_intent_data: {
          application_fee_amount: platformFeeAmount,
          transfer_data: {
            destination: seller.sellerProfile!.stripeAccountId!,
          },
        },
      })

      // Update order with Stripe session ID
      await prisma.order.update({
        where: { id: sellerOrder.id },
        data: {
          providerIntent: session.id,
        },
      })

      console.log(`🛒 Cart checkout - Stripe session created for seller ${sellerId}:`, {
        sessionId: session.id,
        orderId: sellerOrder.id,
        url: session.url,
      })

      ordersBySeller.push({
        order: sellerOrder,
        seller,
        items: sellerItems,
        sessionUrl: session.url!,
      })
    }

    // For multi-seller carts, return all session URLs
    if (itemsBySeller.size > 1) {
      return NextResponse.json({
        isMultiSeller: true,
        sessions: ordersBySeller.map(({ order, seller, sessionUrl }) => ({
          orderId: order.id,
          sellerId: seller.id,
          sellerName: seller.sellerProfile?.storeName || seller.displayName,
          sessionUrl,
          totalCents: order.totalCents,
        })),
        totalOrdersCount: ordersBySeller.length,
        message: 'Multiple checkout sessions created for different sellers',
      })
    }

    // For single seller, return the traditional response
    const singleOrder = ordersBySeller[0]
    return NextResponse.json({
      sessionId: singleOrder.order.providerIntent,
      url: singleOrder.sessionUrl,
      orderId: singleOrder.order.id,
      isMultiSeller: false,
    })
  } catch (error) {
    console.error('Error creating cart checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
