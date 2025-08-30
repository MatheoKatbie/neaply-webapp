'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CreditCard, ShoppingCart, ExternalLink, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SellerSession {
  orderId: string
  sellerId: string
  sellerName: string
  sessionUrl: string
  totalCents: number
}

export default function MultiSellerCheckoutPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SellerSession[]>([])
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get sessions from sessionStorage
    const storedSessions = sessionStorage.getItem('multiSellerSessions')
    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions)
        setSessions(parsedSessions)
      } catch (error) {
        console.error('Error parsing stored sessions:', error)
        router.push('/cart')
      }
    } else {
      // No sessions found, redirect to cart
      router.push('/cart')
    }
    setLoading(false)
  }, [router])

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Assuming USD for now
    }).format(priceCents / 100)
  }

  const totalAmount = sessions.reduce((sum, session) => sum + session.totalCents, 0)

  const handlePaySeller = (sessionUrl: string, orderId: string) => {
    // Mark this session as in progress
    setCompletedSessions((prev) => new Set([...prev, orderId]))

    // Open Stripe checkout in new tab
    window.open(sessionUrl, '_blank')
  }

  const markAsCompleted = (orderId: string) => {
    setCompletedSessions((prev) => new Set([...prev, orderId]))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No checkout sessions found</h2>
            <p className="text-muted-foreground mb-8">
              It looks like there was an issue with your checkout sessions. Please try again.
            </p>
            <Link href="/cart">
              <Button size="lg">Return to Cart</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/cart">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Multi-Seller Checkout</h1>
            <p className="text-muted-foreground">
              Complete separate payments for each seller ({sessions.length}{' '}
              {sessions.length === 1 ? 'seller' : 'sellers'})
            </p>
          </div>
        </div>

        {/* Multi-seller explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Why separate payments?</h3>
          <p className="text-sm text-blue-700">
            Due to payment processing requirements, each seller needs to receive payment through their own Stripe
            account. You'll complete a separate, secure checkout for each seller.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Sellers</span>
                <span>{sessions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed Payments</span>
                <span>
                  {completedSessions.size} / {sessions.length}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Sessions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Complete Payments</h2>

          {sessions.map((session, index) => {
            const isCompleted = completedSessions.has(session.orderId)

            return (
              <Card key={session.orderId} className={isCompleted ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                          {session.sellerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{session.sellerName}</h3>
                          <p className="text-sm text-muted-foreground">Order #{session.orderId.slice(0, 8)}...</p>
                        </div>
                      </div>

                      <Badge variant={isCompleted ? 'default' : 'secondary'} className="ml-4">
                        {isCompleted ? 'Completed' : `${index + 1} of ${sessions.length}`}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatPrice(session.totalCents)}</p>
                        <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
                      </div>

                      {isCompleted ? (
                        <Button variant="outline" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          Paid
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handlePaySeller(session.sessionUrl, session.orderId)}
                          className="min-w-[120px]"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Payment Instructions</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Click "Pay Now" for each seller to open a secure Stripe checkout in a new tab</li>
            <li>Complete the payment process for each seller</li>
            <li>Return to this page to track your progress</li>
            <li>All payments must be completed to finalize your purchases</li>
          </ol>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/cart">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>

          {completedSessions.size === sessions.length && (
            <Link href="/orders">
              <Button>View My Orders</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
