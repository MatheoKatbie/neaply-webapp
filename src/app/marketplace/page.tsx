'use client'

import { AnimatedHeart } from '@/components/ui/animated-heart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlatformBadge } from '@/components/ui/platform-badge'
import { Separator } from '@/components/ui/separator'
import { Download, Filter, Search, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
              shortDesc: description,
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
        <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{description}</CardDescription>
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
            <span className="text-muted-foreground">by {seller}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              <span>{salesCount} sales</span>
            </div>
          </div>
        </div>
        <Button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90">
          View Workflow
        </Button>
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Fetch workflows from API
  const fetchWorkflows = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
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

      if (append) {
        // Append new workflows to existing list
        setWorkflows((prev) => [...prev, ...(data.data || [])])
      } else {
        // Replace workflows (for new searches/filters)
        setWorkflows(data.data || [])
      }

      setCategories(data.categories || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      if (!append) {
        setWorkflows([])
        setCategories([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more workflows function
  const loadMoreWorkflows = async () => {
    if (pagination.hasNext && !loadingMore) {
      await fetchWorkflows(pagination.page + 1, true)
    }
  }

  // Fetch workflows on component mount and when filters change
  useEffect(() => {
    fetchWorkflows(1, false)
  }, [searchQuery, selectedCategory, priceRange.min, priceRange.max, sortBy])

  // Workflows are already filtered and sorted by the API
  const sortedWorkflows = workflows

  return (
    <>
      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Workflow Marketplace</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover powerful n8n workflows to automate your business processes. From marketing automation to data
              processing, find the perfect workflow for your needs.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-8 mb-8">
            <div className="space-y-6">
              {/* Main Search and Primary Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium text-card-foreground mb-2 block">
                    Search Workflows
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="search"
                      placeholder="Search workflows, tags, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base border-border focus:border-gray-400 focus:ring-gray-400"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-card-foreground mb-2 block">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 py-3 text-base border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
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
                  <Label htmlFor="sort" className="text-sm font-medium text-card-foreground mb-2 block">
                    Sort By
                  </Label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 py-3 text-base border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-4 border-t border-border">
                <div>
                  <Label htmlFor="min-price" className="text-sm font-medium text-card-foreground mb-2 block">
                    Min Price (€)
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="h-12 text-base border-border focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price" className="text-sm font-medium text-card-foreground mb-2 block">
                    Max Price (€)
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="h-12 text-base border-border focus:border-gray-400 focus:ring-gray-400"
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
                    className="flex-1 h-12 border-border hover:border-border/80 hover:bg-accent bg-background text-foreground"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
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
              <h2 className="text-xl font-semibold text-foreground">{pagination.totalCount} workflows found</h2>
              {searchQuery && <Badge variant="outline">Search: "{searchQuery}"</Badge>}
              {selectedCategory !== 'all' && <Badge variant="outline">Category: {selectedCategory}</Badge>}
            </div>
          </div>

          {/* Workflow Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
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
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No workflows found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search criteria or explore different categories to find the perfect workflow.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {sortedWorkflows.length > 0 && !loading && pagination.hasNext && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" onClick={loadMoreWorkflows} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More Workflows'}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {sortedWorkflows.length} of {pagination.totalCount} workflows
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
