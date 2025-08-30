'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './useAuth'
import type { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null

  // Cart actions
  addToCart: (item: AddToCartRequest) => Promise<boolean>
  removeFromCart: (itemId: string) => Promise<boolean>
  updateCartItem: (itemId: string, data: UpdateCartItemRequest) => Promise<boolean>
  clearCart: () => Promise<boolean>

  // Cart computations
  getItemsCount: () => number
  hasItem: (workflowId: string, pricingPlanId?: string) => boolean

  // Cart operations
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch cart data
  const fetchCart = async () => {
    if (!user) {
      setCart(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cart')
      if (!response.ok) {
        if (response.status === 404) {
          // No cart exists yet, create empty state
          setCart(null)
          return
        }
        throw new Error('Failed to fetch cart')
      }

      const data = await response.json()
      setCart(data.cart)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  // Load cart when user changes
  useEffect(() => {
    fetchCart()
  }, [user])

  // Add item to cart
  const addToCart = async (item: AddToCartRequest): Promise<boolean> => {
    if (!user) {
      setError('Please login to add items to cart')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add item to cart')
      }

      const data = await response.json()
      setCart(data.cart)
      return true
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to add item to cart')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId: string): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove item from cart')
      }

      const data = await response.json()
      setCart(data.cart)
      return true
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update cart item quantity
  const updateCartItem = async (itemId: string, updateData: UpdateCartItemRequest): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update cart item')
      }

      const data = await response.json()
      setCart(data.cart)
      return true
    } catch (err) {
      console.error('Error updating cart item:', err)
      setError(err instanceof Error ? err.message : 'Failed to update cart item')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Clear cart
  const clearCart = async (): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear cart')
      }

      setCart(null)
      return true
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear cart')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get total items count
  const getItemsCount = (): number => {
    if (!cart) return 0
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Check if workflow is in cart
  const hasItem = (workflowId: string, pricingPlanId?: string): boolean => {
    if (!cart) return false
    return cart.items.some((item) => item.workflowId === workflowId && item.pricingPlanId === pricingPlanId)
  }

  // Refresh cart
  const refreshCart = async (): Promise<void> => {
    await fetchCart()
  }

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getItemsCount,
    hasItem,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
