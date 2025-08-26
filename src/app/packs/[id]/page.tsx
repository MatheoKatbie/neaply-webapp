'use client'

import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AnimatedHeart } from '@/components/ui/animated-heart'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { ContactSellerButton } from '@/components/ui/contact-seller-button'
import { PlatformBadge } from '@/components/ui/platform-badge'
import { WorkflowCardMini } from '@/components/ui/workflow-card-mini'
import {
    ArrowLeft,
    CheckCircle,
    Download,
    FileText,
    Package,
    ShoppingCart,
    Star,
    Users,
    Zap
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface PackDetail {
    id: string
    title: string
    slug: string
    shortDesc: string
    longDescMd?: string
    basePriceCents: number
    currency: string
    platform?: string
    seller: {
        id: string
        displayName: string
        sellerProfile?: {
            storeName?: string
            slug?: string
            bio?: string
        }
        avatarUrl?: string
    }
    ratingAvg: number
    ratingCount: number
    salesCount: number
    heroImageUrl?: string
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
    workflows: Array<{
        workflow: {
            id: string
            title: string
            shortDesc: string
            heroImageUrl?: string
            ratingAvg: number
            ratingCount: number
            salesCount: number
            basePriceCents: number
            currency: string
            platform?: string
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
        }
    }>
    createdAt: string
    updatedAt: string
    isFavorited?: boolean
    userOwnsPack?: boolean
    _count: {
        reviews: number
        favorites: number
    }
    reviews: Array<{
        id: string
        rating: number
        title?: string
        bodyMd?: string
        createdAt: string
        user: {
            id: string
            displayName: string
            avatarUrl?: string
        }
    }>
}

export default function PackDetailPage() {
    const params = useParams()
    const router = useRouter()
    const packId = params.id as string

    const [pack, setPack] = useState<PackDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [purchasing, setPurchasing] = useState(false)

    // Fetch pack details and favorite status
    useEffect(() => {
        const fetchPack = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/packs/${packId}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Pack not found')
                    } else {
                        setError('Failed to load pack')
                    }
                    return
                }

                const data = await response.json()
                setPack(data.pack)
                setIsFavorite(data.pack.isFavorited || false)
            } catch (error) {
                console.error('Error fetching pack:', error)
                setError('Failed to load pack')
            } finally {
                setLoading(false)
            }
        }

        if (packId) {
            fetchPack()
        }
    }, [packId])

    const formatPrice = (priceCents: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(priceCents / 100)
    }

    const formatRating = (rating: unknown) => {
        const numericRating = typeof rating === 'number' ? rating : Number(rating ?? 0)
        return Number.isFinite(numericRating) ? numericRating.toFixed(1) : '0.0'
    }

    const handleFavoriteClick = async () => {
        try {
            if (isFavorite) {
                // Remove from favorites
                const response = await fetch(`/api/packs/${packId}/favorite`, {
                    method: 'DELETE',
                })

                if (response.ok) {
                    setIsFavorite(false)
                }
            } else {
                // Add to favorites
                const response = await fetch(`/api/packs/${packId}/favorite`, {
                    method: 'POST',
                })

                if (response.ok) {
                    setIsFavorite(true)
                }
            }
        } catch (error) {
            console.error('Error updating favorites:', error)
        }
    }

    const handlePurchase = async () => {
        if (purchasing) return

        try {
            setPurchasing(true)

            // Create checkout session for pack
            const response = await fetch('/api/checkout/pack-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ packId }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create checkout session')
            }

            const { url } = await response.json()

            // Redirect to Stripe Checkout
            if (url) {
                window.location.href = url
            } else {
                throw new Error('No checkout URL received')
            }
        } catch (error) {
            console.error('Error initiating purchase:', error)
            alert(error instanceof Error ? error.message : 'Failed to start checkout process')
        } finally {
            setPurchasing(false)
        }
    }

    const handleDownloadPack = async () => {
        try {
            const response = await fetch(`/api/packs/${packId}/download`)

            if (!response.ok) {
                throw new Error('Failed to download pack')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${pack?.title.replace(/[^a-zA-Z0-9]/g, '_')}_pack.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download error:', error)
            alert('Failed to download pack. Please try again.')
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-background pt-20 md:pt-24">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <div className="h-96 bg-muted rounded-lg mb-6"></div>
                                    <div className="h-32 bg-muted rounded-lg"></div>
                                </div>
                                <div className="h-96 bg-muted rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (error || !pack) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-background pt-20 md:pt-24">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{error || 'Pack not found'}</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                The pack you're looking for doesn't exist or may have been removed.
                            </p>
                            <Button onClick={() => router.push('/packs')} className="cursor-pointer">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Packs
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background pt-20 md:pt-24">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push('/packs')} className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Packs
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Hero Image and Title */}
                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                <div className="h-64 relative">
                                    {pack.heroImageUrl ? (
                                        <img src={pack.heroImageUrl} alt={pack.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                            <Package className="w-16 h-16 text-primary" />
                                        </div>
                                    )}

                                    {/* Platform badge */}
                                    {pack.platform && (
                                        <div className="absolute top-4 left-4">
                                            <PlatformBadge
                                                platform={pack.platform}
                                                size="default"
                                                variant="default"
                                                className="shadow-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Workflow count badge */}
                                    <div className="absolute top-4 right-4">
                                        <Badge variant="default" className="text-xs bg-background/80 backdrop-blur-sm text-foreground">
                                            {pack.workflows.length} workflows
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h1 className="text-2xl font-bold text-foreground mb-2">{pack.title}</h1>
                                            <p className="text-muted-foreground text-lg">{pack.shortDesc}</p>
                                        </div>
                                        <AnimatedHeart isFavorite={isFavorite} onToggle={handleFavoriteClick} className="ml-4" size="lg" />
                                    </div>

                                    {/* Categories and Tags */}
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {pack.categories.map((cat) => (
                                                <Badge key={cat.category.id} variant="secondary">
                                                    {cat.category.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {pack.tags.map((tag) => (
                                                <Badge key={tag.tag.id} variant="outline" className="text-muted-foreground">
                                                    #{tag.tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{formatRating(pack.ratingAvg)}</span>
                                            <span className="text-sm text-muted-foreground">({pack.ratingCount} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Download className="w-4 h-4" />
                                            <span>{pack.salesCount} sales</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Package className="w-4 h-4" />
                                            <span>{pack.workflows.length} workflows</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Card */}
                            <Card className="overflow-hidden">
                                <div className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                                            <div className="prose prose-gray max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-blue-600 prose-strong:text-foreground prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                                                {pack.longDescMd ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                                        components={{
                                                            code: ({ className, children, ...props }) => {
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                const isInline = !match
                                                                return isInline ? (
                                                                    <code className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-sm" {...props}>
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                )
                                                            },
                                                            blockquote: ({ children }) => (
                                                                <blockquote className="border-l-4 border-blue-200 bg-blue-50/50 pl-4 py-2 my-4 italic text-muted-foreground">
                                                                    {children}
                                                                </blockquote>
                                                            ),
                                                            ul: ({ children }) => (
                                                                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">{children}</ul>
                                                            ),
                                                            ol: ({ children }) => (
                                                                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">{children}</ol>
                                                            ),
                                                            h1: ({ children }) => (
                                                                <h1 className="text-2xl font-bold text-foreground mt-6 mb-4">{children}</h1>
                                                            ),
                                                            h2: ({ children }) => (
                                                                <h2 className="text-xl font-semibold text-foreground mt-5 mb-3">{children}</h2>
                                                            ),
                                                            h3: ({ children }) => (
                                                                <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{children}</h3>
                                                            ),
                                                        }}
                                                    >
                                                        {pack.longDescMd}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p className="text-muted-foreground">{pack.shortDesc}</p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Included Workflows */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Included Workflows ({pack.workflows.length})</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {pack.workflows.map(({ workflow }) => (
                                                    <div key={workflow.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 flex-shrink-0">
                                                                {workflow.heroImageUrl ? (
                                                                    <img
                                                                        src={workflow.heroImageUrl}
                                                                        alt={workflow.title}
                                                                        className="w-full h-full object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <AutoThumbnail
                                                                        workflow={{
                                                                            id: workflow.id,
                                                                            title: workflow.title,
                                                                            shortDesc: workflow.shortDesc,
                                                                            longDescMd: '',
                                                                            categories: workflow.categories,
                                                                            tags: workflow.tags,
                                                                            platform: workflow.platform,
                                                                        }}
                                                                        size="sm"
                                                                        className="w-full h-full"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-foreground mb-1 truncate">{workflow.title}</h4>
                                                                <p className="text-sm text-muted-foreground line-clamp-2">{workflow.shortDesc}</p>
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                        <span>{formatRating(workflow.ratingAvg)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Download className="w-3 h-3" />
                                                                        <span>{workflow.salesCount}</span>
                                                                    </div>
                                                                    {workflow.platform && (
                                                                        <PlatformBadge platform={workflow.platform} size="sm" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-medium text-muted-foreground">
                                                                    {formatPrice(workflow.basePriceCents, workflow.currency)}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">individual</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Total value calculation */}
                                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">Total individual value:</span>
                                                    <span className="font-medium">
                                                        {formatPrice(
                                                            pack.workflows.reduce((total, { workflow }) => total + workflow.basePriceCents, 0),
                                                            pack.currency
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-sm font-medium text-green-600">Pack price:</span>
                                                    <span className="font-bold text-green-600">{formatPrice(pack.basePriceCents, pack.currency)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-sm font-medium text-green-600">You save:</span>
                                                    <span className="font-bold text-green-600">
                                                        {formatPrice(
                                                            pack.workflows.reduce((total, { workflow }) => total + workflow.basePriceCents, 0) - pack.basePriceCents,
                                                            pack.currency
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Purchase Card */}
                            <Card>
                                <CardHeader>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">
                                            {formatPrice(pack.basePriceCents, pack.currency)}
                                        </div>
                                        <p className="text-muted-foreground">One-time purchase</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {pack.userOwnsPack ? (
                                        <div className="w-full space-y-3">
                                            <Button disabled className="w-full bg-green-600 text-primary-foreground cursor-not-allowed opacity-75">
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Already Purchased
                                            </Button>
                                            <Button
                                                onClick={handleDownloadPack}
                                                className="w-full"
                                                variant="outline"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Pack
                                            </Button>
                                            <p className="text-sm text-muted-foreground text-center">You already own this pack</p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handlePurchase}
                                            disabled={purchasing}
                                            className="w-full bg-accent-foreground cursor-pointer"
                                        >
                                            {purchasing ? (
                                                <>
                                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Purchase Pack
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Instant download</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Lifetime access</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Free updates</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-green-500" />
                                            <span>Documentation included</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-green-500" />
                                            <span>{pack.workflows.length} complete workflows</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seller Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Creator Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-medium">{pack.seller.sellerProfile?.storeName || pack.seller.displayName}</p>
                                            <p className="text-sm text-muted-foreground">n8n Workflow Expert</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span>{formatRating(pack.ratingAvg)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{pack.salesCount} sales</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full cursor-pointer"
                                                onClick={() => pack.seller.sellerProfile?.slug && router.push(`/store/${pack.seller.sellerProfile.slug}`)}
                                            >
                                                View Store
                                            </Button>
                                            <ContactSellerButton
                                                seller={{
                                                    displayName: pack.seller.displayName,
                                                    storeName: pack.seller.sellerProfile?.storeName,
                                                    avatarUrl: pack.seller.avatarUrl,
                                                }}
                                                workflowTitle={pack.title}
                                                size="sm"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {pack.reviews.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pack.reviews.map((review) => (
                                    <Card key={review.id} className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                {review.user.avatarUrl ? (
                                                    <img src={review.user.avatarUrl} alt={review.user.displayName} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-medium text-primary">
                                                        {review.user.displayName.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{review.user.displayName}</span>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.title && (
                                                    <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                                                )}
                                                {review.bodyMd && (
                                                    <p className="text-sm text-muted-foreground line-clamp-3">{review.bodyMd}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
