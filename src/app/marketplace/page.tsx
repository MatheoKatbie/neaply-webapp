'use client'

import { AnimatedHeart } from '@/components/ui/animated-heart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlatformBadge } from '@/components/ui/platform-badge'
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
  sellerAvatarUrl?: string | null
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
  sellerAvatarUrl,
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
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group relative overflow-hidden py-0 pb-6 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#404040] rounded-xl flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Favorite button */}
      <div className="absolute top-3 right-3 z-10">
        <AnimatedHeart
          isFavorite={favorite}
          onToggle={(e) => handleFavoriteClick(e)}
          className="bg-black/90 hover:bg-black"
          size="md"
        />
      </div>

      {/* Hero image */}
      <div className="h-48 relative overflow-hidden rounded-t-xl">
        {heroImage ? (
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
            authorAvatarUrl={sellerAvatarUrl || undefined}
          />
        )}

        {/* Rating - top left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-black/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-white">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price - top right of image */}
        <div className="absolute top-3 right-12 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
            <span className="text-xs font-bold text-black">{formatPrice(price, currency)}</span>
          </div>
        </div>

        {/* Platform badge - bottom left */}
        {platform && (
          <div className="absolute bottom-3 left-3 z-10">
            <PlatformBadge platform={platform} size="sm" variant="default" className="shadow-sm" />
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors line-clamp-2 mb-1 font-aeonikpro">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#a0a0a0] line-clamp-2 flex-1 font-aeonikpro">{description}</p>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 mb-2">
            {categories.slice(0, 2).map((category) => (
              <Badge key={category} className="text-xs bg-[#2a2a2a] text-[#a0a0a0] border border-[#404040] rounded-md">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge className="text-xs bg-[#2a2a2a] text-[#a0a0a0] border border-[#404040]">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="border-t border-[#2a2a2a] my-2" />

        {/* Seller info */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-[#a0a0a0] truncate">by {seller}</span>
          <div className="flex items-center gap-1 text-[#808080]">
            <Download className="w-3 h-3" />
            <span className="font-medium">{salesCount} sales</span>
          </div>
        </div>

        <Button className="w-full bg-white text-black py-2 rounded-lg hover:bg-[#f0f0f0] transition-all font-semibold text-sm">
          View Workflow
        </Button>
      </div>
    </div>
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
      <div className="min-h-screen bg-black pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex flex-col items-start mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white font-space-grotesk mb-3">
                Workflow Marketplace
              </h1>
              <div className="w-24 h-1 bg-white rounded-full"></div>
            </div>
            <p className="text-lg text-[#a0a0a0] max-w-3xl leading-relaxed font-aeonikpro">
              Discover powerful workflows to automate your business processes. From marketing automation to data processing, find the perfect workflow for your needs.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#2a2a2a] p-8 mb-10 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Main Search and Primary Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Label htmlFor="search" className="text-sm font-semibold text-white mb-3 block font-aeonikpro">
                    Search Workflows
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#808080] w-5 h-5" />
                    <Input
                      id="search"
                      placeholder="Search workflows, tags, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-[#606060] focus:border-white focus:ring-white/20 rounded-lg transition-all"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-white mb-3 block font-aeonikpro">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 py-3 text-base bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition-all"
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
                  <Label htmlFor="sort" className="text-sm font-semibold text-white mb-3 block font-aeonikpro">
                    Sort By
                  </Label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 py-3 text-base bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition-all"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-6 border-t border-[#2a2a2a]">
                <div>
                  <Label htmlFor="min-price" className="text-sm font-semibold text-white mb-3 block font-aeonikpro">
                    Min Price (€)
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="h-12 text-base bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-[#606060] focus:border-white focus:ring-white/20 rounded-lg transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price" className="text-sm font-semibold text-white mb-3 block font-aeonikpro">
                    Max Price (€)
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="h-12 text-base bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-[#606060] focus:border-white focus:ring-white/20 rounded-lg transition-all"
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
                    className="flex-1 h-12 border-[#2a2a2a] bg-transparent text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white hover:border-[#404040] rounded-lg transition-all"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button className="bg-white text-black hover:bg-[#f0f0f0] h-12 px-8 rounded-lg transition-all font-semibold">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-semibold text-white font-aeonikpro">{pagination.totalCount} workflows</h2>
              {searchQuery && <Badge className="bg-[#2a2a2a] text-[#a0a0a0] border border-[#404040]">Search: "{searchQuery}"</Badge>}
              {selectedCategory !== 'all' && <Badge className="bg-[#2a2a2a] text-[#a0a0a0] border border-[#404040]">Category: {selectedCategory}</Badge>}
            </div>
          </div>

          {/* Workflow Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl h-96 bg-[#1a1a1a] animate-pulse border border-[#2a2a2a]"></div>
              ))}
            </div>
          ) : sortedWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.id} {...workflow} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2a2a2a]">
                <Search className="w-10 h-10 text-[#a0a0a0]" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3 font-aeonikpro">No workflows found</h3>
              <p className="text-[#a0a0a0] max-w-md mx-auto text-lg">
                Try adjusting your search criteria or explore different categories to find the perfect workflow.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {sortedWorkflows.length > 0 && !loading && pagination.hasNext && (
            <div className="text-center mt-16">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={loadMoreWorkflows} 
                disabled={loadingMore}
                className="border-[#2a2a2a] bg-transparent text-white hover:bg-[#2a2a2a] hover:border-[#404040] h-12 px-12 rounded-lg transition-all font-semibold"
              >
                {loadingMore ? 'Loading...' : 'Load More Workflows'}
              </Button>
              <p className="text-sm text-[#a0a0a0] mt-4">
                Showing {sortedWorkflows.length} of {pagination.totalCount} workflows
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
