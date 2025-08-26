import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: accountId } = await params

    // Retrieve the Stripe account
    const account = await stripe.accounts.retrieve(accountId)

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements || {
          currently_due: [],
          eventually_due: [],
          past_due: [],
          pending_verification: [],
        },
      },
      onboardingCompleted: account.details_submitted && account.charges_enabled,
    })
  } catch (error: any) {
    console.error('Stripe account retrieval error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve Stripe account',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
