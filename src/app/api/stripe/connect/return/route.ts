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

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { stripeAccountId: true },
    })

    if (!sellerProfile?.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe Connect account found' }, { status: 404 })
    }

    // Get account details from Stripe to check completion status
    const account = await stripe.accounts.retrieve(sellerProfile.stripeAccountId)

    // Check if onboarding is complete
    const isComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled

    // Update onboarding status
    await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        stripeOnboardingCompleted: isComplete,
      },
    })

    return NextResponse.json({
      success: true,
      onboardingCompleted: isComplete,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      },
    })
  } catch (error) {
    console.error('Stripe Connect return error:', error)
    return NextResponse.json({ error: 'Failed to process Stripe Connect return' }, { status: 500 })
  }
}
