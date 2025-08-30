'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import type { CartItem } from '@/types/cart'

interface CartItemComponentProps {
  item: CartItem
  className?: string
}

export function CartItemComponent({ item, className }: CartItemComponentProps) {
  const { updateCartItem, removeFromCart, loading } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  const getItemPrice = () => {
    return item.pricingPlan ? item.pricingPlan.priceCents : item.workflow.basePriceCents
  }

  const getItemCurrency = () => {
    return item.pricingPlan ? item.pricingPlan.currency : item.workflow.currency
  }

  const getTotalPrice = () => {
    const unitPrice = getItemPrice()
    return unitPrice * item.quantity
  }

  const handleQuantityChange = async (newQuantity: string) => {
    const quantity = parseInt(newQuantity)
    if (quantity === item.quantity || quantity < 1 || quantity > 10) return

    try {
      setIsUpdating(true)
      await updateCartItem(item.id, { quantity })
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      await removeFromCart(item.id)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <Link href={`/workflow/${item.workflow.id}`}>
              {item.workflow.heroImageUrl ? (
                <Image
                  src={item.workflow.heroImageUrl}
                  alt={item.workflow.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover cursor-pointer"
                />
              ) : (
                <AutoThumbnail
                  workflow={{
                    id: item.workflow.id,
                    title: item.workflow.title,
                    shortDesc: item.workflow.shortDesc,
                    longDescMd: '',
                    categories: [],
                    tags: [],
                  }}
                  size="sm"
                  className="w-20 h-20 cursor-pointer"
                />
              )}
            </Link>
          </div>

          {/* Item details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <Link href={`/workflow/${item.workflow.id}`}>
                  <h3 className="font-semibold text-sm hover:text-blue-600 cursor-pointer truncate">
                    {item.workflow.title}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  by {item.workflow.seller.storeName || item.workflow.seller.displayName}
                </p>
                {item.pricingPlan && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {item.pricingPlan.name}
                  </Badge>
                )}
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={loading || isRemoving}
                className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
              >
                {isRemoving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quantity and price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Qty:</label>
                <Select
                  value={item.quantity.toString()}
                  onValueChange={handleQuantityChange}
                  disabled={loading || isUpdating}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-right">
                <div className="font-semibold text-sm">
                  {formatPrice(getTotalPrice(), getItemCurrency())}
                </div>
                {item.quantity > 1 && (
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(getItemPrice(), getItemCurrency())} each
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
