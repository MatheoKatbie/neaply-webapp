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
    <div
      className={`cursor-pointer rounded-xl border border-[#9DA2B3]/25 overflow-hidden hover:border-[#9DA2B3]/50 transition-all duration-300 flex flex-col h-full ${className}`}
      style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
      onClick={handleClick}
    >
      {/* Hero Image */}
      <div className="relative h-32 p-2">
        {heroImage ? (
          <div className="w-full h-full rounded-lg overflow-hidden">
            <img src={heroImage} alt={title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-lg bg-[#1E1E24] dots-pattern flex items-center justify-center">
            {(() => {
              const platformLogos = {
                zapier: { gray: '/images/hero/zapier-grey.png', color: '/images/hero/zapier-color.png' },
                n8n: { gray: '/images/hero/n8n-grey.png', color: '/images/hero/n8n-color.png' },
                make: { gray: '/images/hero/make-grey.png', color: '/images/hero/make-color.png' },
                airtable_script: {
                  gray: '/images/hero/airtable-grey.png',
                  color: '/images/hero/airtable-color.png',
                },
              }
              const platformLogo = platformLogos[platform as keyof typeof platformLogos]
              if (platformLogo) {
                return (
                  <div className="w-12 h-12">
                    <img src={platformLogo.color} alt={platform} className="w-full h-full object-contain" />
                  </div>
                )
              }
              return null
            })()}
          </div>
        )}

        {/* Platform badge */}
        {platform && (
          <div className="absolute top-3 left-3">
            <div
              className="px-2 py-1 rounded-full font-aeonikpro text-xs font-medium"
              style={{ backgroundColor: '#FFF', color: '#40424D' }}
            >
              {platform}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Title and Description */}
        <div className="space-y-2 mb-3">
          <h3 className="font-aeonikpro font-semibold text-sm line-clamp-2 leading-tight" style={{ color: '#EDEFF7' }}>
            {title}
          </h3>
          <p className="font-aeonikpro text-xs line-clamp-2" style={{ color: '#9DA2B3' }}>
            {shortDesc}
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.slice(0, 2).map((category, index) => (
              <div
                key={index}
                className="px-2 py-0.5 rounded-full font-aeonikpro text-xs"
                style={{ backgroundColor: 'rgba(120, 153, 168, 0.2)', color: '#D3D6E0' }}
              >
                {category}
              </div>
            ))}
            {categories.length > 2 && (
              <div
                className="px-2 py-0.5 rounded-full font-aeonikpro text-xs border border-[#9DA2B3]/25"
                style={{ color: '#9DA2B3' }}
              >
                +{categories.length - 2}
              </div>
            )}
          </div>
        )}

        {/* Stats and Price */}
        <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-[#9DA2B3]/25">
          <div className="flex items-center gap-3 font-aeonikpro">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#FF7700]" fill="#FF7700" />
                <span style={{ color: '#EDEFF7' }}>{rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1" style={{ color: '#9DA2B3' }}>
              <Users className="w-3 h-3" />
              <span>{salesCount}</span>
            </div>
          </div>
          <div className="font-aeonikpro font-semibold text-green-500">{formatPrice(price, currency)}</div>
        </div>

        {/* Seller */}
        <div className="mt-2 pt-2 border-t border-[#9DA2B3]/25">
          <p className="font-aeonikpro text-xs truncate" style={{ color: '#9DA2B3' }}>
            by {seller.storeName || seller.displayName}
          </p>
        </div>
      </div>
    </div>
  )
}
