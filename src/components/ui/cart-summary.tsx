'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, CreditCard, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

interface CartSummaryProps {
  className?: string
  showCheckoutButton?: boolean
}

export function CartSummary({ className, showCheckoutButton = true }: CartSummaryProps) {
  const { getCartSummary, loading } = useCart()
  const router = useRouter()
  const summary = getCartSummary()
  const [isProcessing, setIsProcessing] = useState(false)

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  const handleCheckout = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)

      const response = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()

      // Handle multi-seller cart
      if (data.isMultiSeller && data.sessions) {
        // Store the sessions in sessionStorage for the multi-seller checkout page
        sessionStorage.setItem('multiSellerSessions', JSON.stringify(data.sessions))

        // Redirect to a multi-seller checkout page
        router.push('/checkout/multi-seller')
        return
      }

      // Handle single seller cart (existing behavior)
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout process')
    } finally {
      setIsProcessing(false)
    }
  }

  if (summary.totalItems === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground text-center">Browse our marketplace to find amazing workflows</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items ({summary.totalItems})</span>
            <span>{formatPrice(summary.totalCents, summary.currency)}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(summary.totalCents, summary.currency)}</span>
          </div>
        </div>

        {showCheckoutButton && (
          <div className="space-y-2">
            <Button
              className="w-full cursor-pointer"
              onClick={handleCheckout}
              disabled={loading || summary.totalItems === 0 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Secure checkout powered by Stripe</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
