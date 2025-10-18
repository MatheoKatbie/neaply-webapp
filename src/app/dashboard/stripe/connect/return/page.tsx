'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function StripeConnectReturnPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [accountStatus, setAccountStatus] = useState<any>(null)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/return')

      if (response.ok) {
        const data = await response.json()
        setAccountStatus(data.account)

        if (data.onboardingCompleted) {
          setStatus('success')
          setMessage('Your Stripe Connect account has been successfully set up!')
        } else {
          setStatus('error')
          setMessage('Your account setup is incomplete. Please complete all required information.')
        }
      } else {
        setStatus('error')
        setMessage('Failed to verify your account status. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while checking your account status.')
    }
  }

  const continueOnboarding = () => {
    // Refresh the onboarding link and redirect
    fetch('/api/stripe/connect/refresh', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = data.onboardingUrl
        }
      })
      .catch(() => {
        setMessage('Failed to refresh onboarding link. Please try again.')
      })
  }

  const goToDashboard = () => {
    router.push('/dashboard/seller')
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen bg-[#08080A]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#9DA2B3]" />
            <p className="text-[#9DA2B3] font-aeonikpro">Verifying your account setup...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pt-24 min-h-screen bg-[#08080A]">
      <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-[#EDEFF7] font-aeonikpro">
            {status === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <AlertCircle className="h-6 w-6 text-orange-400" />
            )}
            Stripe Connect Setup
          </CardTitle>
          <CardDescription className="text-[#9DA2B3] font-aeonikpro">
            {status === 'success'
              ? 'Your account has been successfully configured'
              : 'Your account setup requires additional information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'success' ? (
            <Alert className="bg-green-500/10 border border-green-500/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300 font-aeonikpro">{message}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-orange-500/10 border border-orange-500/50" variant="destructive">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300 font-aeonikpro">{message}</AlertDescription>
            </Alert>
          )}

          {accountStatus && (
            <div className="bg-[#1E1E24] p-4 rounded-lg border border-[#9DA2B3]/25">
              <h4 className="font-semibold mb-3 text-[#EDEFF7] font-aeonikpro">Account Status:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9DA2B3] font-aeonikpro">Payments Enabled:</span>
                  <span className={accountStatus.charges_enabled ? 'text-green-400' : 'text-red-400'} style={{ fontFamily: 'var(--font-aeonikpro)' }}>
                    {accountStatus.charges_enabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9DA2B3] font-aeonikpro">Payouts Enabled:</span>
                  <span className={accountStatus.payouts_enabled ? 'text-green-400' : 'text-red-400'} style={{ fontFamily: 'var(--font-aeonikpro)' }}>
                    {accountStatus.payouts_enabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9DA2B3] font-aeonikpro">Details Submitted:</span>
                  <span className={accountStatus.details_submitted ? 'text-green-400' : 'text-red-400'} style={{ fontFamily: 'var(--font-aeonikpro)' }}>
                    {accountStatus.details_submitted ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {status === 'success' ? (
              <Button onClick={goToDashboard} className="flex-1 bg-white text-black hover:bg-[#40424D]/30 font-aeonikpro">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={continueOnboarding} variant="outline" className="flex-1 border-[#9DA2B3]/25 text-[#9DA2B3] hover:bg-[#1E1E24] font-aeonikpro">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Continue Setup
                </Button>
                <Button onClick={goToDashboard} className="flex-1 bg-white text-black hover:bg-[#40424D]/30 font-aeonikpro">
                  Go to Dashboard
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
