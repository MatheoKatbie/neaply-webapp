'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Star, Heart, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface WorkflowPack {
    id: string
    title: string
    slug: string
    shortDesc: string
    heroImageUrl?: string
    basePriceCents: number
    currency: string
    salesCount: number
    ratingAvg: number
    ratingCount: number
    createdAt: string
    seller: {
        id: string
        displayName: string
        avatarUrl?: string
        sellerProfile?: {
            storeName: string
            slug: string
        }
    }
    workflows: Array<{
        workflow: {
            id: string
            title: string
            shortDesc: string
            heroImageUrl?: string
            ratingAvg: number
            ratingCount: number
        }
    }>
    categories: Array<{
        category: {
            id: string
            name: string
            slug: string
        }
    }>
    tags: Array<{
        tag: {
            id: string
            name: string
            slug: string
        }
    }>
    _count: {
        reviews: number
        favorites: number
    }
}

interface PacksResponse {
    packs: WorkflowPack[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export default function PacksPage() {
    const [packs, setPacks] = useState<WorkflowPack[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchPacks = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(search && { search }),
                ...(category && { category }),
                ...(sortBy && { sortBy })
            })

            const response = await fetch(`/api/packs?${params}`)
            if (!response.ok) throw new Error('Failed to fetch packs')

            const data: PacksResponse = await response.json()
            setPacks(data.packs)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error('Error fetching packs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPacks()
    }, [page, search, category, sortBy])

    const formatPrice = (cents: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(cents / 100)
    }

    const formatRating = (rating: unknown) => {
        const numericRating = typeof rating === 'number' ? rating : Number(rating ?? 0)
        return Number.isFinite(numericRating) ? numericRating.toFixed(1) : '0.0'
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Package className="w-8 h-8 text-primary" />
                        <h1 className="text-4xl font-bold text-foreground">Workflow Packs</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover curated collections of workflows designed to work together.
                        Each pack contains up to 10 complementary workflows for maximum automation efficiency.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search workflow packs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="automation">Automation</SelectItem>
                                <SelectItem value="data-processing">Data Processing</SelectItem>
                                <SelectItem value="integrations">Integrations</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="productivity">Productivity</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="popular">Most Popular</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Packs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-48 bg-muted rounded-lg mb-4"></div>
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-2/3"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : packs.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No packs found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {packs.map((pack) => (
                                <Card key={pack.id} className="group hover:shadow-lg transition-all duration-300">
                                    <Link href={`/packs/${pack.id}`}>
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                                    <Package className="w-12 h-12 text-primary" />
                                                </div>
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                                        {pack.workflows.length} workflows
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {pack.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mb-3">
                                                {pack.shortDesc}
                                            </CardDescription>

                                            {/* Seller Info */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm text-muted-foreground">
                                                    {pack.seller.sellerProfile?.storeName || pack.seller.displayName}
                                                </span>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span>{formatRating(pack.ratingAvg)}</span>
                                                        <span>({pack.ratingCount ?? 0})</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{pack.salesCount}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{pack._count.favorites}</span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-foreground">
                                                    {formatPrice(pack.basePriceCents, pack.currency)}
                                                </span>
                                                <Button size="sm" className="group-hover:bg-primary">
                                                    View Pack
                                                </Button>
                                            </div>

                                            {/* Categories */}
                                            {pack.categories.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {pack.categories.slice(0, 2).map((cat) => (
                                                        <Badge key={cat.category.id} variant="outline" className="text-xs">
                                                            {cat.category.name}
                                                        </Badge>
                                                    ))}
                                                    {pack.categories.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{pack.categories.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
