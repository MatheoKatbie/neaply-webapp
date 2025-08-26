'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  BarChart3,
  Clock,
} from 'lucide-react'

interface EarningsData {
  period: string
  summary: {
    totalGross: number
    totalFees: number
    totalNet: number
    currency: string
    salesCount: number
  }
  charges: Array<{
    id: string
    amount: number
    currency: string
    status: string
    created: number
    description: string
    receipt_url: string
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
    items: Array<
      | {
        type: 'workflow'
        title: string
        slug: string
        unitPriceCents: number
        subtotalCents: number
      }
      | {
        type: 'pack'
        title: string
        slug: string
        unitPriceCents: number
        subtotalCents: number
      }
    >
  }>
  topWorkflows: Array<{
    workflowId: string
    title: string
    slug: string
    sales: number
    revenue: number
  }>
}

interface PayoutsData {
  payouts: Array<{
    id: string
    amount: number
    currency: string
    status: string
    arrival_date: number
    created: number
    method: string
    type: string
  }>
  balance: {
    available: number
    pending: number
    total: number
  }
  summary: {
    totalPayouts: number
    recentCharges: number
    currency: string
  }
}

export default function SellerEarningsDashboard() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [payoutsData, setPayoutsData] = useState<PayoutsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch earnings data
      const earningsResponse = await fetch(`/api/stripe/seller/earnings?period=${period}`)
      if (!earningsResponse.ok) {
        throw new Error('Failed to fetch earnings data')
      }
      const earningsResult = await earningsResponse.json()
      setEarningsData(earningsResult.data)

      // Fetch payouts data
      const payoutsResponse = await fetch('/api/stripe/seller/payouts')
      if (!payoutsResponse.ok) {
        throw new Error('Failed to fetch payouts data')
      }
      const payoutsResult = await payoutsResponse.json()
      setPayoutsData(payoutsResult.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5" />
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earningsData ? formatCurrency(earningsData.summary.totalGross, earningsData.summary.currency) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">{earningsData?.summary.salesCount || 0} sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {earningsData ? formatCurrency(earningsData.summary.totalFees, earningsData.summary.currency) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">15% commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {earningsData ? formatCurrency(earningsData.summary.totalNet, earningsData.summary.currency) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Cards */}
      {payoutsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(payoutsData.balance.available, payoutsData.summary.currency)}
              </div>
              <p className="text-xs text-muted-foreground">Ready for payout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(payoutsData.balance.pending, payoutsData.summary.currency)}
              </div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payoutsData.summary.totalPayouts, payoutsData.summary.currency)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          <TabsTrigger value="workflows">Top Workflows</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Your latest workflow and pack sales</CardDescription>
            </CardHeader>
            <CardContent>
              {earningsData?.orders.length ? (
                <div className="space-y-4">
                  {earningsData.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {order.items
                            .map((item) => `${item.type === 'pack' ? 'Pack: ' : ''}${item.title}`)
                            .join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">{new Date(order.paidAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.totalCents, order.currency)}</p>
                        <Badge variant="outline">Paid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No sales in this period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Workflows</CardTitle>
              <CardDescription>Your best-selling workflows by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {earningsData?.topWorkflows.length ? (
                <div className="space-y-4">
                  {earningsData.topWorkflows.map((workflow) => (
                    <div key={workflow.workflowId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{workflow.title}</p>
                        <p className="text-sm text-muted-foreground">{workflow.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(workflow.revenue, earningsData.summary.currency)}</p>
                        <Badge variant="outline">{workflow.sales} sold</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No workflow sales in this period</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Packs</CardTitle>
              <CardDescription>Your best-selling packs by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray((earningsData as any)?.topPacks) && (earningsData as any).topPacks.length ? (
                <div className="space-y-4">
                  {(earningsData as any).topPacks.map((pack: any) => (
                    <div key={pack.packId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{pack.title}</p>
                        <p className="text-sm text-muted-foreground">{pack.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(pack.revenue, earningsData!.summary.currency)}</p>
                        <Badge variant="outline">{pack.sales} sold</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No pack sales in this period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your recent payouts and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              {payoutsData?.payouts.length ? (
                <div className="space-y-4">
                  {payoutsData.payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{formatCurrency(payout.amount, payout.currency)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(payout.created)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>{payout.status}</Badge>
                        <p className="text-sm text-muted-foreground">{payout.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payouts yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
