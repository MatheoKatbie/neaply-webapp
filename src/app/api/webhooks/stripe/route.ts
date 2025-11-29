import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { notifySellerNewOrder, notifyBuyerOrderConfirmed, notifyBuyerOrderRefunded } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook received')

    const body = await request.text()
    console.log('📝 Request body length:', body.length)

    // Verify webhook signature
    let event: Stripe.Event
    try {
      const headersList = await headers()
      const signature = headersList.get('stripe-signature')
      if (!signature) {
        console.error('[Stripe Webhook] Missing stripe-signature header')
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log(`[Stripe Webhook] Event received: ${event.type} (${event.id})`)
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // IDEMPOTENCY CHECK: Verify if event has already been processed
    const existingEvent = await prisma.processedStripeEvent.findUnique({
      where: { id: event.id },
    })

    if (existingEvent) {
      console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, skipped: true, reason: 'already_processed' })
    }

    console.log('📋 Processing Stripe webhook event:', event.type, 'ID:', event.id)

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

      // Mark event as processed after successful handling
      await prisma.processedStripeEvent.create({
        data: {
          id: event.id,
          type: event.type,
          processed: true,
        },
      })
      console.log(`[Stripe Webhook] Event ${event.id} marked as processed`)
    } catch (handlerError) {
      console.error(`Error handling ${event.type} event:`, handlerError)

      // Log detailed error information
      if (handlerError instanceof Error) {
        console.error('Error message:', handlerError.message)
        console.error('Error stack:', handlerError.stack)
      }

      // Return 500 to trigger retry for critical events
      if (event.type === 'checkout.session.completed') {
        return NextResponse.json(
          {
            error: 'Event processing failed',
            details: handlerError instanceof Error ? handlerError.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
      // For non-critical events, return 200 to avoid retries
      return NextResponse.json(
        {
          error: 'Event processing failed',
          details: handlerError instanceof Error ? handlerError.message : 'Unknown error',
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { orderId, userId, workflowId, packId, orderType } = session.metadata || {}

    if (!orderId || !userId) {
      console.error('Missing required metadata in checkout session:', session.metadata)
      return
    }

    // Check if this is a pack order, workflow order, or cart order
    const isPackOrder = orderType === 'pack'
    const isCartOrder = orderType === 'cart'

    if (isPackOrder && !packId) {
      console.error('Missing packId for pack order:', session.metadata)
      return
    }

    // For cart orders, we don't need workflowId in metadata as it's in the order items
    if (!isPackOrder && !isCartOrder && !workflowId) {
      console.error('Missing workflowId for workflow order:', session.metadata)
      return
    }

    // Get the payment intent to access charge information
    console.log('Retrieving payment intent:', session.payment_intent)
    let paymentIntent: Stripe.PaymentIntent
    let charge: Stripe.Charge

    try {
      paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
      console.log('Payment intent retrieved:', paymentIntent.id)

      if (!paymentIntent.latest_charge) {
        console.error('No charge found for payment intent:', session.payment_intent)
        return
      }

      // Retrieve the actual charge object
      charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string)
      console.log('Found charge:', charge.id)
    } catch (error) {
      console.error('Error retrieving payment intent or charge:', error)
      throw new Error(
        `Failed to retrieve payment information: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // Validate required fields
    if (!charge.id || typeof charge.id !== 'string' || charge.id.trim() === '') {
      console.error('Charge ID is missing or invalid:', charge.id)
      throw new Error('Valid charge ID is required')
    }

    if (!session.amount_total) {
      console.error('Session amount total is missing')
      throw new Error('Session amount total is required')
    }

    if (!session.currency) {
      console.error('Session currency is missing')
      throw new Error('Session currency is required')
    }

    // Update order status and create payment record
    await prisma.$transaction(async (tx) => {
      console.log('Starting database transaction for order:', orderId)

      // First, check if order exists and get current status
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              workflow: true,
            },
          },
          packItems: {
            include: {
              pack: true,
            },
          },
        },
      })

      if (!existingOrder) {
        console.error('Order not found:', orderId)
        // For test orders, just log and return without throwing error
        if (orderId.startsWith('test-')) {
          console.log('Test order detected, skipping database update:', orderId)
          return
        }
        throw new Error(`Order not found: ${orderId}`)
      }

      console.log('Found existing order:', {
        id: existingOrder.id,
        status: existingOrder.status,
        itemsCount: existingOrder.items.length,
      })

      // Only update if order is not already paid
      if (existingOrder.status !== 'paid') {
        console.log('Updating order status to paid')

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
            packItems: {
              include: {
                pack: true,
              },
            },
          },
        })

        console.log('Order updated successfully')

        // Check if payment record already exists
        const existingPayment = await tx.payment.findFirst({
          where: {
            orderId,
            provider: 'stripe',
            providerCharge: charge.id,
          },
        })

        if (existingPayment) {
          console.log('Payment record already exists for this order and charge:', existingPayment.id)
        } else {
          // Create payment record
          console.log('Creating payment record with charge ID:', charge.id)
          const paymentData = {
            orderId,
            provider: 'stripe',
            providerCharge: charge.id,
            amountCents: session.amount_total || 0,
            currency: (session.currency || 'eur').toUpperCase(),
            status: 'succeeded' as const,
            processedAt: new Date(),
            rawPayload: session as any,
          }

          console.log('Payment data:', JSON.stringify(paymentData, null, 2))

          try {
            const createdPayment = await tx.payment.create({
              data: paymentData,
            })
            console.log('Payment created successfully with ID:', createdPayment.id)
          } catch (paymentError) {
            console.error('Failed to create payment record:', paymentError)
            console.error('Payment data that failed:', JSON.stringify(paymentData, null, 2))
            throw paymentError
          }

          console.log('Payment record created successfully')
        }

        // Increment sales count for workflows or packs
        if (updatedOrder.items.length > 0) {
          console.log('Incrementing sales count for workflows')
          for (const item of updatedOrder.items) {
            console.log('Updating workflow sales count:', item.workflowId)
            await tx.workflow.update({
              where: { id: item.workflowId },
              data: {
                salesCount: {
                  increment: item.quantity,
                },
              },
            })
          }
        }

        if (updatedOrder.packItems.length > 0) {
          console.log('Incrementing sales count for packs')
          for (const packItem of updatedOrder.packItems) {
            console.log('Updating pack sales count:', packItem.packId)
            await tx.workflowPack.update({
              where: { id: packItem.packId },
              data: {
                salesCount: {
                  increment: packItem.quantity,
                },
              },
            })

            // Also increment individual workflow sales for pack workflows
            const packWithWorkflows = await tx.workflowPack.findUnique({
              where: { id: packItem.packId },
              include: {
                workflows: true,
              },
            })

            if (packWithWorkflows) {
              for (const packWorkflow of packWithWorkflows.workflows) {
                await tx.workflow.update({
                  where: { id: packWorkflow.workflowId },
                  data: {
                    salesCount: {
                      increment: packItem.quantity,
                    },
                  },
                })
              }
            }
          }
        }

        // Clear cart if this was a cart checkout
        const cartId = session.metadata?.cartId
        const isMultiSeller = session.metadata?.isMultiSeller === 'true'

        if (cartId) {
          console.log('Processing cart cleanup for cartId:', cartId, 'isMultiSeller:', isMultiSeller)

          if (isMultiSeller) {
            // For multi-seller carts, only clear if all related orders are paid
            console.log('Multi-seller cart detected, checking all related orders')

            // Find all pending orders that share the same cartId
            const pendingOrdersWithSameCart = await tx.order.count({
              where: {
                AND: [
                  {
                    OR: [
                      { providerIntent: { contains: cartId } }, // Fallback search
                      {
                        // More precise: find orders created around the same time with same user
                        userId: updatedOrder.userId,
                        createdAt: {
                          gte: new Date(new Date(updatedOrder.createdAt).getTime() - 5 * 60 * 1000), // 5 minutes before
                          lte: new Date(new Date(updatedOrder.createdAt).getTime() + 5 * 60 * 1000), // 5 minutes after
                        },
                      },
                    ],
                  },
                  { status: 'pending' },
                ],
              },
            })

            console.log('Pending orders with same cart found:', pendingOrdersWithSameCart)

            if (pendingOrdersWithSameCart === 0) {
              console.log('No more pending orders for this cart, clearing cart:', cartId)
              try {
                await tx.cart.delete({
                  where: { id: cartId },
                })
                console.log('Multi-seller cart cleared successfully')
              } catch (cartError) {
                console.error('Error clearing multi-seller cart:', cartError)
                // Don't throw here, as the payment was successful
              }
            } else {
              console.log('Still have pending orders for this cart, keeping cart for now')
            }
          } else {
            // Single seller cart - clear immediately (existing behavior)
            console.log('Single seller cart, clearing immediately:', cartId)
            try {
              await tx.cart.delete({
                where: { id: cartId },
              })
              console.log('Single seller cart cleared successfully')
            } catch (cartError) {
              console.error('Error clearing single seller cart:', cartError)
              // Don't throw here, as the payment was successful
            }
          }
        }

        // Clear user's cart if no specific cartId was provided (fallback for old orders)
        if (!cartId) {
          console.log('🛒 No specific cartId, clearing user cart as fallback')
          try {
            const userCart = await tx.cart.findFirst({
              where: { userId },
            })

            if (userCart) {
              await tx.cart.delete({
                where: { id: userCart.id },
              })
              console.log('✅ User cart cleared as fallback after payment succeeded')
            } else {
              console.log('ℹ️ No cart found for user, nothing to clear')
            }
          } catch (cartError) {
            console.error('Error clearing user cart as fallback:', cartError)
            // Don't throw here, as the payment was successful
          }
        }

        // Create audit log
        console.log('Creating audit log')
        const auditAction = updatedOrder.packItems.length > 0 ? 'pack.purchased' : 'order.completed'
        const entityType = updatedOrder.packItems.length > 0 ? 'pack' : 'order'
        const entityId = updatedOrder.packItems.length > 0 ? updatedOrder.packItems[0].packId : orderId

        await tx.auditLog.create({
          data: {
            userId,
            action: auditAction,
            entityType,
            entityId,
            metadata: {
              orderId,
              ...(workflowId && { workflowId }),
              ...(updatedOrder.packItems.length > 0 && {
                packId: updatedOrder.packItems[0].packId,
                packTitle: updatedOrder.packItems[0].pack.title,
              }),
              amount: session.amount_total,
              currency: session.currency,
              stripeSessionId: session.id,
            },
          },
        })

        console.log('Audit log created successfully')
        console.log('Successfully processed checkout session completed for order:', orderId)

        // Send notifications (outside transaction to not block payment processing)
        try {
          // Get buyer info for notifications
          const buyer = await tx.user.findUnique({
            where: { id: userId },
            select: { displayName: true },
          })
          const buyerName = buyer?.displayName || 'Un utilisateur'

          // Notify each seller about new sales
          const sellerIds = new Set<string>()
          
          for (const item of updatedOrder.items) {
            if (item.workflow && !sellerIds.has(item.workflow.sellerId)) {
              sellerIds.add(item.workflow.sellerId)
              await notifySellerNewOrder({
                sellerId: item.workflow.sellerId,
                buyerName,
                workflowTitle: item.workflow.title,
                amount: item.unitPriceCents / 100,
                orderId,
              })
            }
          }

          for (const packItem of updatedOrder.packItems) {
            if (packItem.pack && !sellerIds.has(packItem.pack.sellerId)) {
              sellerIds.add(packItem.pack.sellerId)
              await notifySellerNewOrder({
                sellerId: packItem.pack.sellerId,
                buyerName,
                workflowTitle: packItem.pack.title,
                amount: packItem.unitPriceCents / 100,
                orderId,
              })
            }
          }

          // Notify buyer about order confirmation
          const firstItemTitle = updatedOrder.items[0]?.workflow?.title || 
                                 updatedOrder.packItems[0]?.pack?.title || 
                                 'Votre achat'
          await notifyBuyerOrderConfirmed({
            buyerId: userId,
            workflowTitle: firstItemTitle,
            orderId,
          })

          console.log('Notifications sent successfully')
        } catch (notifError) {
          // Don't fail the webhook if notifications fail
          console.error('Error sending notifications:', notifError)
        }
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
            items: {
              include: {
                workflow: {
                  select: {
                    title: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
              },
            },
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

    // Notify buyer about the refund
    try {
      const workflowTitles = payment.order.items
        .map((item) => item.workflow?.title)
        .filter(Boolean)
        .join(', ')

      await notifyBuyerOrderRefunded({
        buyerId: payment.order.user.id,
        orderId: payment.orderId,
        amount: refundAmount / 100, // Convert cents to dollars/euros
        workflowTitle: workflowTitles || 'Votre commande',
      })
      console.log('📧 Refund notification sent to buyer:', payment.order.user.id)
    } catch (notifError) {
      console.error('Failed to send refund notification:', notifError)
      // Don't throw - notification failure shouldn't fail the refund processing
    }

    console.log('Successfully processed charge refunded for order:', payment.orderId)
  } catch (error) {
    console.error('Error handling charge refunded:', error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('💰 PaymentIntent succeeded:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    })

    const { orderId, userId, sellerId, cartId, orderType } = paymentIntent.metadata

    if (!orderId) {
      console.error('❌ No orderId in PaymentIntent metadata')
      return
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        providerIntent: paymentIntent.id,
      },
      include: {
        items: {
          include: {
            workflow: true,
          },
        },
      },
    })

    console.log('✅ Order updated to paid:', {
      orderId: updatedOrder.id,
      totalCents: updatedOrder.totalCents,
      itemsCount: updatedOrder.items.length,
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: updatedOrder.id,
        provider: 'stripe',
        providerCharge: paymentIntent.id,
        amountCents: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        rawPayload: paymentIntent as any,
      },
    })

    // Update workflow sales count
    for (const item of updatedOrder.items) {
      await prisma.workflow.update({
        where: { id: item.workflowId },
        data: {
          salesCount: {
            increment: item.quantity,
          },
        },
      })
    }

    // Handle cart cleanup for multi-vendor orders
    if (cartId && orderType === 'multi_vendor_cart') {
      console.log('🛒 Multi-vendor cart detected, checking if all orders are paid')

      // Find all pending orders that share the same cartId
      const pendingOrdersWithSameCart = await prisma.order.count({
        where: {
          AND: [
            {
              OR: [
                { providerIntent: { contains: cartId } }, // Fallback search
                {
                  // More precise: find orders created around the same time with same user
                  userId: updatedOrder.userId,
                  createdAt: {
                    gte: new Date(new Date(updatedOrder.createdAt).getTime() - 5 * 60 * 1000), // 5 minutes before
                    lte: new Date(new Date(updatedOrder.createdAt).getTime() + 5 * 60 * 1000), // 5 minutes after
                  },
                },
              ],
            },
            { status: 'pending' },
          ],
        },
      })

      console.log('Pending orders with same cart found:', pendingOrdersWithSameCart)

      if (pendingOrdersWithSameCart === 0) {
        // All orders are paid, clear the cart
        await prisma.cart.delete({
          where: { id: cartId },
        })
        console.log('✅ Cart cleared after all payments succeeded')
      }
    } else {
      // For single orders, clear the user's cart
      console.log('🛒 Single order detected, clearing user cart')

      // Find and delete the user's cart
      const userCart = await prisma.cart.findFirst({
        where: { userId: updatedOrder.userId },
      })

      if (userCart) {
        await prisma.cart.delete({
          where: { id: userCart.id },
        })
        console.log('✅ User cart cleared after payment succeeded')
      } else {
        console.log('ℹ️ No cart found for user, nothing to clear')
      }
    }
  } catch (error) {
    console.error('❌ Error handling PaymentIntent succeeded:', error)
    throw error
  }
}
