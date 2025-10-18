'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface CartItemProps {
  item: {
    id: string
    workflowId: string
    quantity: number
    workflow: {
      id: string
      title: string
      slug: string
      shortDesc: string
      heroImageUrl?: string
      basePriceCents: number
      currency: string
      sellerId: string
      seller: {
        id: string
        displayName: string
        storeName?: string
        slug?: string
        sellerProfile?: {
          storeName?: string
        }
      }
    }
  }
}

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await removeFromCart(item.id)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100)
  }

  const getPrice = () => item.workflow.basePriceCents
  const getCurrency = () => item.workflow.currency

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {/* Item image */}
      <div className="flex-shrink-0">
        {item.workflow.heroImageUrl ? (
          <img
            src={item.workflow.heroImageUrl}
            alt={item.workflow.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        ) : (
          <div className="w-20 h-20 bg-[#40424D]/40 rounded-lg flex items-center justify-center">
            <span className="text-[#9DA2B3] text-2xl">📄</span>
          </div>
        )}
      </div>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.workflow.title}</h3>
        <p className="text-sm text-gray-500 mb-1">
          by {item.workflow.seller.sellerProfile?.storeName || item.workflow.seller.displayName}
        </p>
        <p className="text-sm text-[#9DA2B3] mb-2">{item.workflow.shortDesc}</p>
        <p className="text-lg font-semibold text-green-600">{formatPrice(getPrice(), getCurrency())}</p>
      </div>

      {/* Price display */}
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">{formatPrice(getPrice(), getCurrency())}</p>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isUpdating}
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
