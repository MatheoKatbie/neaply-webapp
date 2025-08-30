'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CartItemComponent } from '@/components/ui/cart-item'
import { CartSummary } from '@/components/ui/cart-summary'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CartPage() {
  const { user } = useAuth()
  const { cart, loading, clearCart } = useCart()
  const router = useRouter()

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please login to view your cart</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to manage your cart.</p>
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {cart?.items.length || 0} {cart?.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {cart && cart.items.length > 0 && (
              <Button variant="outline" onClick={handleClearCart}>
                Clear Cart
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!cart || cart.items.length === 0 ? (
          // Empty cart
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any workflows to your cart yet. Browse our marketplace to find amazing
              workflows.
            </p>
            <Link href="/marketplace">
              <Button size="lg">Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          // Cart with items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>

              <Separator className="my-6" />

              {/* Continue shopping */}
              <div className="flex justify-between items-center">
                <Link href="/marketplace">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cart summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CartSummary />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
