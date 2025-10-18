'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StripeAccount {
  id: string
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
    pending_verification: string[]
  }
}

interface StripeConnectStatus {
  success: boolean
  account: StripeAccount
  onboardingCompleted: boolean
}

interface StripeConnectData {
  data: {
    stripeAccountId: string | null
    stripeOnboardingCompleted: boolean | null
    stripeOnboardingUrl: string | null
    expressDashboardUrl?: string
  }
}

export default function StripeConnectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<StripeConnectStatus | null>(null)
  const [stripeData, setStripeData] = useState<StripeConnectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchStripeStatus()
    }
  }, [user])

  const fetchStripeStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/connect')

      if (response.ok) {
        const data = await response.json()
        setStripeData(data)

        // If we have a Stripe account ID, fetch the account details
        if (data.data?.stripeAccountId) {
          try {
            const accountResponse = await fetch(`/api/stripe/connect/account/${data.data.stripeAccountId}`)
            if (accountResponse.ok) {
              const accountData = await accountResponse.json()
              setStatus(accountData)
            }
          } catch (err) {
            console.error('Failed to fetch account details:', err)
          }
        } else {
          setStatus(null)
        }
      } else if (response.status === 404) {
        // No Stripe account exists yet
        setStatus(null)
        setStripeData(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch Stripe status')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const createStripeAccount = async () => {
    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect directly to Stripe with locale already set
        window.location.href = data.onboardingUrl
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create Stripe account')
      }
    } catch (err) {
      setError('Failed to create Stripe account')
    } finally {
      setCreating(false)
    }
  }

  const continueOnboarding = () => {
    if (status?.account) {
      // Refresh the onboarding link
      fetch('/api/stripe/connect/refresh', { method: 'POST' })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = data.onboardingUrl
          }
        })
        .catch(() => setError('Failed to refresh onboarding link'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#9DA2B3]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 min-h-screen bg-[#08080A]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#EDEFF7] font-aeonikpro">Stripe Connect Setup</h1>
        <p className="text-[#9DA2B3] font-aeonikpro">
          Set up your Stripe Connect account to receive payments for your workflows
        </p>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-500/10 border border-red-500/50" variant="destructive">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300 font-aeonikpro">{error}</AlertDescription>
        </Alert>
      )}

      {!stripeData?.data?.stripeAccountId ? (
        // No Stripe account exists
        <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#EDEFF7] font-aeonikpro">
              <CreditCard className="h-5 w-5" />
              Set Up Stripe Connect
            </CardTitle>
            <CardDescription className="text-[#9DA2B3] font-aeonikpro">
              Create your Stripe Connect account to start receiving payments. You'll need to provide business
              information and banking details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-[#1E1E24] p-4 rounded-lg border border-[#9DA2B3]/25">
                <h4 className="font-semibold mb-2 text-[#EDEFF7] font-aeonikpro">What you'll need:</h4>
                <ul className="text-sm space-y-1 text-[#9DA2B3] font-aeonikpro">
                  <li>• Business information (name, address, tax ID)</li>
                  <li>• Bank account details for payouts</li>
                  <li>• Government-issued ID for verification</li>
                  <li>• Business documents (if applicable)</li>
                </ul>
              </div>

              <Button onClick={createStripeAccount} disabled={creating} className="w-full bg-white text-black hover:bg-[#40424D]/30 font-aeonikpro">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Create Stripe Connect Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !status?.account ? (
        // Stripe account exists but we're loading details
        <div className="space-y-6">
          <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#EDEFF7] font-aeonikpro">
                <CreditCard className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#9DA2B3]" />
                <span className="ml-2 text-[#9DA2B3] font-aeonikpro">Loading account details...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Stripe account exists with details
        <div className="space-y-6">
          <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#EDEFF7] font-aeonikpro">
                <CreditCard className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant={status.account.charges_enabled ? 'default' : 'secondary'}>
                    {status.account.charges_enabled ? 'Active' : 'Pending'}
                  </Badge>
                  <span className="text-sm text-[#9DA2B3] font-aeonikpro">Payments</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={status.account.payouts_enabled ? 'default' : 'secondary'}>
                    {status.account.payouts_enabled ? 'Active' : 'Pending'}
                  </Badge>
                  <span className="text-sm text-[#9DA2B3] font-aeonikpro">Payouts</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={status.account.details_submitted ? 'default' : 'secondary'}>
                    {status.account.details_submitted ? 'Complete' : 'Incomplete'}
                  </Badge>
                  <span className="text-sm text-[#9DA2B3] font-aeonikpro">Verification</span>
                </div>
              </div>

              {status.onboardingCompleted ? (
                <Alert className="bg-green-500/10 border border-green-500/50">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300 font-aeonikpro">
                    Your Stripe Connect account is fully set up and ready to receive payments!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-red-500/10 border border-red-500/50" variant="destructive">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 font-aeonikpro">
                      Your account setup is incomplete. Please complete the onboarding process to start receiving
                      payments.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={continueOnboarding} className="w-full bg-white text-black hover:bg-[#40424D]/30 font-aeonikpro">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continue Setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {status.account.requirements && (
            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
              <CardHeader>
                <CardTitle className="text-[#EDEFF7] font-aeonikpro">Requirements</CardTitle>
                <CardDescription className="text-[#9DA2B3] font-aeonikpro">Items that need to be completed for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {status.account.requirements.currently_due.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2 font-aeonikpro">Currently Due:</h4>
                      <ul className="text-sm space-y-1">
                        {status.account.requirements.currently_due.map((req, index) => (
                          <li key={index} className="text-red-400 font-aeonikpro">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {status.account.requirements.eventually_due.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-400 mb-2 font-aeonikpro">Eventually Due:</h4>
                      <ul className="text-sm space-y-1">
                        {status.account.requirements.eventually_due.map((req, index) => (
                          <li key={index} className="text-orange-400 font-aeonikpro">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {status.account.requirements.past_due.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2 font-aeonikpro">Past Due:</h4>
                      <ul className="text-sm space-y-1">
                        {status.account.requirements.past_due.map((req, index) => (
                          <li key={index} className="text-red-400 font-aeonikpro">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
