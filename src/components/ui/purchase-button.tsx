'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe-client'
import type { CreateCheckoutSessionRequest } from '@/types/payment'

interface PurchaseButtonProps {
  workflowId: string
  pricingPlanId?: string
  price: number
  currency: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
}

export function PurchaseButton({
  workflowId,
  pricingPlanId,
  price,
  currency,
  disabled = false,
  className,
  size = 'lg',
  children,
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (disabled || loading) return

    try {
      setLoading(true)

      // Create checkout session
      const checkoutData: CreateCheckoutSessionRequest = {
        workflowId,
        pricingPlanId,
      }

      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error initiating purchase:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout process')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  return (
    <Button
      size={size}
      className={`${className} cursor-pointer`}
      onClick={handlePurchase}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
      {children || `Purchase ${formatPrice(price, currency)}`}
    </Button>
  )
}
