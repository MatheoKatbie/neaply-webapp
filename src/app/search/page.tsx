"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { Search, Package, Workflow, Filter } from 'lucide-react'

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
    // Pack specific
    workflowCount?: number
    workflows?: Array<{
        id: string
        title: string
        description: string
        heroImage?: string | null
        rating: number
        ratingCount: number
    }>
}

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const typeFilter = searchParams.get('type') || 'all'

    const [results, setResults] = useState<SearchResult[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [stats, setStats] = useState({ workflows: 0, packs: 0 })

    const pageBg = '#202D33'
    const topBorder = '#3E4E55'

    const loadSearchResults = async (page: number = 1, append: boolean = false) => {
        if (!query.trim()) return

        const loadingState = page === 1 ? setIsLoading : setIsLoadingMore
        loadingState(true)

        try {
            const qs = new URLSearchParams()
            qs.set('q', query)
            qs.set('page', page.toString())
            qs.set('limit', '16')
            qs.set('type', typeFilter)

            const response = await fetch(`/api/search?${qs.toString()}`)
            const data = await response.json()

            const newResults = data.data || []
            const total = data.pagination?.totalCount || 0

            if (append) {
                setResults(prev => [...prev, ...newResults])
            } else {
                setResults(newResults)
            }

            setTotalCount(total)
            setHasMore(data.pagination?.hasNext || false)
            setCurrentPage(page)
            setStats(data.stats || { workflows: 0, packs: 0 })
        } catch (error) {
            console.error('Error searching:', error)
        } finally {
            loadingState(false)
        }
    }

    useEffect(() => {
        if (query.trim()) {
            setCurrentPage(1)
            loadSearchResults(1, false)
        }
    }, [query, typeFilter])

    const loadMore = () => {
        if (!hasMore || isLoadingMore) return
        loadSearchResults(currentPage + 1, true)
    }

    const updateTypeFilter = (type: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('type', type)
        window.history.replaceState(null, '', `?${params.toString()}`)
    }

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price / 100)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
                <div className="border-t" style={{ borderColor: topBorder }} />
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    {/* Search header skeleton */}
                    <div className="mb-8">
                        <div className="h-8 bg-[#223039] rounded-lg mb-3 animate-pulse" />
                        <div className="h-6 bg-[#223039] rounded-lg w-48 animate-pulse" />
                    </div>

                    {/* Results skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-44 md:h-56 bg-[#223039] rounded-xl animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
            <div className="border-t" style={{ borderColor: topBorder }} />

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                {/* Search Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <Search className="w-6 h-6 text-white/60" />
                        <h1 className="text-white font-space-grotesk text-2xl">
                            Search Results
                        </h1>
                    </div>
                    <p className="text-white/80 mb-4">
                        {totalCount === 0
                            ? `No results found for "${query}"`
                            : `${totalCount} result${totalCount === 1 ? '' : 's'} found for "${query}"`
                        }
                    </p>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-4 h-4 text-white/60" />
                        <span className="text-white/60 text-sm">Filter by:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateTypeFilter('all')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${typeFilter === 'all'
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'bg-[#1B272C] text-white/80 hover:text-white hover:bg-white/10 border border-white/20'
                                    }`}
                            >
                                All ({stats.workflows + stats.packs})
                            </button>
                            <button
                                onClick={() => updateTypeFilter('workflows')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${typeFilter === 'workflows'
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'bg-[#1B272C] text-white/80 hover:text-white hover:bg-white/10 border border-white/20'
                                    }`}
                            >
                                <Workflow className="w-4 h-4" />
                                Workflows ({stats.workflows})
                            </button>
                            <button
                                onClick={() => updateTypeFilter('packs')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${typeFilter === 'packs'
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'bg-[#1B272C] text-white/80 hover:text-white hover:bg-white/10 border border-white/20'
                                    }`}
                            >
                                <Package className="w-4 h-4" />
                                Packs ({stats.packs})
                            </button>
                        </div>
                    </div>
                </div>

                {/* No Results */}
                {totalCount === 0 && (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <h3 className="text-white font-space-grotesk text-xl mb-2">
                            No results found
                        </h3>
                        <p className="text-white/60 max-w-md mx-auto">
                            Try adjusting your search terms or browse our marketplace to discover amazing workflows and packs.
                        </p>
                    </div>
                )}

                {/* Results Grid */}
                {results.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                            {results.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="space-y-2">
                                    <a
                                        href={item.type === 'workflow' ? `/workflow/${item.id}` : `/packs/${item.id}`}
                                        className="group relative rounded-xl overflow-hidden h-44 md:h-56 bg-[#223039] border border-[#2A3A41] block"
                                    >
                                        {/* Type Badge */}
                                        <div className="absolute top-3 left-3 z-20">
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'workflow'
                                                ? 'bg-blue-500/90 text-white'
                                                : 'bg-purple-500/90 text-white'
                                                }`}>
                                                {item.type === 'workflow' ? (
                                                    <div className="flex items-center gap-1">
                                                        <Workflow className="w-3 h-3" />
                                                        Workflow
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <Package className="w-3 h-3" />
                                                        Pack ({item.workflowCount} workflows)
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hero Image */}
                                        {item.heroImage ? (
                                            <img
                                                src={item.heroImage}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="absolute inset-0">
                                                <AutoThumbnail
                                                    workflow={{
                                                        id: item.id,
                                                        title: item.title,
                                                        shortDesc: item.description,
                                                        longDescMd: '',
                                                        categories: item.categories.map(category => ({
                                                            category: {
                                                                id: category,
                                                                name: category,
                                                                slug: category,
                                                            },
                                                        })),
                                                        tags: item.tags.map(tag => ({
                                                            tag: {
                                                                id: tag,
                                                                name: tag,
                                                                slug: tag,
                                                            },
                                                        })),
                                                    }}
                                                    size="lg"
                                                    className="absolute inset-0 w-full h-full"
                                                />
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                                        {/* Content */}
                                        <div className="relative z-10 p-4 text-white h-full flex flex-col justify-end transition-transform duration-300 group-hover:-translate-y-3">
                                            <div className="font-space-grotesk text-base md:text-lg line-clamp-1">{item.title}</div>
                                            <div className="text-sm text-white/80 line-clamp-2 mt-1">{item.description}</div>

                                            {/* Price and Rating */}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-medium text-white">
                                                    {formatPrice(item.price, item.currency)}
                                                </span>
                                                {item.rating > 0 && (
                                                    <div className="flex items-center gap-1 text-sm text-white/80">
                                                        <span>★</span>
                                                        <span>{item.rating.toFixed(1)}</span>
                                                        <span>({item.ratingCount})</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Seller */}
                                            <div className="text-xs text-white/60 mt-1">
                                                by {item.seller}
                                            </div>
                                        </div>

                                        {/* Hover Action */}
                                        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center transition-all duration-300 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
                                            <span className="px-4 py-2 rounded-full bg-white text-[#202D33] font-medium">
                                                See Details
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            ))}

                            {/* Loading skeleton for more results */}
                            {isLoadingMore && Array.from({ length: 4 }).map((_, i) => (
                                <div key={`loading-${i}`} className="space-y-2">
                                    <div className="h-44 md:h-56 bg-[#223039] rounded-xl animate-pulse" />
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center">
                                <Button
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                    className="bg-[#1B272C] hover:bg-white/10 text-white rounded-full disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : `Load More ${typeFilter === 'all' ? 'Results' : typeFilter === 'workflows' ? 'Workflows' : 'Packs'}`}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
