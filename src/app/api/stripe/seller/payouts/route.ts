import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is a seller
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { sellerProfile: true }
    })

    if (!dbUser?.isSeller || !dbUser.sellerProfile) {
      return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
    }

    // Check if Stripe Connect account exists
    if (!dbUser.sellerProfile.stripeAccountId) {
      return NextResponse.json({ error: 'Stripe Connect account not found' }, { status: 404 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const startingAfter = searchParams.get('starting_after')

    // Get payouts from Stripe
    const payouts = await stripe.payouts.list({
      limit: Math.min(limit, 100),
      starting_after: startingAfter || undefined,
    }, {
      stripeAccount: dbUser.sellerProfile.stripeAccountId,
    })

    // Get account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: dbUser.sellerProfile.stripeAccountId,
    })

    // Get recent charges (sales)
    const charges = await stripe.charges.list({
      limit: 20,
      created: {
        gte: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000), // Last 30 days
      },
    }, {
      stripeAccount: dbUser.sellerProfile.stripeAccountId,
    })

    // Calculate summary
    const availableBalance = balance.available.reduce((sum, bal) => sum + bal.amount, 0)
    const pendingBalance = balance.pending.reduce((sum, bal) => sum + bal.amount, 0)
    const totalPayouts = payouts.data.reduce((sum, payout) => sum + payout.amount, 0)

    return NextResponse.json({
      success: true,
      data: {
        payouts: payouts.data.map(payout => ({
          id: payout.id,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          arrival_date: payout.arrival_date,
          created: payout.created,
          method: payout.method,
          type: payout.type,
        })),
        balance: {
          available: availableBalance,
          pending: pendingBalance,
          total: availableBalance + pendingBalance,
        },
        summary: {
          totalPayouts,
          recentCharges: charges.data.length,
          currency: balance.available[0]?.currency || 'eur',
        },
        pagination: {
          hasMore: payouts.has_more,
          nextCursor: payouts.data[payouts.data.length - 1]?.id,
        },
      },
    })

  } catch (error) {
    console.error('Error fetching seller payouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payout information' },
      { status: 500 }
    )
  }
}
