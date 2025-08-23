import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
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

    // Create new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: sellerProfile.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/connect/return`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    })

    // Update the onboarding URL
    await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        stripeOnboardingUrl: accountLink.url,
      },
    })

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
    })
  } catch (error) {
    console.error('Stripe Connect refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh Stripe Connect onboarding' }, { status: 500 })
  }
}
