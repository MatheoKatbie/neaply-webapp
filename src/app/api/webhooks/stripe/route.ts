import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing Stripe webhook event:', event.type, 'ID:', event.id)

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object as Stripe.Charge)
          break

        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (handlerError) {
      console.error(`Error handling ${event.type} event:`, handlerError)
      // Return 500 to trigger retry for critical events
      if (event.type === 'checkout.session.completed') {
        return NextResponse.json({ error: 'Event processing failed' }, { status: 500 })
      }
      // For non-critical events, return 200 to avoid retries
      return NextResponse.json({ error: 'Event processing failed' }, { status: 200 })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout session completed:', session.id)

    const { orderId, userId, workflowId } = session.metadata || {}

    if (!orderId || !userId || !workflowId) {
      console.error('Missing metadata in checkout session:', session.metadata)
      return
    }

    // Get the payment intent to access charge information
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
    const charge = paymentIntent.latest_charge as Stripe.Charge

    if (!charge) {
      console.error('No charge found for payment intent:', session.payment_intent)
      return
    }

    // Update order status and create payment record
    await prisma.$transaction(async (tx) => {
      // First, check if order exists and get current status
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              workflow: true,
            },
          },
        },
      })

      if (!existingOrder) {
        console.error('Order not found:', orderId)
        throw new Error(`Order not found: ${orderId}`)
      }

      // Only update if order is not already paid
      if (existingOrder.status !== 'paid') {
        // Update order
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'paid',
            paidAt: new Date(),
            provider: 'stripe',
            providerIntent: session.id,
          },
          include: {
            items: {
              include: {
                workflow: true,
              },
            },
          },
        })

        // Create payment record
        await tx.payment.create({
          data: {
            orderId,
            provider: 'stripe',
            providerCharge: charge.id,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'eur',
            status: 'succeeded',
            processedAt: new Date(),
            rawPayload: session as any,
          },
        })

        // Increment sales count for each workflow in the order
        for (const item of updatedOrder.items) {
          await tx.workflow.update({
            where: { id: item.workflowId },
            data: {
              salesCount: {
                increment: item.quantity,
              },
            },
          })
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'order.completed',
            entityType: 'order',
            entityId: orderId,
            metadata: {
              orderId,
              workflowId,
              amount: session.amount_total,
              currency: session.currency,
              stripeSessionId: session.id,
            },
          },
        })

        console.log('Successfully processed checkout session completed for order:', orderId)
      } else {
        console.log('Order already paid, skipping duplicate processing:', orderId)
      }
    })
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
    throw error
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log('Processing charge refunded:', charge.id)

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        providerCharge: charge.id,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      console.error('Payment not found for charge:', charge.id)
      return
    }

    const refundAmount = charge.amount_refunded || 0
    const isFullRefund = refundAmount >= charge.amount

    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? 'refunded' : 'partial_refund',
          rawPayload: charge as any,
        },
      })

      // Update order status if fully refunded
      if (isFullRefund) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'refunded',
          },
        })

        // Decrement sales count for workflows
        for (const item of payment.order.items) {
          await tx.workflow.update({
            where: { id: item.workflowId },
            data: {
              salesCount: {
                decrement: item.quantity,
              },
            },
          })
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: payment.order.userId,
          action: isFullRefund ? 'order.refunded' : 'order.partial_refund',
          entityType: 'order',
          entityId: payment.orderId,
          metadata: {
            orderId: payment.orderId,
            chargeId: charge.id,
            refundAmount,
            isFullRefund,
          },
        },
      })
    })

    console.log('Successfully processed charge refunded for order:', payment.orderId)
  } catch (error) {
    console.error('Error handling charge refunded:', error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment intent succeeded:', paymentIntent.id)

    const charge = paymentIntent.latest_charge as Stripe.Charge
    if (charge) {
      const payment = await prisma.payment.findFirst({
        where: {
          providerCharge: charge.id,
        },
        include: {
          order: true,
        },
      })

      if (payment) {
        // Update payment status to succeeded and add payment intent metadata
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'succeeded',
            rawPayload: {
              ...(payment.rawPayload as any),
              paymentIntent,
            },
          },
        })

        // Also ensure the order is marked as paid if it isn't already
        if (payment.order.status !== 'paid') {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'paid',
              paidAt: new Date(),
              provider: 'stripe',
              providerIntent: paymentIntent.id,
            },
          })
        }

        console.log('Successfully updated payment status for payment intent:', paymentIntent.id)
      } else {
        console.log('No payment record found for charge:', charge.id)
      }
    } else {
      console.log('No charge found for payment intent:', paymentIntent.id)
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
    // Don't throw here as this is supplementary processing
  }
}
