'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, ShoppingCart, Trash2, ArrowRight, File } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

interface CartSliderProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSlider({ isOpen, onClose }: CartSliderProps) {
  console.log('CartSlider rendered, isOpen:', isOpen)
  const { cart, loading, removeFromCart } = useCart()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId)
    try {
      await removeFromCart(itemId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleCheckout = () => {
    // Don't close the slider, just navigate to cart page
    router.push('/cart')
  }

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceCents / 100)
  }

  const totalAmount =
    cart?.items.reduce((total, item) => {
      const price = item.workflow.basePriceCents
      return total + price
    }, 0) || 0

  const totalItems = cart?.items.length || 0

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

      {/* Cart slider */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            {cart && cart.items.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalItems}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading cart...</p>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-4">Add some workflows to get started</p>
                <Button onClick={onClose} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0">
                          {item.workflow.heroImageUrl ? (
                            <img
                              src={item.workflow.heroImageUrl}
                              alt={item.workflow.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{item.workflow.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">by {item.workflow.seller.displayName}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.workflow.basePriceCents)}
                          </p>
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating === item.id}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Price display */}
                      <div className="flex items-center justify-end">
                        <p className="text-sm font-semibold">{formatPrice(item.workflow.basePriceCents)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer with total and checkout */}
              <div className="border-t p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-900">
                    <span>Total ({totalItems} items):</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Go to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">Secure checkout powered by Stripe</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
