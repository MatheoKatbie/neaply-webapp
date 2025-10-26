'use client'

import { AnimatedHeart } from '@/components/ui/animated-heart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { ContactSellerButton } from '@/components/ui/contact-seller-button'
import { ReportDialog } from '@/components/ui/report-dialog'
import { ArrowLeft, Calendar, Download, Globe, Mail, Package, Star } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StoreWorkflow {
  id: string
  title: string
  slug: string
  shortDesc: string
  heroImage?: string
  price: number
  currency: string
  platform?: string
  rating: number
  ratingCount: number
  salesCount: number
  categories: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  version: {
    semver: string
    n8nMinVersion?: string
    n8nMaxVersion?: string
  } | null
}

interface StoreData {
  id: string
  storeName: string
  slug: string
  bio?: string
  websiteUrl?: string
  supportEmail?: string
  phoneNumber?: string
  countryCode?: string
  user: {
    id: string
    displayName: string
    avatarUrl?: string
    createdAt: string
  }
  stats: {
    totalWorkflows: number
    totalSales: number
    avgRating: number
    totalReviews: number
    memberSince: string
  }
  workflows: StoreWorkflow[]
}

function WorkflowCard({
  id,
  title,
  shortDesc,
  price,
  currency,
  platform,
  rating,
  ratingCount,
  salesCount,
  heroImage,
  categories,
  tags,
  storeName,
}: StoreWorkflow & { storeName: string }) {
  const router = useRouter()
  const [favorite, setFavorite] = useState(false)

  const handleCardClick = () => {
    router.push(`/workflow/${id}`)
  }

  const handleFavoriteClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation()

    try {
      if (favorite) {
        // Remove from favorites
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workflowId: id }),
        })

        if (response.ok) {
          setFavorite(false)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workflowId: id }),
        })

        if (response.ok) {
          setFavorite(true)
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  return (
    <div
      className="border border-[#9DA2B3]/15 rounded-xl overflow-hidden hover:border-[#9DA2B3]/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex flex-col h-[420px]"
      style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
      onClick={handleCardClick}
    >
      {/* Hero image section */}
      <div className="h-48 relative overflow-hidden">
        {(() => {
          // Get platform logo path based on platform name
          const getPlatformLogo = (platformName?: string) => {
            if (!platformName) return null
            const normalizedName = platformName.toLowerCase().replace(/\s+/g, '-')
            return {
              gray: `/images/company-logo/${normalizedName}.png`,
              color: `/images/company-logo/${normalizedName}.png`,
            }
          }

          // Check if we have a hero image
          if (heroImage) {
            return (
              <div className="relative h-full">
                <img src={heroImage} alt={title} className="w-full h-full object-cover" />

                {/* Sales count badge */}
                <div
                  className="absolute top-2 right-2 z-20 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-aeonikpro"
                  style={{ backgroundColor: '#FFF', color: '#40424D' }}
                >
                  <Download className="w-3 h-3" />
                  <span className="font-medium">{salesCount || 0} sales</span>
                </div>

                {/* Dark gradient overlay from bottom to top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-lg z-5" />
              </div>
            )
          }

          // Platform-based colored background with logo
          const platformColors: Record<string, string> = {
            n8n: '#EA4B71',
            make: '#6E42D3',
            zapier: '#FF4F00',
            activepieces: '#7C3AED',
            pipedream: '#0055FF',
          }
          const bgColor = platform ? platformColors[platform.toLowerCase()] || '#7899A8' : '#7899A8'
          const platformLogo = platform ? getPlatformLogo(platform) : null

          return (
            <div className="h-full p-3 relative" style={{ backgroundColor: 'rgba(30, 30, 36, 0.8)' }}>
              <div
                className="h-full rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: bgColor }}
              >
                {/* Platform logo - Gray on default, color on hover */}
                {platformLogo && (
                  <div className="relative w-16 h-16">
                    <img
                      src={platformLogo.gray}
                      alt={platform}
                      className="w-full h-full object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                    />
                    <img
                      src={platformLogo.color}
                      alt={platform}
                      className="w-full h-full object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                )}

                {/* Sales count badge */}
                <div
                  className="absolute top-2 right-2 z-20 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-aeonikpro"
                  style={{ backgroundColor: '#FFF', color: '#40424D' }}
                >
                  <Download className="w-3 h-3" />
                  <span className="font-medium">{salesCount || 0} sales</span>
                </div>

                {/* Dark gradient overlay from bottom to top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-lg z-5" />
              </div>
            </div>
          )
        })()}
      </div>

      {/* Content section */}
      <div className="px-4 py-1 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-aeonikpro text-lg line-clamp-2 mb-2" style={{ color: '#EDEFF7' }}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm line-clamp-2 flex-1 font-aeonikpro" style={{ color: '#9DA2B3' }}>
          {shortDesc}
        </p>

        {/* Footer with price and rating */}
        <div className="mt-4 pt-4 border-t border-[#9DA2B3]/25">
          <div className="flex items-start justify-between">
            {/* Price section */}
            <div className="flex flex-col">
              <span className="text-xs font-aeonikpro uppercase tracking-wide" style={{ color: '#9DA2B3' }}>
                PRICE
              </span>
              <span className="text-lg font-aeonikpro font-bold" style={{ color: '#EDEFF7' }}>
                {price === 0
                  ? 'Free'
                  : new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency,
                    }).format(price / 100)}
              </span>
            </div>

            {/* Rating section */}
            <div className="flex flex-col items-end">
              <span className="text-xs font-aeonikpro uppercase tracking-wide" style={{ color: '#9DA2B3' }}>
                RATING
              </span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#FF7700]" fill="#FF7700" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-lg font-aeonikpro" style={{ color: '#EDEFF7' }}>
                  {rating?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StorePage() {
  const params = useParams()
  const router = useRouter()
  const storeSlug = params.slug as string

  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/store/${storeSlug}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Store not found')
          } else {
            setError('Failed to load store')
          }
          return
        }

        const data = await response.json()
        setStore(data.data)
      } catch (err) {
        console.error('Error fetching store:', err)
        setError('Failed to load store')
      } finally {
        setLoading(false)
      }
    }

    if (storeSlug) {
      fetchStore()
    }
  }, [storeSlug])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  const generateStoreHero = (storeName: string, storeId: string) => {
    // Generate a unique gradient based on store name/id
    const hash = storeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue1 = (hash * 137.5) % 360
    const hue2 = (hue1 + 60) % 360
    const hue3 = (hue1 + 120) % 360

    return (
      <div
        className="relative h-64 w-full flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
                      hsl(${hue1}, 70%, 65%), 
                      hsl(${hue2}, 60%, 70%), 
                      hsl(${hue3}, 65%, 75%))`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-background rounded-full opacity-30"></div>
          <div className="absolute top-20 right-16 w-12 h-12 bg-background rounded-full opacity-40"></div>
          <div className="absolute bottom-16 left-20 w-16 h-16 bg-background rounded-full opacity-25"></div>
          <div className="absolute bottom-10 right-10 w-8 h-8 bg-background rounded-full opacity-50"></div>
        </div>

        {/* Store icon */}
        <div className="relative z-10 bg-background/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="w-16 h-16 bg-background/30 rounded-xl flex items-center justify-center">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), 
                          radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
        {/* Decorative ellipses */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              left: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              right: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-12">
          <div className="animate-pulse">
            <div className="h-64 rounded-xl mb-8" style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 rounded-xl" style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
        {/* Decorative ellipses */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              left: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              right: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-12">
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.5)' }}
            >
              <Package className="w-8 h-8" style={{ color: '#9DA2B3' }} />
            </div>
            <h3 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
              {error || 'Store not found'}
            </h3>
            <p className="font-aeonikpro max-w-md mx-auto mb-6" style={{ color: '#9DA2B3' }}>
              The store you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => router.push('/')}
              className="font-aeonikpro bg-white text-black hover:bg-[#40424D]/30 py-3 px-6 text-lg rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
      {/* Decorative ellipses */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            left: '-471px',
            top: '200px',
            width: '639px',
            height: '639px',
            backgroundColor: '#7899A8',
            opacity: 0.35,
            filter: 'blur(350px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            right: '-471px',
            bottom: '400px',
            width: '639px',
            height: '639px',
            backgroundColor: '#7899A8',
            opacity: 0.35,
            filter: 'blur(350px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-12">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="font-aeonikpro flex items-center gap-2 text-[#D3D6E0] hover:text-white transition-colors duration-300 group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Marketplace</span>
          </button>
        </div>

        {/* Store Header */}
        <div
          className="mb-8 rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
          style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
        >
          {/* Hero Section */}
          {generateStoreHero(store.storeName, store.id)}

          {/* Store Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Store Avatar */}
              <div className="flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center border-4 shadow-lg -mt-16 relative z-10"
                  style={{ borderColor: '#08080A', backgroundColor: 'rgba(120, 153, 168, 0.3)' }}
                >
                  {store.user.avatarUrl ? (
                    <img
                      src={store.user.avatarUrl}
                      alt={store.storeName}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-blue-400" />
                  )}
                </div>
              </div>

              {/* Store Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="font-aeonikpro text-3xl font-bold mb-2" style={{ color: '#EDEFF7' }}>
                      {store.storeName}
                    </h1>
                    <p className="font-aeonikpro text-lg mb-2" style={{ color: '#9DA2B3' }}>
                      by {store.user.displayName}
                    </p>
                    <div
                      className="flex flex-wrap items-center gap-4 font-aeonikpro text-sm"
                      style={{ color: '#9DA2B3' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {formatDate(store.stats.memberSince)}</span>
                      </div>
                      {store.websiteUrl && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-4 h-4" />
                          <a
                            href={store.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {store.supportEmail && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${store.supportEmail}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Contact
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div
                      className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
                      style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
                    >
                      <div className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                        {store.stats.totalWorkflows}
                      </div>
                      <div className="font-aeonikpro text-sm mt-1" style={{ color: '#9DA2B3' }}>
                        Workflows
                      </div>
                    </div>
                    <div
                      className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
                      style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
                    >
                      <div className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                        {store.stats.totalSales}
                      </div>
                      <div className="font-aeonikpro text-sm mt-1" style={{ color: '#9DA2B3' }}>
                        Sales
                      </div>
                    </div>
                    <div
                      className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
                      style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
                    >
                      <div className="flex items-center gap-1 mb-1 justify-center">
                        <Star className="w-4 h-4 text-[#FF7700]" fill="#FF7700" />
                        <span className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                          {store.stats.avgRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                        {store.stats.totalReviews} reviews
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Bio */}
                {store.bio && (
                  <div className="mt-6">
                    <p className="font-aeonikpro leading-relaxed" style={{ color: '#D3D6E0' }}>
                      {store.bio}
                    </p>
                  </div>
                )}

                {/* Contact Seller Button */}
                <div className="mt-6 pt-4 border-t border-[#9DA2B3]/25">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <ContactSellerButton
                      seller={{
                        displayName: store.user.displayName,
                        storeName: store.storeName,
                        email: store.supportEmail,
                        phoneNumber: store.phoneNumber,
                        countryCode: store.countryCode,
                        avatarUrl: store.user.avatarUrl,
                      }}
                      size='sm'
                      className="w-full sm:w-auto"
                    />
                    <ReportDialog className='w-full sm:w-auto' entityType="store" entityId={store.user.id} entityName={store.storeName} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows Section */}
        <div className="mb-6">
          <h2 className="font-aeonikpro text-2xl font-bold mb-2" style={{ color: '#EDEFF7' }}>
            Workflows
          </h2>
          <p className="font-aeonikpro" style={{ color: '#9DA2B3' }}>
            Browse all workflows from {store.storeName}
          </p>
        </div>

        {store.workflows.length === 0 ? (
          <div
            className="p-12 text-center rounded-xl border border-[#9DA2B3]/25"
            style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.5)' }}
            >
              <Package className="w-8 h-8" style={{ color: '#9DA2B3' }} />
            </div>
            <h3 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
              No workflows yet
            </h3>
            <p className="font-aeonikpro" style={{ color: '#9DA2B3' }}>
              This store hasn't published any workflows yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {store.workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} {...workflow} storeName={store.storeName} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
