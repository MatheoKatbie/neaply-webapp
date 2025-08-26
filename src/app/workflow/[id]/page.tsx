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
import { CopyButton } from '@/components/ui/copy-button'
import { PlatformBadge } from '@/components/ui/platform-badge'
import { PurchaseButton } from '@/components/ui/purchase-button'
import { ReviewSystem } from '@/components/ui/review-system'
import { WorkflowAnalysisModal } from '@/components/ui/workflow-analysis-modal'
import { WorkflowAnalysisPreview } from '@/components/ui/workflow-analysis-preview'
import { WorkflowCardMini } from '@/components/ui/workflow-card-mini'
import { downloadWorkflowAsZip } from '@/lib/download-utils'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Download,
  Eye,
  FileText,
  ShoppingBag,
  Star,
  Users,
  Zap
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface WorkflowDetail {
  id: string
  title: string
  shortDesc: string
  longDescMd?: string
  price: number
  currency: string
  platform?: string
  seller: {
    displayName: string
    storeName?: string
    slug?: string
    supportEmail?: string
    phoneNumber?: string
    countryCode?: string
    websiteUrl?: string
    avatarUrl?: string
  }
  rating: number
  ratingCount: number
  salesCount: number
  heroImage?: string
  categories: string[]
  tags: string[]
  isNew?: boolean
  isTrending?: boolean
  slug: string
  createdAt: string
  updatedAt: string
  userOwnsWorkflow?: boolean
  userCanReview?: boolean
  userHasReviewed?: boolean
  version: {
    semver: string
    changelog?: string
    n8nMinVersion?: string
    n8nMaxVersion?: string
    jsonContent?: any
  }
}

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [recommendations, setRecommendations] = useState<{
    similarWorkflows: any[]
    storeWorkflows: any[]
    storeName: string
    storeSlug?: string
  } | null>(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)

  // Fetch workflow details and favorite status
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/marketplace/workflows/${workflowId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Workflow not found')
          } else {
            setError('Failed to load workflow')
          }
          return
        }

        const data = await response.json()
        setWorkflow(data.data)

        // Fetch recommendations after workflow is loaded
        fetchRecommendations()
      } catch (error) {
        console.error('Error fetching workflow:', error)
        setError('Failed to load workflow')
      } finally {
        setLoading(false)
      }
    }

    const fetchRecommendations = async () => {
      try {
        setRecommendationsLoading(true)
        const response = await fetch(`/api/marketplace/workflows/${workflowId}/recommendations`)
        if (response.ok) {
          const data = await response.json()
          setRecommendations(data)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setRecommendationsLoading(false)
      }
    }

    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          const isWorkflowFavorited = data.favorites.some((fav: any) => fav.id === workflowId)
          setIsFavorite(isWorkflowFavorited)
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    if (workflowId) {
      fetchWorkflow()
      checkFavoriteStatus()
    }
  }, [workflowId])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100)
  }

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workflowId }),
        })

        if (response.ok) {
          setIsFavorite(false)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workflowId }),
        })

        if (response.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }

  const handlePurchase = () => {
    // This will be handled by the PurchaseButton component
    console.log('Purchase workflow:', workflowId)
  }

  const handleDownloadZip = async (workflowId: string, workflowTitle: string) => {
    try {
      await downloadWorkflowAsZip(workflowId, workflowTitle)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download workflow. Please try again.')
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

  if (error || !workflow) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{error || 'Workflow not found'}</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                The workflow you're looking for doesn't exist or may have been removed.
              </p>
              <Button onClick={() => router.push('/marketplace')} className="cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
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
            <Button variant="ghost" onClick={() => router.push('/marketplace')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image and Title */}
              <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                <div className="h-64 relative">
                  {workflow.heroImage ? (
                    <img src={workflow.heroImage} alt={workflow.title} className="w-full h-full object-cover" />
                  ) : (
                    <AutoThumbnail
                      workflow={{
                        id: workflow.id,
                        title: workflow.title,
                        shortDesc: workflow.shortDesc,
                        longDescMd: workflow.longDescMd || '',
                        categories: workflow.categories.map((cat) => ({ category: { id: '', name: cat, slug: '' } })),
                        tags: workflow.tags.map((tag) => ({ tag: { id: '', name: tag, slug: '' } })),
                        platform: workflow.platform,
                      }}
                      size="lg"
                      className="w-full h-full"
                    />
                  )}

                  {/* Platform badge */}
                  {workflow.platform && (
                    <div className="absolute top-4 left-4">
                      <PlatformBadge
                        platform={workflow.platform}
                        size="default"
                        variant="default"
                        className="shadow-sm"
                      />
                    </div>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {workflow.isNew && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                    {workflow.isTrending && (
                      <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-foreground mb-2">{workflow.title}</h1>
                      <p className="text-muted-foreground text-lg">{workflow.shortDesc}</p>
                    </div>
                    <AnimatedHeart isFavorite={isFavorite} onToggle={handleFavoriteClick} className="ml-4" size="lg" />
                  </div>

                  {/* Categories and Tags */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {workflow.categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {workflow.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-muted-foreground">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{workflow.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({workflow.ratingCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span>{workflow.salesCount} sales</span>
                    </div>
                    {workflow.version && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>Version {workflow.version.semver}</span>
                      </div>
                    )}
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
                        {workflow.longDescMd ? (
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
                            {workflow.longDescMd}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground">{workflow.shortDesc}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Workflow Analysis */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Technical Analysis</h3>
                        <WorkflowAnalysisModal
                          workflowId={workflowId}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Advanced Analysis
                            </Button>
                          }
                        />
                      </div>
                      <WorkflowAnalysisPreview workflowId={workflowId} />
                    </div>

                    <Separator />

                    {workflow.version ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Version Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Current Version</span>
                            <p className="text-lg">{workflow.version.semver}</p>
                          </div>
                          {workflow.version.n8nMinVersion && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Minimum n8n Version</span>
                              <p className="text-lg">{workflow.version.n8nMinVersion}</p>
                            </div>
                          )}
                        </div>
                        {workflow.version.changelog && (
                          <div className="mt-4">
                            <span className="text-sm font-medium text-muted-foreground">Changelog</span>
                            <p className="mt-1">{workflow.version.changelog}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No version information available</p>
                      </div>
                    )}
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
                      {formatPrice(workflow.price, workflow.currency)}
                    </div>
                    <p className="text-muted-foreground">One-time purchase</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workflow.userOwnsWorkflow ? (
                    <div className="w-full space-y-3">
                      <Button disabled className="w-full bg-green-600 text-primary-foreground cursor-not-allowed opacity-75">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Already Purchased
                      </Button>
                      <div className="flex gap-2">
                        <CopyButton
                          workflowId={workflowId}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleDownloadZip(workflowId, workflow.title)}
                          size='sm'
                          className="flex-1"
                          variant='outline'
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download ZIP
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">You already own this workflow</p>
                    </div>
                  ) : (
                    <PurchaseButton
                      workflowId={workflowId}
                      price={workflow.price}
                      currency={workflow.currency}
                      className="w-full bg-accent-foreground"
                    />
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
                      <span>Documentation available</span>
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
                      <p className="font-medium">{workflow.seller.storeName || workflow.seller.displayName}</p>
                      <p className="text-sm text-muted-foreground">n8n Workflow Expert</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{workflow.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{workflow.salesCount} sales</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer"
                        onClick={() => workflow.seller.slug && router.push(`/store/${workflow.seller.slug}`)}
                      >
                        View Store
                      </Button>
                      <ContactSellerButton
                        seller={{
                          displayName: workflow.seller.displayName,
                          storeName: workflow.seller.storeName,
                          supportEmail: workflow.seller.supportEmail,
                          phoneNumber: workflow.seller.phoneNumber,
                          countryCode: workflow.seller.countryCode,
                          websiteUrl: workflow.seller.websiteUrl,
                          avatarUrl: workflow.seller.avatarUrl,
                        }}
                        workflowTitle={workflow.title}
                        size="sm"
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Unified Recommendations Slider - Full Width */}
          {recommendations && (recommendations.similarWorkflows.length > 0 || recommendations.storeWorkflows.length > 0) && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">You might also like</h2>
                <p className="text-muted-foreground">Discover more workflows that match your interests</p>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                  {/* Similar Workflows - First 4-5 items */}
                  {recommendations.similarWorkflows.slice(0, 5).map((similarWorkflow) => (
                    <div key={`similar-${similarWorkflow.id}`} className="flex-shrink-0" style={{ width: '280px' }}>
                      <WorkflowCardMini
                        {...similarWorkflow}
                      />
                    </div>
                  ))}

                  {/* Store Workflows - Next items */}
                  {recommendations.storeWorkflows.slice(0, 4).map((storeWorkflow) => (
                    <div key={`store-${storeWorkflow.id}`} className="flex-shrink-0" style={{ width: '280px' }}>
                      <WorkflowCardMini
                        {...storeWorkflow}
                      />
                    </div>
                  ))}

                  {/* See More from Creator Card */}
                  {recommendations.storeWorkflows.length > 0 && (
                    <div className="flex-shrink-0" style={{ width: '280px' }}>
                      <div className="h-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => recommendations.storeSlug && router.push(`/store/${recommendations.storeSlug}`)}>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <ShoppingBag className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">More from {recommendations.storeName}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Explore {recommendations.storeWorkflows.length} more workflows from this creator
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Store
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-12">
            <ReviewSystem
              workflowId={workflowId}
              userCanReview={workflow.userCanReview}
              userHasReviewed={workflow.userHasReviewed}
            />
          </div>
        </div>
      </div>
    </>
  )
}
