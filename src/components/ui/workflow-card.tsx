'use client'

import { Download, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatedHeart } from './animated-heart'
import { Badge } from './badge'

interface WorkflowCardProps {
  id: string
  title: string
  description: string
  price: number
  currency?: string
  platform?: string
  rating: number
  salesCount: number
  // Marketplace-specific props (optional)
  isFavorite?: boolean
  onFavoriteChange?: (favorite: boolean) => void
  heroImage?: string
  categories?: string[]
  tags?: string[]
  seller?: string
  sellerAvatarUrl?: string | null
  isFake?: boolean
}

const platformLogos = {
  zapier: {
    color: '/images/hero/zapier-color.png',
  },
  n8n: {
    color: '/images/hero/n8n-color.png',
  },
  make: {
    color: '/images/hero/make-color.png',
  },
  airtable_script: {
    color: '/images/hero/airtable-color.png',
  },
}

export function WorkflowCard({
  id,
  title,
  description,
  price,
  currency = 'USD',
  platform,
  rating,
  salesCount,
  isFavorite = false,
  onFavoriteChange,
  heroImage,
  categories = [],
  tags = [],
  seller,
  sellerAvatarUrl,
  isFake = false,
}: WorkflowCardProps) {
  const router = useRouter()
  const [favorite, setFavorite] = useState(isFavorite)

  const handleClick = (e: React.MouseEvent) => {
    if (isFake) {
      e.preventDefault()
      alert('This is a demo workflow. Real workflows will be available soon!')
    } else {
      router.push(`/workflow/${id}`)
    }
  }

  const handleFavoriteClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation()

    try {
      if (favorite) {
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId: id }),
        })
        if (response.ok) {
          setFavorite(false)
          onFavoriteChange?.(false)
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId: id }),
        })
        if (response.ok) {
          setFavorite(true)
          onFavoriteChange?.(true)
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  const platformLogo = platform ? platformLogos[platform as keyof typeof platformLogos] : null

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer border border-[#3a3a3a] rounded-xl overflow-hidden hover:border-[#505050] transition-all duration-300 hover:shadow-md flex flex-col h-full bg-[#1a1a1a] hover:bg-[#222222]"
    >
      {/* Favorite button - only show if onFavoriteChange is provided (marketplace mode) */}
      {onFavoriteChange && (
        <div className="absolute top-3 right-3 z-10">
          <AnimatedHeart
            isFavorite={favorite}
            onToggle={(e) => handleFavoriteClick(e)}
            className="bg-black/80 hover:bg-black"
            size="md"
          />
        </div>
      )}

      {/* Hero Section with Platform Logo */}
      <div className="h-48 relative overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="relative w-full h-full rounded-lg bg-[#2a2a2a] dots-pattern p-4 flex flex-col justify-between overflow-hidden border-b border-[#3a3a3a]">
            {/* Platform logo - centered */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              {platformLogo && (
                <div className="relative w-16 h-16">
                  <img
                    src={platformLogo.color}
                    alt={platform}
                    className="w-full h-full object-contain opacity-80"
                  />
                </div>
              )}
            </div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-5" />
          </div>
        )}

        {/* Rating Badge - top left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-white">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price Badge - top right */}
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
            <span className="text-xs font-bold text-black">{formatPrice(price)}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pt-4 pb-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 font-aeonikpro">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#999999] line-clamp-2 flex-1 font-aeonikpro mb-2">
          {description}
        </p>

        {/* Categories - only show if provided */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {categories.slice(0, 2).map((category) => (
              <Badge 
                key={category} 
                className="text-xs bg-[#2a2a2a] text-[#b0b0b0] border border-[#3a3a3a] rounded-md"
              >
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge className="text-xs bg-[#2a2a2a] text-[#b0b0b0] border border-[#3a3a3a]">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="border-t border-[#2a2a2a] my-2" />

        {/* Seller info - only show if provided */}
        {seller && (
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-[#999999] truncate">by {seller}</span>
            <div className="flex items-center gap-1 text-[#777777]">
              <Download className="w-3 h-3" />
              <span className="font-medium">{salesCount} sales</span>
            </div>
          </div>
        )}

        {/* Sales count - only show if no seller (landing page mode) */}
        {!seller && (
          <div className="text-xs text-[#777777] mb-3 flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{salesCount} sales</span>
          </div>
        )}
      </div>
    </div>
  )
}
