'use client'

import { AnimatedHeart } from '@/components/ui/animated-heart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Heart, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface FavoriteWorkflow {
  id: string
  title: string
  description: string
  price: number
  currency: string
  seller: {
    id: string
    name: string
    slug: string
  }
  rating: number
  ratingCount: number
  salesCount: number
  heroImage?: string
  categories: string[]
  tags: string[]
  isFavorite: boolean
  favoritedAt: string
}

interface FavoritesResponse {
  success: boolean
  favorites: FavoriteWorkflow[]
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Theme per request - now using CSS custom properties
  const pageBg = 'hsl(var(--background))'
  const topBorder = 'hsl(var(--accent))'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchFavorites()
    }
  }, [user, authLoading, router])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/favorites')
      const data: FavoritesResponse = await response.json()

      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch favorites')
      }

      setFavorites(data.favorites)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError(error instanceof Error ? error.message : 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (workflowId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflowId }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove from favorites')
      }

      // Remove from local state
      setFavorites((prev) => prev.filter((fav) => fav.id !== workflowId))
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
        <div className="border-t border-accent" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-card rounded-lg mb-3 animate-pulse" />
            <div className="h-4 bg-card rounded-lg w-96 animate-pulse" />
          </div>

          {/* Favorites Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-44 md:h-56 bg-card rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
        <div className="border-t border-accent" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Favorites</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchFavorites} className="bg-secondary hover:bg-white/10 text-white rounded-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
      <div className="border-t border-accent" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-white font-space-grotesk text-3xl">My Favorites</h1>
          </div>
          <p className="text-lg text-gray-400">
            Your collection of saved workflows ({favorites.length} workflow{favorites.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Favorites Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Start exploring workflows in the marketplace and click the heart icon to save your favorites here.
            </p>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-secondary hover:bg-white/10 text-white rounded-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((workflow) => (
              <div key={workflow.id} className="space-y-2 cursor-pointer">
                <div className="group relative rounded-xl overflow-hidden h-44 md:h-56 bg-card border border-border block">
                  {/* Background image */}
                  {workflow.heroImage ? (
                    <img
                      src={workflow.heroImage}
                      alt={workflow.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <AutoThumbnail
                        workflow={{
                          id: workflow.id,
                          title: workflow.title,
                          shortDesc: workflow.description,
                          longDescMd: '',
                          categories: workflow.categories.map((cat) => ({ category: { id: '', name: cat, slug: '' } })),
                          tags: workflow.tags.map((tag) => ({ tag: { id: '', name: tag, slug: '' } })),
                          platform: undefined,
                        }}
                        size="lg"
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}

                  {/* Favorite button - top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <AnimatedHeart
                      isFavorite={true}
                      onToggle={() => removeFromFavorites(workflow.id)}
                      className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
                      size="sm"
                    />
                  </div>

                  {/* Rating - top left */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                      <svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-xs font-medium text-white">({workflow.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                  </div>

                  {/* Hover darken overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                  {/* Title overlay */}
                  <div className="relative z-10 p-4 text-white h-full flex flex-col justify-end transition-transform duration-300 group-hover:-translate-y-12">
                    <div className="font-space-grotesk text-base md:text-lg line-clamp-1">{workflow.title}</div>
                    <div className="text-sm text-white/80 line-clamp-2 mt-1">{workflow.description}</div>
                  </div>

                  {/* Hover CTA slides from bottom */}
                  <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center transition-all duration-300 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
                    <span
                      className="px-4 py-2 rounded-full bg-white text-background font-medium cursor-pointer"
                      onClick={() => router.push(`/workflow/${workflow.id}`)}
                    >
                      See Details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
