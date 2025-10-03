'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

interface PurchaseButtonProps {
  workflowId: string
  price: number
  currency: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
}

export function PurchaseButton({
  workflowId,
  price,
  currency,
  disabled = false,
  className,
  size = 'lg',
  children,
}: PurchaseButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (disabled || loading) return

    if (!user) {
      alert('Please login to add items to cart')
      return
    }

    try {
      setLoading(true)

      // Add to cart
      const success = await addToCart({
        workflowId,
      })

      if (success) {
        // Redirect to cart page
        router.push('/cart')
      } else {
        throw new Error('Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error instanceof Error ? error.message : 'Failed to add item to cart')
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
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : ''}
      {children || `Add to Cart - ${formatPrice(price, currency)}`}
    </Button>
  )
}
