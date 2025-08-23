import Stripe from 'stripe'

// Server-side Stripe instance (for API routes)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Client-side Stripe instance (for browser)
export const stripeClient = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Stripe Connect configuration
export const STRIPE_CONNECT_CONFIG = {
  // Platform fee percentage (15%)
  platformFeePercentage: 15,

  // Supported countries for Connect accounts
  supportedCountries: ['FR', 'US', 'GB', 'DE', 'CA', 'AU'],

  // Required capabilities for sellers
  requiredCapabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
} as const

// Types for Stripe Connect
export interface StripeConnectAccount {
  id: string
  object: 'account'
  business_type: string
  charges_enabled: boolean
  country: string
  created: number
  default_currency: string
  details_submitted: boolean
  payouts_enabled: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
    pending_verification: string[]
  }
  settings: {
    payouts: {
      schedule: {
        delay_days: number
        interval: string
      }
    }
  }
  type: 'standard' | 'express' | 'custom'
}

export interface StripeConnectOnboardingResponse {
  accountId: string
  onboardingUrl: string
}
