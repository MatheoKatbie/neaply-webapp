import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { getStripeAccountLinkParams, addLocaleToStripeOnboardingUrl } from '@/lib/stripe-locale'

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

    // Get seller profile with country code
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { stripeAccountId: true, countryCode: true },
    })

    if (!sellerProfile?.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe Connect account found' }, { status: 404 })
    }

    // Create new onboarding link with proper locale
    const countryCode = sellerProfile.countryCode || 'FR'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const accountLinkParams = getStripeAccountLinkParams(sellerProfile.stripeAccountId, countryCode, baseUrl)
    const accountLink = await stripe.accountLinks.create(accountLinkParams)

    // Update the onboarding URL
    await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        stripeOnboardingUrl: accountLink.url,
      },
    })

    // Add locale parameter to the onboarding URL
    const localizedOnboardingUrl = addLocaleToStripeOnboardingUrl(accountLink.url, countryCode)

    return NextResponse.json({
      success: true,
      onboardingUrl: localizedOnboardingUrl,
    })
  } catch (error) {
    console.error('Stripe Connect refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh Stripe Connect onboarding' }, { status: 500 })
  }
}
