'use client'

import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WorkflowCardProps {
  id: string
  title: string
  description: string
  price: number
  currency: string
  platform?: string
  rating: number
  ratingCount?: number
  salesCount: number
  categories?: string[]
  tags?: string[]
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
  currency,
  platform,
  rating,
  salesCount,
  isFake = false,
}: WorkflowCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (isFake) {
      e.preventDefault()
      alert('This is a demo workflow. Real workflows will be available soon!')
    } else {
      router.push(`/workflow/${id}`)
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
      className="group cursor-pointer border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#404040] transition-all duration-300 hover:scale-[1.02] flex flex-col h-full bg-[#0a0a0a] hover:bg-[#111111]"
    >
      {/* Hero Section with Platform Logo */}
      <div className="relative h-48 p-3">
        <div className="relative w-full h-full rounded-lg bg-[#1a1a1a] dots-pattern p-4 flex flex-col justify-between overflow-hidden group border border-[#2a2a2a]">
          {/* Platform logo - centered and larger */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {platformLogo && (
              <div className="relative w-16 h-16">
                <img
                  src={platformLogo.color}
                  alt={platform}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Sales count badge - top right */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-aeonikpro bg-white text-black">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="font-medium">{salesCount || 0} sales</span>
          </div>

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-lg z-5" />
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-aeonikpro text-sm font-semibold line-clamp-2 mb-1 text-white group-hover:text-white transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs line-clamp-2 flex-1 font-aeonikpro text-[#a0a0a0]">
          {description}
        </p>

        {/* Divider */}
        <div className="border-t border-[#2a2a2a] my-3" />

        {/* Footer with Price and Rating */}
        <div className="flex items-end justify-between">
          {/* Price section */}
          <div className="flex flex-col">
            <span className="text-xs font-aeonikpro uppercase tracking-wide text-[#808080]">
              Price
            </span>
            <span className="text-base font-aeonikpro font-bold text-white">
              {price === 0 ? 'Free' : formatPrice(price)}
            </span>
          </div>

          {/* Rating section */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-aeonikpro uppercase tracking-wide text-[#808080]">
              Rating
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-base font-aeonikpro font-semibold text-white">
                {rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
