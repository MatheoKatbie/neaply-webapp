'use client'

import Navbar from '@/components/Navbar'
import { AnimatedHeart } from '@/components/ui/animated-heart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactSellerButton } from '@/components/ui/contact-seller-button'
import { PlatformBadge } from '@/components/ui/platform-badge'
import { ReportDialog } from '@/components/ui/report-dialog'
import { Separator } from '@/components/ui/separator'
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
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group relative overflow-hidden py-0 pb-6"
      onClick={handleCardClick}
    >
      {/* Favorite button */}
      <div className="absolute top-3 right-3 z-10">
        <AnimatedHeart
          isFavorite={favorite}
          onToggle={(e) => handleFavoriteClick(e)}
          className="bg-background/80 hover:bg-background/90"
          size="md"
        />
      </div>

      {/* Hero image */}
      <div className="h-48 relative overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <AutoThumbnail
            workflow={{
              id,
              title,
              shortDesc,
              longDescMd: '',
              categories: categories.map((cat) => ({ category: { id: '', name: cat, slug: '' } })),
              tags: tags.map((tag) => ({ tag: { id: '', name: tag, slug: '' } })),
              platform,
            }}
            size="md"
            className="w-full h-full"
          />
        )}

        {/* Rating - top left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-white">({rating.toFixed(1)})</span>
          </div>
        </div>

        {/* Price - top right */}
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
            <span className="text-xs font-bold text-green-400">{formatPrice(price, currency)}</span>
          </div>
        </div>

        {/* Platform badge - moved to bottom left */}
        {platform && (
          <div className="absolute bottom-3 left-3 z-10">
            <PlatformBadge platform={platform} size="sm" variant="default" className="shadow-sm" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold group-hover:text-foreground transition-colors">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{shortDesc}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Categories and tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Seller and stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">by {storeName}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              <span>{salesCount} sales</span>
            </div>
          </div>
        </div>
        <Button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-gray-800">
          View Workflow
        </Button>
      </CardContent>
    </Card>
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
      <>
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !store) {
    return (
      <>
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{error || 'Store not found'}</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                The store you're looking for doesn't exist or may have been removed.
              </p>
              <Button onClick={() => router.push('/marketplace')} className="cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/marketplace')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>

          {/* Store Header */}
          <Card className="mb-8 overflow-hidden">
            {/* Hero Section */}
            {generateStoreHero(store.storeName, store.id)}

            {/* Store Info */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Store Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center border-4 border-white shadow-lg -mt-16 relative z-10">
                    {store.user.avatarUrl ? (
                      <img
                        src={store.user.avatarUrl}
                        alt={store.storeName}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Store Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{store.storeName}</h1>
                      <p className="text-lg text-muted-foreground mb-1">by {store.user.displayName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {formatDate(store.stats.memberSince)}</span>
                        </div>
                        {store.websiteUrl && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <a
                              href={store.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {store.supportEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${store.supportEmail}`} className="text-blue-600 hover:underline">
                              Contact
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Store Stats */}
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{store.stats.totalWorkflows}</div>
                        <div className="text-sm text-muted-foreground">Workflows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{store.stats.totalSales}</div>
                        <div className="text-sm text-muted-foreground">Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-2xl font-bold text-foreground">{store.stats.avgRating.toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{store.stats.totalReviews} reviews</div>
                      </div>
                    </div>
                  </div>

                  {/* Store Bio */}
                  {store.bio && (
                    <div className="mt-6">
                      <p className="text-muted-foreground leading-relaxed">{store.bio}</p>
                    </div>
                  )}

                  {/* Contact Seller Button */}
                  <div className="mt-6 pt-4 border-t">
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
                        className="w-full sm:w-auto"
                      />
                      <ReportDialog
                        entityType="store"
                        entityId={store.user.id}
                        entityName={store.storeName}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Workflows Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Workflows</h2>
            <p className="text-muted-foreground">Browse all workflows from {store.storeName}</p>
          </div>

          {store.workflows.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No workflows yet</h3>
              <p className="text-muted-foreground">This store hasn't published any workflows yet. Check back later!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {store.workflows.map((workflow) => (
                <WorkflowCard key={workflow.id} {...workflow} storeName={store.storeName} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
