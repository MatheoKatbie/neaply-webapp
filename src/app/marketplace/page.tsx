'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WorkflowCard } from '@/components/ui/workflow-card'
import { Filter, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface WorkflowCardData {
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
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('popular')
  const [workflows, setWorkflows] = useState<WorkflowCardData[]>([])
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

  return (
    <>
      <div className="min-h-screen bg-[#0f0f0f] pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex flex-col items-start mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white font-space-grotesk mb-3">
                Workflow Marketplace
              </h1>
              <div className="w-24 h-1 bg-white rounded-full"></div>
            </div>
            <p className="text-lg text-[#999999] max-w-3xl leading-relaxed font-aeonikpro">
              Discover powerful workflows to automate your business processes. From marketing automation to data processing, find the perfect workflow for your needs.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#3a3a3a] p-8 mb-10 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Main Search and Primary Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Label htmlFor="search" className="text-sm font-semibold text-white mb-3 block font-aeonikpro">
                    Search Workflows
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
                    <Input
                      id="search"
                      placeholder="Search workflows, tags, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder-[#555555] focus:border-[#505050] focus:ring-[#3a3a3a]/20 rounded-lg transition-all"
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
                    className="w-full h-12 px-4 py-3 text-base bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a3a3a]/20 focus:border-[#505050] transition-all"
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
                    className="w-full h-12 px-4 py-3 text-base bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a3a3a]/20 focus:border-[#505050] transition-all"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-6 border-t border-[#3a3a3a]">
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
                    className="h-12 text-base bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder-[#555555] focus:border-[#505050] focus:ring-[#3a3a3a]/20 rounded-lg transition-all"
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
                    className="h-12 text-base bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder-[#555555] focus:border-[#505050] focus:ring-[#3a3a3a]/20 rounded-lg transition-all"
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
                    className="flex-1 h-12 border-[#3a3a3a] bg-transparent text-[#999999] hover:bg-[#2a2a2a] hover:text-white hover:border-[#505050] rounded-lg transition-all"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button className="bg-white text-black hover:bg-[#e0e0e0] h-12 px-8 rounded-lg transition-all font-semibold">
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
              {searchQuery && <Badge className="bg-[#2a2a2a] text-[#999999] border border-[#3a3a3a]">Search: "{searchQuery}"</Badge>}
              {selectedCategory !== 'all' && <Badge className="bg-[#2a2a2a] text-[#999999] border border-[#3a3a3a]">Category: {selectedCategory}</Badge>}
            </div>
          </div>

          {/* Workflow Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl h-96 bg-[#2a2a2a] animate-pulse border border-[#3a3a3a]"></div>
              ))}
            </div>
          ) : sortedWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    // Update workflow favorite status in the list
                    setWorkflows((prev) =>
                      prev.map((wf) => (wf.id === workflow.id ? { ...wf, isFavorite: fav } : wf))
                    )
                  }}
                  heroImage={workflow.heroImage}
                  categories={workflow.categories}
                  tags={workflow.tags}
                  seller={workflow.seller}
                  sellerAvatarUrl={workflow.sellerAvatarUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#3a3a3a]">
                <Search className="w-10 h-10 text-[#666666]" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3 font-aeonikpro">No workflows found</h3>
              <p className="text-[#999999] max-w-md mx-auto text-lg">
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
                className="border-[#3a3a3a] bg-transparent text-white hover:bg-[#2a2a2a] hover:border-[#505050] h-12 px-12 rounded-lg transition-all font-semibold"
              >
                {loadingMore ? 'Loading...' : 'Load More Workflows'}
              </Button>
              <p className="text-sm text-[#999999] mt-4">
                Showing {sortedWorkflows.length} of {pagination.totalCount} workflows
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
