'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlatformBadge } from '@/components/ui/platform-badge'
import { getTagLogoWithFallback } from '@/lib/tag-logos'
import { Star, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WorkflowCardMiniProps {
  id: string
  title: string
  shortDesc: string
  price: number
  currency: string
  rating: number
  ratingCount: number
  salesCount: number
  heroImage?: string
  platform?: string
  categories: string[]
  tags: string[]
  slug: string
  seller: {
    displayName: string
    storeName?: string
    slug?: string
  }
  version: string
  className?: string
}

export function WorkflowCardMini({
  id,
  title,
  shortDesc,
  price,
  currency,
  rating,
  ratingCount,
  salesCount,
  heroImage,
  platform,
  categories,
  tags,
  slug,
  seller,
  version,
  className = '',
}: WorkflowCardMiniProps) {
  const router = useRouter()

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  const handleClick = () => {
    router.push(`/workflow/${id}`)
  }

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Hero Image */}
        {heroImage && (
          <div className="w-full h-24 bg-muted rounded-md mb-3 overflow-hidden relative">
            <img src={heroImage} alt={title} className="w-full h-full object-cover" />
            {platform && (
              <div className="absolute top-2 left-2">
                <PlatformBadge platform={platform} size="sm" variant="default" className="text-xs shadow-sm" />
              </div>
            )}
          </div>
        )}

        {/* Title and Description */}
        <div className="space-y-2 mb-3">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{shortDesc}</p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs text-muted-foreground px-2 py-0.5 flex items-center gap-1">
                <img
                  src={getTagLogoWithFallback(tag)}
                  alt={`${tag} logo`}
                  className="w-3 h-3 object-contain"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats and Price */}
        <div className="flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-3">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span>{salesCount}</span>
            </div>
          </div>
          <div className="font-semibold text-green-600">{formatPrice(price, currency)}</div>
        </div>

        {/* Seller */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-muted-foreground truncate">by {seller.storeName || seller.displayName}</p>
        </div>
      </CardContent>
    </Card>
  )
}
