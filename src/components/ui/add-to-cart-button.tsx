'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

interface AddToCartButtonProps {
  workflowId: string
  price: number
  currency: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
}

export function AddToCartButton({
  workflowId,
  price,
  currency,
  disabled = false,
  className,
  size = 'default',
  children,
}: AddToCartButtonProps) {
  const { addToCart, hasItem } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const isInCart = hasItem(workflowId)

  const handleAddToCart = async () => {
    if (disabled || loading || isInCart) return

    if (!user) {
      alert('Please login to add items to cart')
      return
    }

    try {
      setLoading(true)
      await addToCart({
        workflowId,
      })
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

  if (isInCart) {
    return (
      <Button size={size} className={className} disabled>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Already in Cart
      </Button>
    )
  }

  return (
    <Button size={size} className={className} onClick={handleAddToCart} disabled={disabled || loading}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
      {children || `Add to Cart - ${formatPrice(price, currency)}`}
    </Button>
  )
}
