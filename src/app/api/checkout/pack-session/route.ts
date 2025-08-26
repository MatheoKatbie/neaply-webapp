import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, STRIPE_CONNECT_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

const createPackCheckoutSessionSchema = z.object({
    packId: z.string().uuid(),
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
        const validation = createPackCheckoutSessionSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    details: validation.error.issues,
                },
                { status: 400 }
            )
        }

        const { packId, successUrl, cancelUrl } = validation.data

        // Fetch pack details with seller's Stripe Connect info
        const pack = await prisma.workflowPack.findUnique({
            where: { id: packId },
            include: {
                workflows: {
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                title: true,
                                basePriceCents: true,
                            }
                        }
                    }
                },
                seller: {
                    include: {
                        sellerProfile: true,
                    },
                },
            },
        })

        if (!pack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        if (pack.status !== 'published') {
            return NextResponse.json({ error: 'Pack is not available for purchase' }, { status: 400 })
        }

        if (!pack.seller.sellerProfile?.stripeAccountId) {
            return NextResponse.json({ error: 'Seller payment setup incomplete' }, { status: 400 })
        }

        // Check if user already owns this pack
        const existingOrder = await prisma.order.findFirst({
            where: {
                userId: user.id,
                status: 'paid',
                packItems: {
                    some: {
                        packId: packId,
                    },
                },
            },
        })

        if (existingOrder) {
            return NextResponse.json({ error: 'You already own this pack' }, { status: 400 })
        }

        // Create order record
        const orderData = {
            userId: user.id,
            totalCents: pack.basePriceCents,
            currency: pack.currency,
            status: 'pending' as const,
            packItems: {
                create: [{
                    packId: packId,
                    unitPriceCents: pack.basePriceCents,
                    quantity: 1,
                    subtotalCents: pack.basePriceCents,
                }]
            }
        }

        const order = await prisma.order.create({
            data: orderData,
        })

        // Create Stripe checkout session with Connect
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        // Prepare metadata
        const metadata: Record<string, string> = {
            orderId: order.id,
            userId: user.id,
            packId,
            orderType: 'pack',
            sellerAccountId: pack.seller.sellerProfile.stripeAccountId,
        }

        // Calculate platform fee (15%)
        const platformFeeAmount = Math.round(pack.basePriceCents * (STRIPE_CONNECT_CONFIG.platformFeePercentage / 100))

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: pack.currency.toLowerCase(),
                        product_data: {
                            name: pack.title,
                            description: pack.shortDesc,
                            images: pack.heroImageUrl ? [pack.heroImageUrl] : undefined,
                            metadata: {
                                packId,
                                sellerId: pack.sellerId,
                                storeName: pack.seller.sellerProfile?.storeName || pack.seller.displayName,
                                workflowCount: pack.workflows.length.toString(),
                            },
                        },
                        unit_amount: pack.basePriceCents,
                    },
                    quantity: 1,
                },
            ],
            metadata,
            success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: cancelUrl || `${baseUrl}/checkout/cancelled?order_id=${order.id}`,
            customer_email: user.email,
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
            // Stripe Connect configuration
            payment_intent_data: {
                application_fee_amount: platformFeeAmount,
                transfer_data: {
                    destination: pack.seller.sellerProfile.stripeAccountId,
                },
            },
        })

        // Update order with session ID
        await prisma.order.update({
            where: { id: order.id },
            data: {
                provider: 'stripe',
                providerIntent: session.id
            },
        })

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
            orderId: order.id,
        })
    } catch (error) {
        console.error('Error creating pack checkout session:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
