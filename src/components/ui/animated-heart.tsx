'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import React, { useState } from 'react'

interface AnimatedHeartProps {
  isFavorite: boolean
  onToggle: (e?: React.MouseEvent) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'default'
}

export function AnimatedHeart({
  isFavorite,
  onToggle,
  className = '',
  size = 'md',
  variant = 'ghost',
}: AnimatedHeartProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Trigger animation
    setIsAnimating(true)

    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)

    onToggle(e)
  }

  return (
    <Button
      variant={variant}
      size="icon"
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      onClick={handleClick}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all duration-300 ${
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'
        } ${isAnimating ? 'animate-pulse scale-125' : ''}`}
      />
    </Button>
  )
}
