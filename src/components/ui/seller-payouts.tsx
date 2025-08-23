'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface EarningsData {
  period: string
  summary: {
    totalGross: number
    totalFees: number
    totalNet: number
    currency: string
    salesCount: number
  }
  transfers: Array<{
    id: string
    amount: number
    currency: string
    created: number
    description: string
  }>
  applicationFees: Array<{
    id: string
    amount: number
    currency: string
    created: number
    charge: string
  }>
  orders: Array<{
    id: string
    totalCents: number
    currency: string
    paidAt: string
    items: Array<{
      workflowTitle: string
      workflowSlug: string
      unitPriceCents: number
      subtotalCents: number
    }>
  }>
  topWorkflows: Array<{
    workflowId: string
    title: string
    slug: string
    sales: number
    revenue: number
  }>
  pagination: {
    hasMore: boolean
    nextCursor: string | null
  }
}

export function SellerPayouts() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30d')
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [expressDashboardUrl, setExpressDashboardUrl] = useState<string | null>(null)

  const fetchEarnings = async (selectedPeriod: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stripe/seller/earnings?period=${selectedPeriod}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch earnings data')
      }

      const data = await response.json()
      setEarningsData(data.data)
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to load earnings data', {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch Stripe account ID
  const fetchStripeAccountId = async () => {
    try {
      const response = await fetch('/api/stripe/connect')
      if (response.ok) {
        const data = await response.json()
        if (data.data?.stripeAccountId) {
          setStripeAccountId(data.data.stripeAccountId)
        }
        if (data.data?.expressDashboardUrl) {
          setExpressDashboardUrl(data.data.expressDashboardUrl)
        }
      }
    } catch (error) {
      console.error('Failed to fetch Stripe account ID:', error)
    }
  }

  useEffect(() => {
    fetchEarnings(period)
    fetchStripeAccountId()
  }, [period])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    // Check if it's a Stripe Connect account not found error
    const isStripeConnectError =
      error.includes('Stripe Connect account not found') || error.includes('stripeAccount') || error.includes('connect')

    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            {isStripeConnectError ? (
              <>
                <div className="text-blue-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Stripe Connect Setup Required</h3>
                <p className="text-gray-500 mb-4">
                  To view your earnings and receive payments, you need to connect your Stripe account first.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      if (expressDashboardUrl) {
                        window.open(expressDashboardUrl, '_blank')
                      } else if (stripeAccountId) {
                        // If account exists but no Express URL, redirect to onboarding
                        window.open('/dashboard/stripe/connect', '_blank')
                      } else {
                        // No account at all, start the setup process
                        window.open('/dashboard/stripe/connect', '_blank')
                      }
                    }}
                    className="w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Setup Stripe Connect
                  </Button>
                  <Button variant="outline" onClick={() => fetchEarnings(period)} className="w-full">
                    Try Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-red-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Earnings</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => fetchEarnings(period)}>Try Again</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!earningsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">No earnings data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Earnings & Payouts</h2>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              if (expressDashboardUrl) {
                window.open(expressDashboardUrl, '_blank')
              } else if (stripeAccountId) {
                // If account exists but no Express URL, redirect to onboarding
                window.open('/dashboard/stripe/connect', '_blank')
              } else {
                // No account at all, start the setup process
                window.open('/dashboard/stripe/connect', '_blank')
              }
            }}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Stripe Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earningsData.summary.totalGross, earningsData.summary.currency)}
            </div>
            <p className="text-sm text-gray-500">{earningsData.summary.salesCount} sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earningsData.summary.totalNet, earningsData.summary.currency)}
            </div>
            <p className="text-sm text-gray-500">Your payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earningsData.transfers.length}</div>
            <p className="text-sm text-gray-500">Stripe transfers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Workflows</CardTitle>
            <CardDescription>Your best-selling workflows this period</CardDescription>
          </CardHeader>
          <CardContent>
            {earningsData.topWorkflows.length > 0 ? (
              <div className="space-y-4">
                {earningsData.topWorkflows.map((workflow, index) => (
                  <div key={workflow.workflowId} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{workflow.title}</p>
                        <p className="text-sm text-gray-500">{workflow.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(workflow.revenue, earningsData.summary.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
            <CardDescription>Latest Stripe transfers to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {earningsData.transfers.length > 0 ? (
              <div className="space-y-4">
                {earningsData.transfers.slice(0, 5).map((transfer) => (
                  <div key={transfer.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transfer.description || 'Transfer'}</p>
                      <p className="text-sm text-gray-500">{formatDate(transfer.created)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +{formatCurrency(transfer.amount, transfer.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No transfers available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {earningsData.orders.length > 0 ? (
            <div className="space-y-4">
              {earningsData.orders.slice(0, 10).map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(order.paidAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalCents, order.currency)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.workflowTitle}</span>
                        <span>{formatCurrency(item.subtotalCents, order.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No orders available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
