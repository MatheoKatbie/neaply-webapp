'use client'

import { useAuth } from '@/hooks/useAuth'
import StripeConnectStatus from '@/components/StripeConnectStatus'
import SellerEarningsDashboard from '@/components/SellerEarningsDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, DollarSign } from 'lucide-react'

export default function EarningsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view your earnings.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Earnings Dashboard</h1>
        <p className="text-muted-foreground">
          Track your workflow sales, revenue, and payouts
        </p>
      </div>

      <div className="space-y-8">
        {/* Stripe Connect Status */}
        <StripeConnectStatus />

        {/* Earnings Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings & Analytics
            </CardTitle>
            <CardDescription>
              View your sales performance, revenue breakdown, and payout history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SellerEarningsDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
