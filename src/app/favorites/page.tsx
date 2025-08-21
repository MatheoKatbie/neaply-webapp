'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Star, ShoppingCart, Zap, Search } from 'lucide-react'
import { AnimatedHeart } from '@/components/ui/animated-heart'

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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  const handleCardClick = (workflowId: string) => {
    router.push(`/workflow/${workflowId}`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Favorites</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchFavorites}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-lg text-gray-600">
            Your collection of saved workflows ({favorites.length} workflow{favorites.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Start exploring workflows in the marketplace and click the heart icon to save your favorites here.
            </p>
            <Button onClick={() => router.push('/marketplace')}>
              <Search className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 group relative overflow-hidden py-0 pb-6"
                onClick={() => handleCardClick(workflow.id)}
              >
                {/* Favorite button */}
                <div className="absolute top-3 right-3 z-10">
                  <AnimatedHeart
                    isFavorite={true}
                    onToggle={() => removeFromFavorites(workflow.id)}
                    className="bg-white/80 hover:bg-white/90"
                    size="md"
                  />
                </div>

                {/* Hero image */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                  {workflow.heroImage ? (
                    <img
                      src={workflow.heroImage}
                      alt={workflow.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, 
                                        hsl(${(parseInt(workflow.id) * 137.5) % 360}, 60%, 70%), 
                                        hsl(${(parseInt(workflow.id) * 137.5 + 60) % 360}, 60%, 80%))`,
                      }}
                    >
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {workflow.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price and Rating */}
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(workflow.price, workflow.currency)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{workflow.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({workflow.ratingCount})</span>
                    </div>
                  </div>

                  {/* Seller and Sales */}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>by</span>
                      <span className="font-medium hover:text-blue-600">{workflow.seller.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{workflow.salesCount} sales</span>
                    </div>
                  </div>

                  {/* Categories and Tags */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {workflow.categories.slice(0, 2).map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {workflow.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{workflow.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-gray-500">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Favorited date */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Added {new Date(workflow.favoritedAt).toLocaleDateString()}
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-md">View Workflow</button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
