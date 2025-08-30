'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

interface CartSliderProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSlider({ isOpen, onClose }: CartSliderProps) {
  console.log('CartSlider rendered, isOpen:', isOpen)
  const { cart, loading, removeFromCart, updateCartItem } = useCart()
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

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setIsUpdating(itemId)
    try {
      await updateCartItem(itemId, { quantity: newQuantity })
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setIsUpdating(null)
    }
  }

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
      const price = item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
      return total + price * item.quantity
    }, 0) || 0

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />}

      {/* Slider */}
      <div
        className={`fixed top-1/2 right-0 -translate-y-1/2 h-[calc(100vh)] w-full max-w-md bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-lg ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            {totalItems > 0 && (
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            // Empty cart
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add some workflows to get started</p>
              <Button
                onClick={() => {
                  router.push('/marketplace')
                }}
              >
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Item image */}
                          <div className="flex-shrink-0">
                            {item.workflow.heroImageUrl ? (
                              <img
                                src={item.workflow.heroImageUrl}
                                alt={item.workflow.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Item details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.workflow.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              by {item.workflow.seller.sellerProfile?.storeName || item.workflow.seller.displayName}
                            </p>
                            {item.pricingPlan && (
                              <p className="text-xs text-muted-foreground mb-2">{item.pricingPlan.name} Plan</p>
                            )}
                            <p className="text-sm font-semibold text-green-600">
                              {formatPrice(
                                item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
                              )}
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

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id || item.quantity <= 1}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {isUpdating === item.id ? '...' : item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(
                              (item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents) *
                                item.quantity
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Footer with total and checkout */}
              <div className="border-t p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-xl font-bold text-green-600">{formatPrice(totalAmount)}</span>
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
