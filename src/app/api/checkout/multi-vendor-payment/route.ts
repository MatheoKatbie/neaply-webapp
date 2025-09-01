import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, STRIPE_CONNECT_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

const multiVendorPaymentSchema = z.object({
  paymentMethodId: z.string(),
  cartId: z.string().uuid(),
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
    const validation = multiVendorPaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { paymentMethodId, cartId } = validation.data

    // Get user's Stripe customer ID
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    })

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
    }

    // Get user's cart with items
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        userId: user.id,
      },
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
                        stripeAccountId: true,
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
    }

    // Group items by seller
    const itemsBySeller = new Map<string, typeof cart.items>()
    for (const item of cart.items) {
      const sellerId = item.workflow.sellerId
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, [])
      }
      itemsBySeller.get(sellerId)!.push(item)
    }

    // Create orders and PaymentIntents for each seller
    const paymentResults: Array<{
      orderId: string
      sellerId: string
      sellerName: string
      amountCents: number
      paymentIntentId: string
      status: string
    }> = []

    const failedPayments: Array<{
      sellerId: string
      sellerName: string
      error: string
    }> = []

    for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
      const seller = sellerItems[0].workflow.seller

      // Calculate total for this seller
      let sellerTotalCents = 0
      const sellerOrderItems: any[] = []

      for (const item of sellerItems) {
        const priceCents = item.workflow.basePriceCents
        const subtotal = priceCents * item.quantity

        sellerTotalCents += subtotal

        sellerOrderItems.push({
          workflowId: item.workflowId,
          unitPriceCents: priceCents,
          quantity: item.quantity,
          subtotalCents: subtotal,
        })
      }

      try {
        // Create order for this seller
        const sellerOrder = await prisma.order.create({
          data: {
            userId: user.id,
            status: 'pending',
            totalCents: sellerTotalCents,
            currency: 'USD', // Assuming USD for now
            provider: 'stripe',
            metadata: {
              orderType: 'multi_vendor_cart',
              cartId: cartId,
              sellerId: sellerId,
            },
            items: {
              create: sellerOrderItems,
            },
          },
        })

        // Calculate platform fee for this seller (15% of seller total)
        const platformFeeAmount = Math.round(sellerTotalCents * (STRIPE_CONNECT_CONFIG.platformFeePercentage / 100))

        // Create PaymentIntent for this seller
        const paymentIntent = await stripe.paymentIntents.create({
          amount: sellerTotalCents,
          currency: 'usd',
          customer: dbUser.stripeCustomerId,
          payment_method: paymentMethodId,
          confirm: true,
          off_session: true,
          application_fee_amount: platformFeeAmount,
          transfer_data: {
            destination: seller.sellerProfile!.stripeAccountId!,
          },
          metadata: {
            orderId: sellerOrder.id,
            userId: user.id,
            sellerId: sellerId,
            cartId: cartId,
            orderType: 'multi_vendor_cart',
          },
        })

        // Update order with PaymentIntent ID
        await prisma.order.update({
          where: { id: sellerOrder.id },
          data: {
            providerIntent: paymentIntent.id,
            status: paymentIntent.status === 'succeeded' ? 'paid' : 'pending',
            paidAt: paymentIntent.status === 'succeeded' ? new Date() : null,
          },
        })

        paymentResults.push({
          orderId: sellerOrder.id,
          sellerId: sellerId,
          sellerName: seller.sellerProfile?.storeName || seller.displayName,
          amountCents: sellerTotalCents,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        })

        console.log(`✅ Payment successful for seller ${sellerId}:`, {
          orderId: sellerOrder.id,
          paymentIntentId: paymentIntent.id,
          amount: sellerTotalCents,
          status: paymentIntent.status,
        })
      } catch (error) {
        console.error(`❌ Payment failed for seller ${sellerId}:`, error)

        failedPayments.push({
          sellerId: sellerId,
          sellerName: seller.sellerProfile?.storeName || seller.displayName,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Clear cart if all payments succeeded
    if (failedPayments.length === 0) {
      await prisma.cart.delete({
        where: { id: cartId },
      })
    }

    return NextResponse.json({
      success: true,
      successfulPayments: paymentResults,
      failedPayments: failedPayments,
      allSucceeded: failedPayments.length === 0,
      totalProcessed: paymentResults.length + failedPayments.length,
    })
  } catch (error) {
    console.error('Error processing multi-vendor payment:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
