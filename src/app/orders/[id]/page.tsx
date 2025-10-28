'use client'

import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { Separator } from '@/components/ui/separator'
import { downloadWorkflowAsZip } from '@/lib/download-utils'
import type { Order } from '@/types/payment'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileText,
  Package,
  XCircle,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Order not found')
          } else {
            setError('Failed to load order details')
          }
          return
        }
        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-muted-foreground" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'failed':
        return 'bg-red-500/20 text-red-400'
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
        return 'Pending Payment'
      case 'failed':
        return 'Payment Failed'
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
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-[#40424D]/40 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-[#40424D]/40 rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <div className="min-h-screen bg-[#08080A] pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-[#EDEFF7] font-aeonikpro">Order Not Found</h2>
                <p className="text-[#9DA2B3] mb-6 font-aeonikpro">
                  {error || "The order you're looking for could not be found."}
                </p>
                <div className="space-x-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={() => router.push('/orders')}>View All Orders</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#08080A] pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/orders')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>

          {/* Order Header */}
          <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-[#EDEFF7] font-aeonikpro">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-[#9DA2B3] mt-1 font-aeonikpro">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <Badge className={`${getStatusColor(order.status)} border-0`}>{getStatusText(order.status)}</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                <CardHeader>
                  <CardTitle className="text-[#EDEFF7] font-aeonikpro">Items Purchased</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Individual Workflow Items */}
                    {order.items && order.items.length > 0 && (
                      <>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-[#1E1E24] border border-[#9DA2B3]/25 rounded-lg">
                            <div className="flex items-center space-x-4">
                              {item.workflow.heroImageUrl ? (
                                <img
                                  src={item.workflow.heroImageUrl}
                                  alt={item.workflow.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-blue-400" />
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
                            </div>

                            <div className="flex flex-col space-y-2">
                              {order.status === 'paid' && (
                                <div className="flex gap-2">
                                  <CopyButton workflowId={item.workflowId} />
                                  <Button
                                onClick={() => router.push(`/workflow/${item.workflowId}`)}
                              >
                                View Details
                              </Button>
                                </div>
                              )}
                              <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() => handleDownloadZip(item.workflowId, item.workflow.title)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download ZIP
                                  </Button>

                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Pack Items */}
                    {order.packItems && order.packItems.length > 0 && (
                      <>
                        {order.packItems.map((packItem) => (
                          <div
                            key={packItem.id}
                            className="flex items-center justify-between p-4 bg-[#1E1E24] border border-[#9DA2B3]/25 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-[#EDEFF7] font-aeonikpro">{packItem.pack.title}</h4>
                                <p className="text-sm text-[#9DA2B3] font-aeonikpro">by {packItem.pack.seller.displayName}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-sm text-[#9DA2B3] font-aeonikpro">Quantity: {packItem.quantity}</span>
                                  <span className="text-sm font-medium text-green-400">
                                    {formatPrice(packItem.unitPriceCents, order.currency)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                              {order.status === 'paid' && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadPackZip(packItem.pack.id, packItem.pack.title)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    ZIP
                                  </Button>
                                </div>
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
                      </>
                    )}

                    {/* Show message if no items found */}
                    {(!order.items || order.items.length === 0) &&
                      (!order.packItems || order.packItems.length === 0) && (
                        <div className="text-center py-8 text-[#9DA2B3]">
                          <Package className="w-12 h-12 mx-auto mb-4 text-[#9DA2B3]" />
                          <p className="font-aeonikpro">No items found for this order.</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.payments && order.payments.length > 0 && (
                <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                  <CardHeader>
                    <CardTitle className="text-[#EDEFF7] font-aeonikpro">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.payments.map((payment) => (
                        <div key={payment.id} className="p-4 bg-[#1E1E24] border border-[#9DA2B3]/25 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[#EDEFF7] font-aeonikpro">Payment #{payment.id.slice(-8)}</span>
                            <Badge className={`${getStatusColor(payment.status)} border-0`}>{payment.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-[#9DA2B3] font-aeonikpro">Amount:</span>
                              <span className="ml-2 font-medium text-[#EDEFF7]">
                                {formatPrice(payment.amountCents, payment.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#9DA2B3] font-aeonikpro">Provider:</span>
                              <span className="ml-2 font-medium capitalize text-[#EDEFF7]">{payment.provider}</span>
                            </div>
                            <div>
                              <span className="text-[#9DA2B3] font-aeonikpro">Processed:</span>
                              <span className="ml-2 font-medium text-[#EDEFF7]">{formatDate(payment.processedAt)}</span>
                            </div>
                            <div>
                              <span className="text-[#9DA2B3] font-aeonikpro">Charge ID:</span>
                              <span className="ml-2 font-mono text-xs text-[#EDEFF7]">{payment.providerCharge}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                <CardHeader>
                  <CardTitle className="text-[#EDEFF7] font-aeonikpro">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#9DA2B3] font-aeonikpro">Order ID:</span>
                      <span className="font-mono text-sm text-[#EDEFF7]">{order.id.slice(-12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9DA2B3] font-aeonikpro">Total Amount:</span>
                      <span className="font-semibold text-lg text-green-400">{formatPrice(order.totalCents, order.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9DA2B3] font-aeonikpro">Currency:</span>
                      <span className="font-medium text-[#EDEFF7]">{order.currency.toUpperCase()}</span>
                    </div>
                    {order.provider && (
                      <div className="flex justify-between">
                        <span className="text-[#9DA2B3] font-aeonikpro">Payment Method:</span>
                        <span className="font-medium capitalize text-[#EDEFF7]">{order.provider}</span>
                      </div>
                    )}

                    <Separator className="bg-[#9DA2B3]/25" />

                    <div className="flex justify-between">
                      <span className="text-[#9DA2B3] font-aeonikpro">Created:</span>
                      <span className="text-sm text-[#EDEFF7]">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-[#9DA2B3] font-aeonikpro">Paid:</span>
                        <span className="text-sm text-[#EDEFF7]">{formatDate(order.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                <CardHeader>
                  <CardTitle className="text-[#EDEFF7] font-aeonikpro">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button className="w-full">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
