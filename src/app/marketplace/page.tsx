'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Search, Filter, Download, Eye, Zap, Clock, DollarSign } from 'lucide-react'
import { AnimatedHeart } from '@/components/ui/animated-heart'
import { PlatformBadge } from '@/components/ui/platform-badge'

interface WorkflowCardProps {
  id: string
  title: string
  description: string
  price: number
  currency: string
  platform?: string
  seller: string
  rating: number
  ratingCount: number
  salesCount: number
  heroImage?: string
  categories: string[]
  tags: string[]
  isFavorite?: boolean
  isNew?: boolean
  isTrending?: boolean
  slug?: string
  createdAt?: string
}

interface CategoryData {
  id: string
  name: string
  slug: string
  count: number
}

interface MarketplaceResponse {
  data: WorkflowCardProps[]
  categories: CategoryData[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

function WorkflowCard({
  id,
  title,
  description,
  price,
  currency,
  platform,
  seller,
  rating,
  ratingCount,
  salesCount,
  heroImage,
  categories,
  tags,
  isFavorite = false,
  isNew = false,
  isTrending = false,
}: WorkflowCardProps) {
  const router = useRouter()
  const [favorite, setFavorite] = useState(isFavorite)

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
      // Revert the state if there was an error
      // setFavorite(!favorite) - don't revert since we'll show the original state
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
          className="bg-white/80 hover:bg-white/90"
          size="md"
        />
      </div>

      {/* Hero image */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Temporary placeholder with dynamic colors based on workflow ID
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, 
                                hsl(${(parseInt(id) * 137.5) % 360}, 60%, 70%), 
                                hsl(${(parseInt(id) * 137.5 + 60) % 360}, 60%, 80%))`,
            }}
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {/* Platform badge */}
        {platform && (
          <div className="absolute top-3 left-3 z-10">
            <PlatformBadge platform={platform} size="sm" variant="default" className="shadow-sm" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold group-hover:text-gray-900 transition-colors">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-2">{description}</CardDescription>
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
              <Badge key={tag} variant="outline" className="text-xs text-gray-500">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Seller and stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">by {seller}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({ratingCount})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Download className="w-3 h-3" />
              <span>{salesCount} sales</span>
            </div>
            <div className="text-lg font-bold text-green-600">{formatPrice(price, currency)}</div>
          </div>
        </div>
        <Button className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800">View Workflow</Button>
      </CardContent>
    </Card>
  )
}

export default function MarketplacePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('popular')
  const [workflows, setWorkflows] = useState<WorkflowCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Fetch workflows from API
  const fetchWorkflows = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
        sortBy: sortBy,
      })

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (priceRange.min) {
        params.append('minPrice', priceRange.min)
      }

      if (priceRange.max) {
        params.append('maxPrice', priceRange.max)
      }

      const response = await fetch(`/api/marketplace/workflows?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }

      const data: MarketplaceResponse = await response.json()

      setWorkflows(data.data || [])
      setCategories(data.categories || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      setWorkflows([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch workflows on component mount and when filters change
  useEffect(() => {
    fetchWorkflows()
  }, [searchQuery, selectedCategory, priceRange.min, priceRange.max, sortBy])

  // Workflows are already filtered and sorted by the API
  const sortedWorkflows = workflows

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Workflow Marketplace</h1>
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push('/become-seller')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Sell Workflow
              </Button>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover powerful n8n workflows to automate your business processes. From marketing automation to data
              processing, find the perfect workflow for your needs.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl border shadow-sm p-8 mb-8">
            <div className="space-y-6">
              {/* Main Search and Primary Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Workflows
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="search"
                      placeholder="Search workflows, tags, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 py-3 text-base border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <Label htmlFor="sort" className="text-sm font-medium text-gray-700 mb-2 block">
                    Sort By
                  </Label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 py-3 text-base border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Price Range and Clear Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-4 border-t border-gray-100">
                <div>
                  <Label htmlFor="min-price" className="text-sm font-medium text-gray-700 mb-2 block">
                    Min Price (€)
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="h-12 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price" className="text-sm font-medium text-gray-700 mb-2 block">
                    Max Price (€)
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="h-12 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
                <div className="lg:col-span-3 flex items-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setPriceRange({ min: '', max: '' })
                      setSortBy('popular')
                    }}
                    className="flex-1 h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button className="bg-black hover:bg-gray-800 text-white h-12 px-8">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">{pagination.totalCount} workflows found</h2>
              {searchQuery && <Badge variant="outline">Search: "{searchQuery}"</Badge>}
              {selectedCategory !== 'all' && <Badge variant="outline">Category: {selectedCategory}</Badge>}
            </div>
          </div>

          {/* Workflow Grid */}
          {loading ? (
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
          ) : sortedWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.id} {...workflow} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search criteria or explore different categories to find the perfect workflow.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {sortedWorkflows.length > 0 && !loading && pagination.hasNext && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  // TODO: Implement pagination
                  console.log('Load more clicked - implement pagination')
                }}
              >
                Load More Workflows
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Showing {sortedWorkflows.length} of {pagination.totalCount} workflows
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
