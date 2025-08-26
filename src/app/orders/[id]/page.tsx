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
  XCircle
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
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-muted text-gray-800'
      case 'cancelled':
        return 'bg-muted text-gray-800'
      default:
        return 'bg-muted text-gray-800'
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


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">{error || "The order you're looking for could not be found."}</p>
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
      <Navbar />
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/orders')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>

          {/* Order Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-muted-foreground mt-1">Placed on {formatDate(order.createdAt)}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Items Purchased</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div className="flex items-center space-x-4">
                          {item.workflow.heroImageUrl ? (
                            <img
                              src={item.workflow.heroImageUrl}
                              alt={item.workflow.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.workflow.title}</h4>
                            {item.pricingPlan && <p className="text-sm text-muted-foreground">{item.pricingPlan.name} Plan</p>}
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-muted-foreground">Quantity: {item.quantity}</span>
                              <span className="text-sm font-medium text-green-600">
                                {formatPrice(item.unitPriceCents, order.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {order.status === 'paid' && (
                            <div className="flex gap-2">
                              <CopyButton 
                                workflowId={item.workflowId}
                    
                              />
                              <Button variant='outline' size="sm" onClick={() => handleDownloadZip(item.workflowId, item.workflow.title)}>
                                <Download className="w-4 h-4 mr-2" />
                                ZIP
                              </Button>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/workflow/${item.workflowId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.payments && order.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.payments.map((payment) => (
                        <div key={payment.id} className="p-4 bg-background rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Payment #{payment.id.slice(-8)}</span>
                            <Badge className={`${getStatusColor(payment.status)} border-0`}>{payment.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="ml-2 font-medium">
                                {formatPrice(payment.amountCents, payment.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <span className="ml-2 font-medium capitalize">{payment.provider}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Processed:</span>
                              <span className="ml-2 font-medium">{formatDate(payment.processedAt)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Charge ID:</span>
                              <span className="ml-2 font-mono text-xs">{payment.providerCharge}</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono text-sm">{order.id.slice(-12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-semibold text-lg">{formatPrice(order.totalCents, order.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">{order.currency.toUpperCase()}</span>
                    </div>
                    {order.provider && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium capitalize">{order.provider}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-sm">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid:</span>
                        <span className="text-sm">{formatDate(order.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                    {order.status === 'paid' && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download All Items
                      </Button>
                    )}
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
