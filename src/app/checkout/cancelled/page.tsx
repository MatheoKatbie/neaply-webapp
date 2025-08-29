'use client'

import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Home, ShoppingCart, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CheckoutCancelledContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')

  return (
    <>
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-orange-500" />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">Payment Cancelled</h1>
              <p className="text-lg text-muted-foreground mb-2">Your payment was cancelled and no charges were made.</p>
              <p className="text-muted-foreground mb-8">
                You can try again anytime or continue browsing our marketplace.
              </p>

              {orderId && (
                <div className="bg-background rounded-lg p-4 mb-8">
                  <p className="text-sm text-muted-foreground">
                    Order ID: <span className="font-mono">{orderId}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This order has been cancelled and will not be processed.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={() => router.push('/marketplace')} className="cursor-pointer">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>

                <Button variant="ghost" onClick={() => router.push('/')} className="cursor-pointer">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Payment Issues</p>
                  <p className="text-muted-foreground">
                    If you encountered technical difficulties during checkout, please try again or contact support.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Questions about Workflows</p>
                  <p className="text-muted-foreground">
                    Browse our marketplace to discover automation workflows for your business needs.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Customer Support</p>
                  <p className="text-muted-foreground">
                    Contact our support team if you need assistance with your purchase or account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function CheckoutCancelledPage() {
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
      <CheckoutCancelledContent />
    </Suspense>
  )
}
