'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Setup
        </CardTitle>
        <CardDescription>Stripe Connect account status for receiving payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!status ? (
          // No Stripe account exists
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to set up Stripe Connect to receive payments for your workflows.
              </AlertDescription>
            </Alert>

            <Link href="/dashboard/stripe/connect">
              <Button className="w-full">
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
                <span className="text-sm">Payments</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={status.account.payouts_enabled ? 'default' : 'secondary'}>
                  {status.account.payouts_enabled ? 'Active' : 'Pending'}
                </Badge>
                <span className="text-sm">Payouts</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={status.account.details_submitted ? 'default' : 'secondary'}>
                  {status.account.details_submitted ? 'Complete' : 'Incomplete'}
                </Badge>
                <span className="text-sm">Verification</span>
              </div>
            </div>

            {status.onboardingCompleted ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your Stripe Connect account is fully set up and ready to receive payments!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your account setup is incomplete. Please complete the onboarding process to start receiving
                    payments.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={continueOnboarding} size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continue Setup
                  </Button>
                  <Link href="/dashboard/stripe/connect">
                    <Button variant="outline" size="sm">
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
