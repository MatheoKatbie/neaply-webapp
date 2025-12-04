'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorkflowCard } from '@/components/ui/workflow-card'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WorkflowCardData {
  id: string
  title: string
  description: string
  price: number
  currency: string
  platform?: string
  seller: string
  sellerId?: string
  sellerSlug?: string
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
  data: WorkflowCardData[]
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

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('popular')
  const [workflows, setWorkflows] = useState<WorkflowCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
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
        setWorkflows((prev) => [...prev, ...(data.data || [])])
      } else {
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

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange({ min: '', max: '' })
    setSortBy('popular')
  }

  // Sidebar filter content (reused for mobile and desktop)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search" className="text-sm font-medium text-[#EDEFF7] mb-2 block">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA2B3] w-4 h-4" />
          <Input
            id="search"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0D0D0F] border-[#9DA2B3]/20 focus:border-[#9DA2B3]/40"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium text-[#EDEFF7] mb-3 block">
          Categories
        </Label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#EDEFF7]/10 text-[#EDEFF7]'
                : 'text-[#9DA2B3] hover:bg-[#EDEFF7]/5 hover:text-[#EDEFF7]'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                selectedCategory === category.slug
                  ? 'bg-[#EDEFF7]/10 text-[#EDEFF7]'
                  : 'text-[#9DA2B3] hover:bg-[#EDEFF7]/5 hover:text-[#EDEFF7]'
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs opacity-60">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium text-[#EDEFF7] mb-3 block">
          Price Range
        </Label>
        <div className="space-y-3">
          <div>
            <Label htmlFor="min-price" className="text-xs text-[#9DA2B3] mb-1 block">
              Min Price ($)
            </Label>
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="bg-[#0D0D0F] border-[#9DA2B3]/20 focus:border-[#9DA2B3]/40"
            />
          </div>
          <div>
            <Label htmlFor="max-price" className="text-xs text-[#9DA2B3] mb-1 block">
              Max Price ($)
            </Label>
            <Input
              id="max-price"
              type="number"
              placeholder="500"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="bg-[#0D0D0F] border-[#9DA2B3]/20 focus:border-[#9DA2B3]/40"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full"
          size="sm"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#08080A] pt-20 md:pt-24">
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">
            Marketplace
          </h1>
          <p className="text-[#9DA2B3] text-sm md:text-base max-w-2xl">
            Discover powerful workflows to automate your business processes.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-[#EDEFF7]/10">
                  Active
                </Badge>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="mt-4 p-4 rounded-xl bg-[#0D0D0F] border border-[#9DA2B3]/15">
              <FilterContent />
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 p-4 rounded-xl bg-[#0D0D0F] border border-[#9DA2B3]/15">
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[#EDEFF7] font-medium">
                  {pagination.totalCount} workflows
                </span>
                {searchQuery && (
                  <Badge 
                    variant="secondary" 
                    className="bg-[#EDEFF7]/10 text-[#EDEFF7] hover:bg-[#EDEFF7]/15 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  >
                    "{searchQuery}" <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className="bg-[#EDEFF7]/10 text-[#EDEFF7] hover:bg-[#EDEFF7]/15 cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory} <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {(priceRange.min || priceRange.max) && (
                  <Badge 
                    variant="secondary" 
                    className="bg-[#EDEFF7]/10 text-[#EDEFF7] hover:bg-[#EDEFF7]/15 cursor-pointer"
                    onClick={() => setPriceRange({ min: '', max: '' })}
                  >
                    ${priceRange.min || '0'} - ${priceRange.max || '∞'} <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-[#0D0D0F] border-[#9DA2B3]/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workflow Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-xl h-80 bg-[rgba(64,66,77,0.15)] animate-pulse border border-[#9DA2B3]/10" />
                ))}
              </div>
            ) : sortedWorkflows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    id={workflow.id}
                    title={workflow.title}
                    description={workflow.description}
                    price={workflow.price}
                    currency={workflow.currency}
                    platform={workflow.platform}
                    rating={workflow.rating}
                    salesCount={workflow.salesCount}
                    isFavorite={workflow.isFavorite}
                    onFavoriteChange={(fav) => {
                      setWorkflows((prev) =>
                        prev.map((wf) => (wf.id === workflow.id ? { ...wf, isFavorite: fav } : wf))
                      )
                    }}
                    heroImage={workflow.heroImage}
                    categories={workflow.categories}
                    tags={workflow.tags}
                    seller={workflow.seller}
                    sellerId={workflow.sellerId}
                    sellerSlug={workflow.sellerSlug}
                    sellerAvatarUrl={workflow.sellerAvatarUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[rgba(64,66,77,0.25)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#9DA2B3]/15">
                  <Search className="w-8 h-8 text-[#9DA2B3]" />
                </div>
                <h3 className="text-xl font-semibold text-[#EDEFF7] mb-2">No workflows found</h3>
                <p className="text-[#9DA2B3] text-sm max-w-md mx-auto mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Load More Button */}
            {sortedWorkflows.length > 0 && !loading && pagination.hasNext && (
              <div className="text-center mt-10">
                <Button 
                  variant="outline" 
                  onClick={loadMoreWorkflows} 
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
                <p className="text-xs text-[#9DA2B3] mt-3">
                  Showing {sortedWorkflows.length} of {pagination.totalCount}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
