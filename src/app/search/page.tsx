'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type SearchResult = {
  id: string
  type: 'workflow' | 'pack'
  title: string
  description: string
  price: number
  currency: string
  seller: string
  rating: number
  ratingCount: number
  heroImage?: string | null
  categories: string[]
  tags: string[]
  isFavorite: boolean
  slug: string
  createdAt: string
  // Workflow specific
  platform?: string
  salesCount?: number
  isNew?: boolean
  isTrending?: boolean
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const platformParam = searchParams.get('platform') || ''

  const [allResults, setAllResults] = useState<SearchResult[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Filtres côté front
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState<string>(platformParam || 'all')
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('all')
  const [recentlyAddedFilter, setRecentlyAddedFilter] = useState<string>('all')

  const loadSearchResults = async (page: number = 1, append: boolean = false) => {
    const loadingState = page === 1 ? setIsLoading : setIsLoadingMore
    loadingState(true)

    try {
      const qs = new URLSearchParams()
      
      // Add search query if present
      if (query.trim()) {
        qs.set('q', query)
      } else if (workflowTypeFilter === 'all') {
        // If no query and no platform filter, don't load
        loadingState(false)
        return
      }
      
      qs.set('page', page.toString())
      qs.set('limit', '50') // Load more at once for client-side filtering
      qs.set('type', 'workflows') // Only workflows, no packs
      
      // Add platform filter if selected
      if (workflowTypeFilter !== 'all') {
        qs.set('platform', workflowTypeFilter)
      }

      const response = await fetch(`/api/search?${qs.toString()}`)
      const data = await response.json()

      const newResults = (data.data || []).filter((item: SearchResult) => item.type === 'workflow')

      if (append) {
        setAllResults((prev) => [...prev, ...newResults])
      } else {
        setAllResults(newResults)
      }

      setHasMore(data.pagination?.hasNext || false)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      loadingState(false)
    }
  }

  useEffect(() => {
    if (query.trim() || workflowTypeFilter !== 'all') {
      setCurrentPage(1)
      loadSearchResults(1, false)
    }
  }, [query, workflowTypeFilter])

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return
    loadSearchResults(currentPage + 1, true)
  }

  // Filtrage côté front
  const filteredResults = useMemo(() => {
    let filtered = [...allResults]

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.categories.includes(categoryFilter))
    }

    // Filter by workflow type (platform)
    if (workflowTypeFilter !== 'all') {
      filtered = filtered.filter((item) => item.platform === workflowTypeFilter)
    }

    // Filter by price range
    if (priceRangeFilter !== 'all') {
      filtered = filtered.filter((item) => {
        const price = item.price
        switch (priceRangeFilter) {
          case 'free':
            return price === 0
          case 'under-50':
            return price > 0 && price < 5000
          case '50-100':
            return price >= 5000 && price <= 10000
          case 'over-100':
            return price > 10000
          default:
            return true
        }
      })
    }

    // Filter by recently added
    if (recentlyAddedFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter((item) => {
        const createdDate = new Date(item.createdAt)
        const diffTime = Math.abs(now.getTime() - createdDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (recentlyAddedFilter) {
          case 'today':
            return diffDays <= 1
          case 'week':
            return diffDays <= 7
          case 'month':
            return diffDays <= 30
          default:
            return true
        }
      })
    }

    return filtered
  }, [allResults, categoryFilter, workflowTypeFilter, priceRangeFilter, recentlyAddedFilter])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24" style={{ backgroundColor: '#08080A' }}>
        <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-8">
          {/* Search header skeleton */}
          <div className="mb-8">
            <div className="h-8 rounded-lg mb-3 animate-pulse" style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }} />
            <div className="h-6 rounded-lg w-48 animate-pulse" style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }} />
          </div>

          {/* Results skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="group h-[420px]">
                <div
                  className="border border-[#9DA2B3]/15 rounded-xl overflow-hidden shadow-lg h-full flex flex-col"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
                >
                  <div className="h-48 p-3 animate-pulse" style={{ backgroundColor: 'rgba(30, 30, 36, 0.8)' }}>
                    <div
                      className="h-full rounded-lg animate-pulse"
                      style={{ backgroundColor: 'rgba(157, 162, 179, 0.15)' }}
                    ></div>
                  </div>
                  <div className="px-4 py-1 flex-1 flex flex-col">
                    <div
                      className="h-14 rounded animate-pulse mb-2"
                      style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}
                    ></div>
                    <div
                      className="h-16 rounded animate-pulse mb-2 flex-1"
                      style={{ backgroundColor: 'rgba(157, 162, 179, 0.15)' }}
                    ></div>
                    <div className="mt-4 pt-4 border-t border-[#9DA2B3]/25">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <div
                            className="h-3 w-8 rounded animate-pulse"
                            style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}
                          ></div>
                          <div
                            className="h-6 w-16 rounded animate-pulse"
                            style={{ backgroundColor: 'rgba(237, 239, 247, 0.2)' }}
                          ></div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <div
                            className="h-3 w-10 rounded animate-pulse"
                            style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}
                          ></div>
                          <div
                            className="h-6 w-12 rounded animate-pulse"
                            style={{ backgroundColor: 'rgba(237, 239, 247, 0.2)' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24" style={{ backgroundColor: '#08080A' }}>
      <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6" style={{ color: '#9DA2B3' }} />
            <h1 className="font-aeonikpro text-2xl" style={{ color: '#EDEFF7' }}>
              Search Results
            </h1>
          </div>
          <p className="font-aeonikpro text-lg mb-6" style={{ color: '#D3D6E0' }}>
            {filteredResults.length === 0
              ? `No results found for "${query}"`
              : `${filteredResults.length} workflow${filteredResults.length === 1 ? '' : 's'} found for "${query}"`}
          </p>

          {/* Filters from homepage */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Automation">Automation</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
              </SelectContent>
            </Select>

            {/* Workflow type filter (platform) */}
            <Select value={workflowTypeFilter} onValueChange={setWorkflowTypeFilter}>
              <SelectTrigger className="w-[160px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                <SelectValue placeholder="Workflow type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="n8n">n8n</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="make">Make</SelectItem>
                <SelectItem value="airtable_script">Airtable</SelectItem>
              </SelectContent>
            </Select>

            {/* Price range filter */}
            <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
              <SelectTrigger className="w-[140px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="under-50">Under $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="over-100">Over $100</SelectItem>
              </SelectContent>
            </Select>

            {/* Recently added filter */}
            <Select value={recentlyAddedFilter} onValueChange={setRecentlyAddedFilter}>
              <SelectTrigger className="w-[160px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                <SelectValue placeholder="Recently added" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* No Results */}
        {filteredResults.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: '#9DA2B3' }} />
            <h3 className="font-aeonikpro text-xl mb-2" style={{ color: '#EDEFF7' }}>
              No results found
            </h3>
            <p className="font-aeonikpro max-w-md mx-auto" style={{ color: '#9DA2B3' }}>
              Try adjusting your search terms or filters to discover amazing workflows.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {filteredResults.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {filteredResults.map((item) => {
                // Define platform colors
                const platformColors = {
                  zapier: 'bg-[#FF4A00]',
                  n8n: 'bg-[#EA4B71]',
                  make: 'bg-gradient-to-br from-[#6D00CC] to-[#F901FC]',
                  airtable_script: 'bg-gradient-to-r from-blue-600 to-blue-800',
                }

                const platformLogos = {
                  zapier: {
                    gray: '/images/hero/zapier-grey.png',
                    color: '/images/hero/zapier-color.png',
                  },
                  n8n: {
                    gray: '/images/hero/n8n-grey.png',
                    color: '/images/hero/n8n-color.png',
                  },
                  make: {
                    gray: '/images/hero/make-grey.png',
                    color: '/images/hero/make-color.png',
                  },
                  airtable_script: {
                    gray: '/images/hero/airtable-grey.png',
                    color: '/images/hero/airtable-color.png',
                  },
                }

                const bgColor =
                  item.platform && platformColors[item.platform as keyof typeof platformColors]
                    ? platformColors[item.platform as keyof typeof platformColors]
                    : 'bg-[#1E1E24]'

                const platformLogo = item.platform ? platformLogos[item.platform as keyof typeof platformLogos] : null

                return (
                  <div key={item.id} className="group h-full">
                    <a
                      href={`/workflow/${item.id}`}
                      className="border border-[#9DA2B3]/15 rounded-xl overflow-hidden hover:border-[#9DA2B3]/30 transition-all duration-300 hover:scale-[1.02] h-[420px] flex flex-col"
                      style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
                    >
                      {/* Header with custom thumbnail */}
                      <div className="relative h-48 p-3">
                        <div
                          className={`relative w-full h-full rounded-lg ${bgColor} dots-pattern p-4 flex flex-col justify-between overflow-hidden group`}
                        >
                          {/* Platform logo - centered and larger */}
                          <div className="absolute inset-0 z-10 flex items-center justify-center">
                            {platformLogo && (
                              <div className="relative w-16 h-16">
                                <img
                                  src={platformLogo.color}
                                  alt={item.platform}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>

                          {/* Sales count badge */}
                          {item.salesCount !== undefined && (
                            <div
                              className="absolute top-2 right-2 z-20 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-aeonikpro"
                              style={{ backgroundColor: '#FFF', color: '#40424D' }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                              <span className="font-medium">{item.salesCount || 0} sales</span>
                            </div>
                          )}

                          {/* Dark gradient overlay from bottom to top */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-lg z-5" />
                        </div>
                      </div>

                      {/* Content section */}
                      <div className="px-4 py-1 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="font-aeonikpro text-lg line-clamp-2 mb-2" style={{ color: '#EDEFF7' }}>
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm line-clamp-2 flex-1 font-aeonikpro" style={{ color: '#9DA2B3' }}>
                          {item.description}
                        </p>

                        {/* Footer with price and rating */}
                        <div className="mt-4 pt-4 border-t border-[#9DA2B3]/25">
                          <div className="flex items-start justify-between">
                            {/* Price section */}
                            <div className="flex flex-col">
                              <span
                                className="text-xs font-aeonikpro uppercase tracking-wide"
                                style={{ color: '#9DA2B3' }}
                              >
                                PRICE
                              </span>
                              <span className="text-lg font-aeonikpro font-bold" style={{ color: '#EDEFF7' }}>
                                {item.price === 0 ? 'Free' : formatPrice(item.price, item.currency)}
                              </span>
                            </div>

                            {/* Rating section */}
                            <div className="flex flex-col items-end">
                              <span
                                className="text-xs font-aeonikpro uppercase tracking-wide"
                                style={{ color: '#9DA2B3' }}
                              >
                                RATING
                              </span>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-[#FF7700]" fill="#FF7700" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="text-lg font-aeonikpro" style={{ color: '#EDEFF7' }}>
                                  {item.rating?.toFixed(1) || '0.0'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                )
              })}

              {/* Loading skeleton for more results */}
              {isLoadingMore &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`loading-${i}`} className="group h-[420px]">
                    <div
                      className="border border-[#9DA2B3]/15 rounded-xl overflow-hidden shadow-lg h-full flex flex-col"
                      style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
                    >
                      <div className="h-48 p-3 animate-pulse" style={{ backgroundColor: 'rgba(30, 30, 36, 0.8)' }}>
                        <div
                          className="h-full rounded-lg animate-pulse"
                          style={{ backgroundColor: 'rgba(157, 162, 179, 0.15)' }}
                        ></div>
                      </div>
                      <div className="px-4 py-1 flex-1 flex flex-col">
                        <div
                          className="h-14 rounded animate-pulse mb-2"
                          style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}
                        ></div>
                        <div
                          className="h-16 rounded animate-pulse mb-2 flex-1"
                          style={{ backgroundColor: 'rgba(157, 162, 179, 0.15)' }}
                        ></div>
                        <div className="mt-4 pt-4 border-t border-[#9DA2B3]/25">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                              <div
                                className="h-3 w-8 rounded animate-pulse"
                                style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}
                              ></div>
                              <div
                                className="h-6 w-16 rounded animate-pulse"
                                style={{ backgroundColor: 'rgba(237, 239, 247, 0.2)' }}
                              ></div>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <div
                                className="h-3 w-10 rounded animate-pulse"
                                style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}
                              ></div>
                              <div
                                className="h-6 w-12 rounded animate-pulse"
                                style={{ backgroundColor: 'rgba(237, 239, 247, 0.2)' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="group relative bg-white border border-gray-200 hover:border-gray-300 text-black rounded-full disabled:opacity-50 px-12 py-4 font-aeonikpro text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoadingMore ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Workflows
                        <svg
                          className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </>
                    )}
                  </span>

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
