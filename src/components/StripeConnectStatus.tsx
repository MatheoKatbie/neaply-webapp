'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

export default function StripeConnectStatus() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStripeStatus()
  }, [])

  const fetchStripeStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/connect')

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else if (response.status === 404) {
        // No Stripe account exists yet
        setStatus(null)
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
      <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#EDEFF7] font-aeonikpro">
            <CreditCard className="h-5 w-5" />
            Payment Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#9DA2B3]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#EDEFF7] font-aeonikpro">
          <CreditCard className="h-5 w-5" />
          Payment Setup
        </CardTitle>
        <CardDescription className="text-[#9DA2B3] font-aeonikpro">Stripe Connect account status for receiving payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-500/10 border border-red-500/50" variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 font-aeonikpro">{error}</AlertDescription>
          </Alert>
        )}

        {!status ? (
          // No Stripe account exists
          <div className="space-y-4">
            <Alert className="bg-blue-500/10 border border-blue-500/50">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 font-aeonikpro">
                You need to set up Stripe Connect to receive payments for your workflows.
              </AlertDescription>
            </Alert>

            <Link href="/dashboard/stripe/connect">
              <Button className="w-full bg-white text-black hover:bg-[#40424D]/30 font-aeonikpro">
                <CreditCard className="mr-2 h-4 w-4" />
                Set Up Stripe Connect
              </Button>
            </Link>
          </div>
        ) : (
          // Stripe account exists
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Alert className="bg-orange-500/10 border border-orange-500/50">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <AlertDescription className="text-orange-300 font-aeonikpro">
                    Your account setup is incomplete. Please complete the onboarding process to start receiving
                    payments.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={continueOnboarding} size="sm" className="bg-white text-black hover:bg-[#40424D]/30 font-aeonikpro">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continue Setup
                  </Button>
                  <Link href="/dashboard/stripe/connect">
                    <Button variant="outline" size="sm" className="border-[#9DA2B3]/25 text-[#9DA2B3] hover:bg-[#1E1E24] font-aeonikpro">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
