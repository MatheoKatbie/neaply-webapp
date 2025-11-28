import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { getComprehensiveBusinessProfile } from '@/lib/stripe-locale'

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

    const { email, sellerSlug, accountId } = {
      email: user.email,
      sellerSlug: dbUser.sellerProfile.slug,
      accountId: dbUser.sellerProfile.stripeAccountId,
    }

    // Get comprehensive business profile based on seller's situation
    const businessProfile = getComprehensiveBusinessProfile(sellerSlug, {
      hasWebsite: !!dbUser.sellerProfile.websiteUrl,
      websiteUrl: dbUser.sellerProfile.websiteUrl || undefined,
      hideWebsiteField: false, // Set to true if you want to force hide website field
      customMcc: '5399', // Computer Software Stores - adapt to your activity
      customSupportUrl: 'https://neaply.fr/support',
      customSupportEmail: 'support@neaply.fr',
    })

    // 1) Create or update the Express account
    const account = accountId
      ? await stripe.accounts.update(accountId, {
          business_profile: businessProfile,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })
      : await stripe.accounts.create({
          type: 'express',
          country: dbUser.sellerProfile.countryCode || 'FR',
          email,
          business_type: 'individual', // or 'company' if professional
          business_profile: businessProfile,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })

    // 2) Generate onboarding link (pre-filled)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: `${baseUrl}/dashboard/stripe/connect/return`,
      refresh_url: `${baseUrl}/dashboard/stripe/connect/refresh`,
    })

    // Update seller profile with Stripe account info if it's a new account
    if (!accountId) {
      await prisma.sellerProfile.update({
        where: { userId: user.id },
        data: {
          stripeAccountId: account.id,
          stripeOnboardingUrl: accountLink.url,
          stripeOnboardingCompleted: false,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        url: accountLink.url,
        accountId: account.id,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Stripe create-seller error:', error)

    // Provide specific error messages
    if (error.type === 'StripeInvalidRequestError') {
      if (error.message.includes('Redirect urls must begin with HTTP or HTTPS')) {
        return NextResponse.json(
          { error: 'Invalid redirect URLs configuration. Please check environment variables.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Terms of Service')) {
        return NextResponse.json({ error: 'Terms of service acceptance error. Please try again.' }, { status: 400 })
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
