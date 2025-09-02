'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/components/ui/cart-item'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShoppingCart, CreditCard } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MultiVendorCheckout from '@/components/MultiVendorCheckout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function CartPage() {
  const { user } = useAuth()
  const { cart, loading, clearCart } = useCart()
  const router = useRouter()
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

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

  // Calculate total amount
  const totalAmount =
    cart?.items.reduce((total, item) => {
      const price = item.workflow.basePriceCents
      return total + price
    }, 0) || 0

  // Check if cart has multiple sellers
  const hasMultipleSellers =
    cart && cart.items.length > 0 && new Set(cart.items.map((item) => item.workflow.sellerId)).size > 1

  // Group items by seller
  const itemsBySeller = cart
    ? cart.items.reduce((acc, item) => {
        const sellerId = item.workflow.sellerId
        if (!acc[sellerId]) {
          acc[sellerId] = []
        }
        acc[sellerId].push(item)
        return acc
      }, {} as Record<string, typeof cart.items>)
    : {}

  const sellerGroups = Object.entries(itemsBySeller)

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setPaymentError(null)
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push('/checkout/success')
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setPaymentSuccess(false)
  }

  // Show success message
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h1>
            <p className="text-muted-foreground mb-4">
              All your payments have been processed successfully. Redirecting to success page...
            </p>
          </div>
        </div>
      </div>
    )
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
              <div className="space-y-8">
                {sellerGroups.map(([sellerId, sellerItems]) => {
                  const seller = sellerItems[0].workflow.seller
                  const sellerTotal = sellerItems.reduce((total, item) => {
                    const price = item.workflow.basePriceCents
                    return total + price
                  }, 0)

                  return (
                    <div key={sellerId} className="border rounded-lg p-6">
                      {/* Seller header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                            {(seller.sellerProfile?.storeName || seller.displayName).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {seller.sellerProfile?.storeName || seller.displayName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {sellerItems.length} {sellerItems.length === 1 ? 'item' : 'items'} • $
                              {(sellerTotal / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {sellerGroups.length > 1 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Multi-vendor order
                          </Badge>
                        )}
                      </div>

                      {/* Seller items */}
                      <div className="space-y-4">
                        {sellerItems.map((item) => (
                          <CartItem key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator className="my-6" />

              {/* Multi-seller notice */}
              {hasMultipleSellers && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Multi-Vendor Purchase</h4>
                  <p className="text-sm text-blue-700">
                    Your cart contains items from {new Set(cart.items.map((item) => item.workflow.sellerId)).size}{' '}
                    different sellers. You can pay for all items with a single payment form below.
                  </p>
                </div>
              )}

              {/* Unified checkout for all cases */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiVendorCheckout
                    cartId={cart.id}
                    totalAmount={totalAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  {paymentError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

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
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${(totalAmount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${(totalAmount / 100).toFixed(2)}</span>
                      </div>
                      {hasMultipleSellers && (
                        <div className="text-sm text-muted-foreground">
                          Payment will be distributed to{' '}
                          {new Set(cart.items.map((item) => item.workflow.sellerId)).size} sellers
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
