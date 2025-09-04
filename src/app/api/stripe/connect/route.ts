import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONNECT_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import {
  getStripeAccountParams,
  getStripeAccountLinkParams,
  addLocaleToStripeOnboardingUrl,
  getEnhancedBusinessProfile,
} from '@/lib/stripe-locale'

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
      include: { sellerProfile: true },
    })

    if (!dbUser?.isSeller || !dbUser.sellerProfile) {
      return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
    }

    // Return Stripe Connect account information
    const responseData: any = {
      stripeAccountId: dbUser.sellerProfile.stripeAccountId,
      stripeOnboardingCompleted: dbUser.sellerProfile.stripeOnboardingCompleted,
      stripeOnboardingUrl: dbUser.sellerProfile.stripeOnboardingUrl,
    }

    // Only generate Express dashboard link if account exists and is fully set up
    if (dbUser.sellerProfile.stripeAccountId && dbUser.sellerProfile.stripeOnboardingCompleted) {
      try {
        const loginLink = await stripe.accounts.createLoginLink(dbUser.sellerProfile.stripeAccountId)
        responseData.expressDashboardUrl = loginLink.url
      } catch (error) {
        console.error('Failed to create Express dashboard link:', error)
        // Don't fail the request, just don't include the URL
      }
    }

    return NextResponse.json({
      data: responseData,
    })
  } catch (error: any) {
    console.error('Stripe Connect GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Stripe Connect account information',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

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

    // Check if user is a seller
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { sellerProfile: true },
    })

    if (!dbUser?.isSeller || !dbUser.sellerProfile) {
      return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
    }

    // Check if Stripe account already exists
    if (dbUser.sellerProfile.stripeAccountId) {
      return NextResponse.json({ error: 'Stripe Connect account already exists' }, { status: 400 })
    }

    const countryCode = dbUser.sellerProfile.countryCode || 'FR'
    const hasWebsite = !!dbUser.sellerProfile.websiteUrl

    // Create Stripe Connect Express account with enhanced business profile
    const accountParams = {
      type: 'express' as const,
      country: countryCode,
      email: user.email,
      business_type: 'individual' as const,
      business_profile: getEnhancedBusinessProfile(
        dbUser.sellerProfile.slug,
        hasWebsite,
        dbUser.sellerProfile.websiteUrl || undefined
      ),
      capabilities: STRIPE_CONNECT_CONFIG.requiredCapabilities,
    }

    const account = await stripe.accounts.create(accountParams)

    // Create Express onboarding link (faster process)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const accountLinkParams = getStripeAccountLinkParams(account.id, countryCode, baseUrl)
    const accountLink = await stripe.accountLinks.create(accountLinkParams)

    // Update seller profile with Stripe account info
    await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        stripeAccountId: account.id,
        stripeOnboardingUrl: accountLink.url,
        stripeOnboardingCompleted: false,
      },
    })

    // Add locale parameter to the onboarding URL
    const localizedOnboardingUrl = addLocaleToStripeOnboardingUrl(accountLink.url, countryCode)

    return NextResponse.json({
      success: true,
      accountId: account.id,
      onboardingUrl: localizedOnboardingUrl,
      countryCode: countryCode,
    })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)

    // Provide more specific error messages
    if (error.type === 'StripeInvalidRequestError') {
      if (error.message.includes('Redirect urls must begin with HTTP or HTTPS')) {
        return NextResponse.json(
          {
            error: 'Invalid redirect URLs configuration. Please check environment variables.',
          },
          { status: 400 }
        )
      }
      if (error.message.includes('Terms of Service')) {
        return NextResponse.json(
          {
            error: 'Terms of service acceptance error. Please try again.',
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create Stripe Connect account',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
