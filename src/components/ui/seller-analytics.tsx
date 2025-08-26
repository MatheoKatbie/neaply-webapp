'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Heart, Package, RefreshCw, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface AnalyticsData {
  overview: {
    totalWorkflows: number
    totalPacks: number
    totalFavorites: number
    totalRevenueCents: number
    totalSales: number
  }
  salesOverTime: {
    month: string
    workflowsSold: number
    packsSold: number
    itemsSold: number
    totalSales: number
    revenueCents: number
  }[]
  topWorkflows: {
    id: string
    title: string
    status: string
    salesCount: number
    rating: number
    ratingCount: number
    favoritesCount: number
    reviewsCount: number
    paidOrdersCount: number
  }[]
  topPacks: {
    id: string
    title: string
    status: string
    rating: number
    ratingCount: number
    favoritesCount: number
    reviewsCount: number
    paidOrdersCount: number
  }[]
  statusDistribution: Record<string, number>
}

interface AnalyticsProps {
  className?: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const STATUS_COLORS = {
  published: '#10B981',
  draft: '#6B7280',
  unlisted: '#F59E0B',
  disabled: '#EF4444',
  pack_only: '#6366F1',
}

const STATUS_LABELS = {
  published: 'Published',
  draft: 'Draft',
  unlisted: 'Unlisted',
  disabled: 'Disabled',
  pack_only: 'Pack Only',
}

function formatCurrency(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function formatMonth(monthStr: string) {
  const date = new Date(monthStr + '-01')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function SellerAnalytics({ className }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('12')
  const [error, setError] = useState<string | null>(null)

  const formatTooltipValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/seller/analytics?months=${timeRange}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <TrendingUp className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{error || 'Failed to load analytics'}</h3>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusData = Object.entries(data.statusDistribution).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6B7280',
  }))

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track your workflows and packs performance and sales trends</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
              <SelectItem value="24">Last 24 months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">All statuses included</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packs</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalPacks}</div>
            <p className="text-xs text-muted-foreground">All statuses included</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalSales}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenueCents)}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Items Sold Over Time</CardTitle>
            <CardDescription>Workflows and packs sold per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => formatMonth(value as string)}
                    formatter={(value: number) => [value, 'Items Sold']}
                  />
                  <Line
                    type="monotone"
                    dataKey="itemsSold"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status Distribution</CardTitle>
            <CardDescription>Breakdown of workflows by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent?: number }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue generated per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    labelFormatter={(value) => formatMonth(value as string)}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenueCents" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Workflows</CardTitle>
          <CardDescription>Your best-selling workflows ranked by sales count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Workflow</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Sales</th>
                  <th className="text-left py-3 px-4 font-medium">Rating</th>
                  <th className="text-left py-3 px-4 font-medium">Favorites</th>
                  <th className="text-left py-3 px-4 font-medium">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {data.topWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="border-b hover:bg-background">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground truncate max-w-xs">{workflow.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={workflow.status === 'published' ? 'default' : 'secondary'}
                        className={workflow.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {STATUS_LABELS[workflow.status as keyof typeof STATUS_LABELS] || workflow.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{workflow.salesCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{workflow.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">({workflow.ratingCount})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{workflow.favoritesCount}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{workflow.reviewsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.topWorkflows.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No workflows found. Create your first workflow to see analytics.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Packs Table */}
      <div className="mt-8" />
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Packs</CardTitle>
          <CardDescription>Your best-selling packs ranked by paid orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Pack</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Paid Orders</th>
                  <th className="text-left py-3 px-4 font-medium">Rating</th>
                  <th className="text-left py-3 px-4 font-medium">Favorites</th>
                  <th className="text-left py-3 px-4 font-medium">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {data.topPacks.map((pack) => (
                  <tr key={pack.id} className="border-b hover:bg-background">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground truncate max-w-xs">{pack.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={pack.status === 'published' ? 'default' : 'secondary'}
                        className={pack.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {STATUS_LABELS[pack.status as keyof typeof STATUS_LABELS] || pack.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{pack.paidOrdersCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{pack.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">({pack.ratingCount})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{pack.favoritesCount}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{pack.reviewsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.topPacks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No packs found. Create your first pack to see analytics.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
