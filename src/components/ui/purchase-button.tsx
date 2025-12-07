'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2, AlertCircle } from 'lucide-react'
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
  const pathname = usePathname()
  const { user } = useAuth()
  const { addToCart, hasItem } = useCart()
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

  const handlePurchase = async () => {
    if (disabled || loading) return

    if (!user) {
      // Rediriger vers la page de login avec le chemin actuel
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`)
      return
    }

    try {
      setLoading(true)

      // Si l'article est déjà dans le panier, rediriger directement vers le panier
      if (isInCart) {
        router.push('/cart')
        return
      }

      // Sinon, ajouter au panier puis rediriger
      await addToCart({
        workflowId,
      })

      // Rediriger vers le panier
      router.push('/cart')
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
    <Button
      size={size}
      className={`${className} cursor-pointer`}
      onClick={handlePurchase}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : ''}
      {children || `Buy Now - ${formatPrice(price, currency)}`}
    </Button>
  )
}
