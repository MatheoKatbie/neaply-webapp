'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

interface CartIconProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function CartIcon({ className, size = 'default' }: CartIconProps) {
  const { getItemsCount } = useCart()
  const router = useRouter()
  const itemsCount = getItemsCount()

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'

  const handleClick = () => {
    router.push('/cart')
  }

  return (
    <Button variant="ghost" size={size} onClick={handleClick} className={`relative cursor-pointer ${className}`}>
      <ShoppingCart className={iconSize} />
      {itemsCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
        >
          {itemsCount > 99 ? '99+' : itemsCount}
        </Badge>
      )}
    </Button>
  )
}
