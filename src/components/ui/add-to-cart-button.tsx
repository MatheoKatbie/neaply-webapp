'use client'

import React, { useState } from 'react'
import { ShoppingCart, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

interface AddToCartButtonProps {
  workflowId: string
  pricingPlanId?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
  quantity?: number
}

export function AddToCartButton({
  workflowId,
  pricingPlanId,
  disabled = false,
  className,
  size = 'default',
  children,
  quantity = 1,
}: AddToCartButtonProps) {
  const { user } = useAuth()
  const { addToCart, hasItem, loading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isInCart = hasItem(workflowId, pricingPlanId)

  const handleAddToCart = async () => {
    if (!user) {
      // Could redirect to login or show login modal
      alert('Please login to add items to cart')
      return
    }

    if (disabled || loading || isAdding || isInCart) return

    try {
      setIsAdding(true)
      const success = await addToCart({
        workflowId,
        pricingPlanId,
        quantity,
      })

      if (success) {
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // If already in cart, show different state
  if (isInCart) {
    return (
      <Button size={size} variant="outline" className={`cursor-pointer ${className}`} disabled>
        <Check className="w-4 h-4 mr-2" />
        In Cart
      </Button>
    )
  }

  // If just added, show success state briefly
  if (justAdded) {
    return (
      <Button size={size} className={`cursor-pointer bg-green-600 hover:bg-green-700 ${className}`} disabled>
        <Check className="w-4 h-4 mr-2" />
        Added to Cart!
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant="outline"
      className={`cursor-pointer ${className}`}
      onClick={handleAddToCart}
      disabled={disabled || loading || isAdding}
    >
      {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
      {children || 'Add to Cart'}
    </Button>
  )
}
