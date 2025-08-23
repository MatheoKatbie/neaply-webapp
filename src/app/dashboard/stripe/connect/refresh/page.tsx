'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'

export default function StripeConnectRefreshPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)

  useEffect(() => {
    refreshOnboardingLink()
  }, [])

  const refreshOnboardingLink = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/connect/refresh', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setOnboardingUrl(data.onboardingUrl)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to refresh onboarding link')
      }
    } catch (error) {
      setError('An error occurred while refreshing your onboarding link')
    } finally {
      setLoading(false)
    }
  }

  const continueOnboarding = () => {
    if (onboardingUrl) {
      window.location.href = onboardingUrl
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Refreshing your onboarding link...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pt-24">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            Complete Your Setup
          </CardTitle>
          <CardDescription>Additional information is required to complete your Stripe Connect account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your Stripe Connect account setup requires additional information. Please complete the onboarding
                process to start receiving payments.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What you may need to provide:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Additional business verification documents</li>
              <li>• Bank account information for payouts</li>
              <li>• Government-issued identification</li>
              <li>• Business registration documents</li>
              <li>• Tax identification numbers</li>
            </ul>
          </div>

          <div className="flex gap-4">
            {onboardingUrl && !error ? (
              <Button onClick={continueOnboarding} className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue Setup
              </Button>
            ) : (
              <Button onClick={refreshOnboardingLink} className="flex-1">
                Try Again
              </Button>
            )}
            <Button onClick={goToDashboard} variant="outline" className="flex-1">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
