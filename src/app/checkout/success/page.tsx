'use client'

import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order } from '@/types/payment'
import { ArrowRight, CheckCircle, Copy, Download, Home } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { downloadWorkflowAsZip, downloadPackAsZip } from '@/lib/download-utils'
import { CopyButton } from '@/components/ui/copy-button'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        // Try the public API first (no authentication required)
        const response = await fetch(`/api/orders/public/${orderId}`)
        if (!response.ok) {
          // If public API fails, try the authenticated API
          const authResponse = await fetch(`/api/orders/${orderId}`, {
            credentials: 'include',
          })
          if (!authResponse.ok) {
            throw new Error('Failed to fetch order details')
          }
          const authData = await authResponse.json()
          setOrder(authData.order)
        } else {
          const data = await response.json()
          setOrder(data.order)
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleDownloadZip = async (workflowId: string, workflowTitle: string) => {
    try {
      await downloadWorkflowAsZip(workflowId, workflowTitle)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download workflow. Please try again.')
    }
  }

  const handleDownloadPack = async (packId: string, packTitle: string) => {
    try {
      await downloadPackAsZip(packId, packTitle)
    } catch (error) {
      console.error('Download pack error:', error)
      alert('Failed to download pack. Please try again.')
    }
  }

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
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
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "The order you're looking for could not be found."}
                </p>
                <Button onClick={() => router.push('/marketplace')}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Marketplace
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your workflows and packs are ready for download.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                  <p className="text-lg font-mono">{order.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                  <p className="text-lg font-semibold text-green-600">
                    {formatPrice(order.totalCents, order.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Payment Date</span>
                  <p className="text-lg">
                    {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Processing...'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <p className="text-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status === 'paid' ? 'Completed' : order.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items (Workflows) */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Workflows</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div className="flex items-center space-x-4">
                        {item.workflow.heroImageUrl ? (
                          <img
                            src={item.workflow.heroImageUrl}
                            alt={item.workflow.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Download className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{item.workflow.title}</h4>
                          {item.pricingPlan && (
                            <p className="text-sm text-muted-foreground">{item.pricingPlan.name} Plan</p>
                          )}
                          <p className="text-sm font-medium text-green-600">
                            {formatPrice(item.unitPriceCents, order.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CopyButton workflowId={item.workflowId} />
                        <Button
                          size="sm"
                          onClick={() => handleDownloadZip(item.workflowId, item.workflow.title)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download ZIP
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/workflow/${item.workflowId}`)}
                          className="cursor-pointer"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.packItems && order.packItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Packs</h3>
                  <div className="space-y-4">
                    {order.packItems.map((packItem) => (
                      <div key={packItem.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div className="flex items-center space-x-4">
                          {packItem.pack.heroImageUrl ? (
                            <img
                              src={packItem.pack.heroImageUrl}
                              alt={packItem.pack.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Download className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{packItem.pack.title}</h4>
                            {packItem.pack.workflows && (
                              <p className="text-sm text-muted-foreground">
                                {packItem.pack.workflows.length} workflows included
                              </p>
                            )}
                            <p className="text-sm font-medium text-green-600">
                              {formatPrice(packItem.unitPriceCents, order.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadPack(packItem.packId, packItem.pack.title)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Pack
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/packs/${packItem.packId}`)}
                            className="cursor-pointer"
                          >
                            View Pack
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Download your workflows</p>
                    <p className="text-sm text-muted-foreground">
                      Click the download buttons above to get your workflow files.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Import to n8n</p>
                    <p className="text-sm text-muted-foreground">
                      Open n8n and import the downloaded workflow files to start using them.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Need help?</p>
                    <p className="text-sm text-muted-foreground">
                      Check the workflow documentation or contact the creator for support.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button variant="outline" onClick={() => router.push('/marketplace')} className="cursor-pointer">
              <Home className="w-4 h-4 mr-2" />
              Browse More Workflows
            </Button>
            <Button onClick={() => router.push('/dashboard/seller')} className="cursor-pointer">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background pt-20 md:pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
