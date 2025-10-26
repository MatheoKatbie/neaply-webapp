'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { ArrowRight, File, ShoppingCart, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    // Close the cart slider first
    onClose()
    // Then navigate to cart page
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
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      {/* Cart slider */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-[#0F0F13] border-l border-[#9DA2B3]/25 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - fixed height */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[#9DA2B3]/25 bg-[#1E1E24]">
          <div className="flex items-center gap-3">
            <div className="p-2 text-primary-foreground rounded-lg">
              <ShoppingCart className="w-5 h-5 " />
            </div>
            <h2 className="text-lg font-semibold text-[#EDEFF7] font-aeonikpro">Shopping Cart</h2>
            {cart && cart.items.length > 0 && (
              <Badge className="ml-2 bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {totalItems}
              </Badge>
            )}
          </div>
          <Button
            onClick={onClose}
            className="!p-2"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - flexible height with proper scroll */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#161619]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-[#9DA2B3]">Loading cart...</p>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="p-3 bg-[#1E1E24] rounded-lg inline-flex mb-4">
                  <ShoppingCart className="w-12 h-12 text-[#9DA2B3]/50" />
                </div>
                <h3 className="text-lg font-semibold text-[#EDEFF7] mb-2 font-aeonikpro">Your cart is empty</h3>
                <p className="text-sm text-[#9DA2B3]/70 mb-6">Add some workflows to get started</p>
                <Button onClick={onClose} variant="default" className="font-aeonikpro">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart items - scrollable with calculated height */}
              <div className="flex-1 overflow-y-auto p-6 pb-4 min-h-0">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="border border-[#9DA2B3]/20 rounded-lg p-4 bg-[#1E1E24] hover:bg-[#40424D]/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0">
                          {item.workflow.heroImageUrl ? (
                            <img
                              src={item.workflow.heroImageUrl}
                              alt={item.workflow.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-[#40424D]/40 rounded-lg flex items-center justify-center">
                              <File className="w-8 h-8 text-[#9DA2B3]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#EDEFF7] truncate font-aeonikpro">{item.workflow.title}</h4>
                          <p className="text-xs text-[#9DA2B3]/70 mb-2">by {item.workflow.seller.displayName}</p>
                          <p className="text-sm font-semibold text-primary-foreground">
                            {formatPrice(item.workflow.basePriceCents)}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating === item.id}
                          className="h-6 w-6 p-0 text-[#9DA2B3]/50 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer - fixed at bottom with proper spacing */}
              <div className="flex-shrink-0 border-t border-[#9DA2B3]/25 bg-[#1E1E24] p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold text-[#EDEFF7] font-aeonikpro">
                    <span>Total ({totalItems} items):</span>
                    <span className="text-lg ">{formatPrice(totalAmount)}</span>
                  </div>

                  <Button variant="outline" onClick={handleCheckout} className="w-full" size="lg">
                    Go to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-xs text-[#9DA2B3]/60 text-center">Secure checkout powered by Stripe</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
