'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2, AlertCircle } from 'lucide-react'
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
  const router = useRouter()
  const pathname = usePathname()
  const { addToCart, hasItem } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' } | null>(null)

  const isInCart = hasItem(workflowId)

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const showMessage = (text: string, type: 'error' = 'error') => {
    setMessage({ text, type })
  }

  const handleAddToCart = async () => {
    if (disabled || loading || isInCart) return

    if (!user) {
      // Rediriger vers la page de login avec le chemin actuel comme paramètre de retour
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`)
      return
    }

    try {
      setLoading(true)
      await addToCart({
        workflowId,
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      showMessage(error instanceof Error ? error.message : 'Failed to add item to cart', 'error')
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

  // Afficher le message d'erreur dans le bouton
  if (message) {
    return (
      <Button
        size={size}
        className={`${className} transition-all duration-300 bg-red-500/30 hover:bg-red-600 text-white border-red-500`}
        disabled
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        {message.text}
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
