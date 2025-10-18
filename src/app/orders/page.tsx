'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { downloadWorkflowAsZip } from '@/lib/download-utils'
import type { Order } from '@/types/payment'
import { AlertCircle, Calendar, ChevronRight, CreditCard, Download, FileText, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OrdersHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data.orders || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load order history')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'failed':
        return 'bg-red-500/20 text-red-300'
      case 'refunded':
        return 'bg-[#40424D]/40 text-[#9DA2B3]'
      case 'cancelled':
        return 'bg-[#40424D]/40 text-[#9DA2B3]'
      default:
        return 'bg-[#40424D]/40 text-[#9DA2B3]'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      case 'refunded':
        return 'Refunded'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const handleDownloadZip = async (workflowId: string, workflowTitle: string) => {
    try {
      await downloadWorkflowAsZip(workflowId, workflowTitle)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download workflow. Please try again.')
    }
  }

  const handleDownloadPackZip = async (packId: string, packTitle: string) => {
    try {
      const response = await fetch(`/api/packs/${packId}/download`)
      if (!response.ok) {
        throw new Error('Failed to download pack')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${packTitle}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download pack. Please try again.')
    }
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#08080A] pt-20 md:pt-24">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-[#40424D]/40 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#08080A] pt-20 md:pt-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#EDEFF7] font-aeonikpro mb-2">Order History</h1>
            <p className="text-[#9DA2B3] font-aeonikpro">View and manage all your workflow purchases</p>
          </div>

          {error && (
            <Card className="mb-6 border-red-500/50 bg-red-500/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-300 font-aeonikpro">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {orders.length === 0 && !error ? (
            <Card className="text-center py-12 bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
              <CardContent>
                <div className="w-16 h-16 bg-[#40424D]/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#9DA2B3]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EDEFF7] font-aeonikpro mb-2">No Orders Found</h3>
                <p className="text-[#9DA2B3] font-aeonikpro max-w-md mx-auto mb-6">
                  You haven't made any purchases yet. Browse our marketplace to discover amazing workflows.
                </p>
                <Button onClick={() => router.push('/marketplace')}>Browse Marketplace</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                  <CardHeader className="bg-[#1E1E24]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-[#EDEFF7] font-aeonikpro">Order #{order.id.slice(-8)}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-[#9DA2B3] font-aeonikpro mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-4 h-4" />
                              <span>{formatPrice(order.totalCents, order.currency)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(order.status)} border-0`}>
                          {getStatusText(order.status)}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-[#EDEFF7] font-aeonikpro">Items Purchased:</h4>

                      {/* Individual Workflow Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-4 bg-[#1E1E24] rounded-lg border border-[#9DA2B3]/25"
                            >
                              <Link href={`workflow/${item.workflowId}`} className="flex items-center space-x-4">
                                {item.workflow.heroImageUrl ? (
                                  <img
                                    src={item.workflow.heroImageUrl}
                                    alt={item.workflow.title}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-[#EDEFF7] font-aeonikpro truncate">{item.workflow.title}</h4>
                                  <p className="text-xs text-[#9DA2B3] font-aeonikpro mb-2">
                                    by {item.workflow.seller.displayName}
                                  </p>
                                  <p className="text-sm font-medium text-green-400 font-aeonikpro">
                                    {formatPrice(item.unitPriceCents, order.currency)}
                                  </p>
                                </div>
                              </Link>

                              <div className="flex items-center space-x-2">
                                {order.status === 'paid' && (
                                  <>
                                    <CopyButton workflowId={item.workflowId} />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadZip(item.workflowId, item.workflow.title)}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      ZIP
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/workflow/${item.workflowId}`)}
                                >
                                  View Workflow
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pack Items */}
                      {order.packItems && order.packItems.length > 0 && (
                        <div className="space-y-3">
                          {order.packItems.map((packItem) => (
                            <div
                              key={packItem.id}
                              className="flex items-center justify-between p-4 bg-[#1E1E24] rounded-lg border border-[#9DA2B3]/25"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                  <Package className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-[#EDEFF7] font-aeonikpro">{packItem.pack.title}</h5>
                                  <p className="text-sm text-[#9DA2B3] font-aeonikpro">by {packItem.pack.seller.displayName}</p>
                                  <p className="text-sm font-medium text-green-400 font-aeonikpro">
                                    {formatPrice(packItem.unitPriceCents, order.currency)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {order.status === 'paid' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadPackZip(packItem.pack.id, packItem.pack.title)}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      ZIP
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/packs/${packItem.pack.id}`)}
                                >
                                  View Pack
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show message if no items found */}
                      {(!order.items || order.items.length === 0) &&
                        (!order.packItems || order.packItems.length === 0) && (
                          <div className="text-center py-4 text-[#9DA2B3] font-aeonikpro">
                            <p>No items found for this order.</p>
                          </div>
                        )}
                    </div>

                    {order.status === 'paid' && order.paidAt && (
                      <div className="mt-4 pt-4 border-t border-[#9DA2B3]/25">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#9DA2B3] font-aeonikpro">Payment completed on:</span>
                          <span className="font-medium text-[#EDEFF7] font-aeonikpro">{formatDate(order.paidAt)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination or Load More could be added here */}
          {orders.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-[#9DA2B3] font-aeonikpro">
                Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
