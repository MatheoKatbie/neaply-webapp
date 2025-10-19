'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AddToCartButton } from '@/components/ui/add-to-cart-button'
import { AnimatedHeart } from '@/components/ui/animated-heart'
import { ContactSellerButton } from '@/components/ui/contact-seller-button'
import { CopyButton } from '@/components/ui/copy-button'
import { PurchaseButton } from '@/components/ui/purchase-button'
import { ReportDialog } from '@/components/ui/report-dialog'
import { ReviewSystem } from '@/components/ui/review-system'
import { WorkflowAnalysisModal } from '@/components/ui/workflow-analysis-modal'
import { WorkflowAnalysisPreview } from '@/components/ui/workflow-analysis-preview'
import { WorkflowCardMini } from '@/components/ui/workflow-card-mini'
import { downloadWorkflowAsZip } from '@/lib/download-utils'
import { ArrowLeft, BarChart3, CheckCircle, Download, Eye, FileText, ShoppingBag, Star, Users, Zap } from 'lucide-react'
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
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
        {/* Decorative ellipses */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              left: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              right: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-12">
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/4 mb-8" style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 rounded-xl" style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}></div>
                <div className="h-64 rounded-xl" style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}></div>
              </div>
              <div className="space-y-6">
                <div className="h-80 rounded-xl" style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}></div>
                <div className="h-64 rounded-xl" style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
        {/* Decorative ellipses */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              left: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              right: '-471px',
              bottom: '400px',
              width: '639px',
              height: '639px',
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(350px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-12">
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.5)' }}
            >
              <Zap className="w-8 h-8" style={{ color: '#9DA2B3' }} />
            </div>
            <h3 className="text-lg font-aeonikpro font-semibold mb-2" style={{ color: '#EDEFF7' }}>
              {error || 'Workflow not found'}
            </h3>
            <p className="font-aeonikpro max-w-md mx-auto mb-6" style={{ color: '#9DA2B3' }}>
              The workflow you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => router.push('/')}
              className="font-aeonikpro bg-white text-black hover:bg-[#40424D]/30 py-3 px-6 text-lg rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
      {/* Decorative ellipses for ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            left: '-471px',
            top: '200px',
            width: '639px',
            height: '639px',
            backgroundColor: '#7899A8',
            opacity: 0.35,
            filter: 'blur(350px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            right: '-471px',
            bottom: '400px',
            width: '639px',
            height: '639px',
            backgroundColor: '#7899A8',
            opacity: 0.35,
            filter: 'blur(350px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-12">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="font-aeonikpro flex items-center gap-2 text-[#D3D6E0] hover:text-white transition-colors duration-300 group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Marketplace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image and Title */}
            <div
              className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
            >
              <div className="h-80 relative">
                {workflow.heroImage ? (
                  <img src={workflow.heroImage} alt={workflow.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="relative w-full h-full">
                    {(() => {
                      const platformColors = {
                        zapier: 'bg-[#FF4A00]',
                        n8n: 'bg-[#EA4B71]',
                        make: 'bg-gradient-to-br from-[#6D00CC] to-[#F901FC]',
                        airtable_script: 'bg-gradient-to-r from-blue-600 to-blue-800',
                      }
                      const bgColor =
                        platformColors[workflow.platform as keyof typeof platformColors] ||
                        'bg-gradient-to-r from-[#40424D] to-[#7899A8]'

                      return (
                        <div
                          className={`relative w-full h-full ${bgColor} dots-pattern flex items-center justify-center`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
                          {(() => {
                            const platformLogos = {
                              zapier: { gray: '/images/hero/zapier-grey.png', color: '/images/hero/zapier-color.png' },
                              n8n: { gray: '/images/hero/n8n-grey.png', color: '/images/hero/n8n-color.png' },
                              make: { gray: '/images/hero/make-grey.png', color: '/images/hero/make-color.png' },
                              airtable_script: {
                                gray: '/images/hero/airtable-grey.png',
                                color: '/images/hero/airtable-color.png',
                              },
                            }
                            const platformLogo = platformLogos[workflow.platform as keyof typeof platformLogos]
                            if (platformLogo) {
                              return (
                                <div className="relative w-24 h-24 z-10">
                                  <img
                                    src={platformLogo.color}
                                    alt={workflow.platform}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Platform badge */}
                {workflow.platform && (
                  <div className="absolute top-4 left-4">
                    <div
                      className="px-3 py-1.5 rounded-full font-aeonikpro text-sm font-medium"
                      style={{ backgroundColor: '#FFF', color: '#40424D' }}
                    >
                      {workflow.platform}
                    </div>
                  </div>
                )}

                {/* Status badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {workflow.isNew && (
                    <div
                      className="px-3 py-1.5 rounded-full font-aeonikpro text-xs font-medium"
                      style={{ backgroundColor: '#1814FB', color: '#FFF' }}
                    >
                      New
                    </div>
                  )}
                  {workflow.isTrending && (
                    <div
                      className="px-3 py-1.5 rounded-full font-aeonikpro text-xs font-medium flex items-center gap-1"
                      style={{ backgroundColor: '#FF7700', color: '#FFF' }}
                    >
                      <Zap className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="font-aeonikpro text-3xl md:text-4xl font-bold mb-3" style={{ color: '#EDEFF7' }}>
                      {workflow.title}
                    </h1>
                    <p className="font-aeonikpro text-lg" style={{ color: '#D3D6E0' }}>
                      {workflow.shortDesc}
                    </p>
                  </div>
                  <AnimatedHeart isFavorite={isFavorite} onToggle={handleFavoriteClick} className="ml-4" size="lg" />
                </div>

                {/* Categories and Tags */}
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {workflow.categories.map((category) => (
                      <div
                        key={category}
                        className="px-3 py-1.5 rounded-full font-aeonikpro text-sm"
                        style={{ backgroundColor: 'rgba(120, 153, 168, 0.2)', color: '#D3D6E0' }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workflow.tags.map((tag) => (
                      <div
                        key={tag}
                        className="px-3 py-1.5 rounded-full font-aeonikpro text-sm border border-[#9DA2B3]/25"
                        style={{ color: '#9DA2B3' }}
                      >
                        #{tag}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-6 border-t border-[#9DA2B3]/25">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#FF7700]" fill="#FF7700" />
                    <span className="font-aeonikpro text-lg font-medium" style={{ color: '#EDEFF7' }}>
                      {workflow.rating.toFixed(1)}
                    </span>
                    <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                      ({workflow.ratingCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-aeonikpro" style={{ color: '#9DA2B3' }}>
                    <Download className="w-5 h-5" />
                    <span>{workflow.salesCount} sales</span>
                  </div>
                  {workflow.version && (
                    <div className="flex items-center gap-2 font-aeonikpro" style={{ color: '#9DA2B3' }}>
                      <Eye className="w-5 h-5" />
                      <span>v{workflow.version.semver}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div
              className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
            >
              <div className="p-6 md:p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="font-aeonikpro text-xl font-semibold mb-4" style={{ color: '#EDEFF7' }}>
                      Description
                    </h3>
                    <div className="prose prose-gray max-w-none">
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
                              <blockquote
                                className="border-l-4 border-[#7899A8] pl-4 py-2 my-4 italic"
                                style={{ color: '#9DA2B3' }}
                              >
                                {children}
                              </blockquote>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-6 space-y-1 font-aeonikpro" style={{ color: '#D3D6E0' }}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-6 space-y-1 font-aeonikpro" style={{ color: '#D3D6E0' }}>
                                {children}
                              </ol>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-aeonikpro font-bold mt-6 mb-4" style={{ color: '#EDEFF7' }}>
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2
                                className="text-xl font-aeonikpro font-semibold mt-5 mb-3"
                                style={{ color: '#EDEFF7' }}
                              >
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-aeonikpro font-medium mt-4 mb-2" style={{ color: '#EDEFF7' }}>
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="font-aeonikpro leading-relaxed" style={{ color: '#D3D6E0' }}>
                                {children}
                              </p>
                            ),
                          }}
                        >
                          {workflow.longDescMd}
                        </ReactMarkdown>
                      ) : (
                        <p className="font-aeonikpro" style={{ color: '#D3D6E0' }}>
                          {workflow.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-px" style={{ backgroundColor: 'rgba(157, 162, 179, 0.25)' }} />

                  {/* Workflow Analysis */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-aeonikpro text-xl font-semibold" style={{ color: '#EDEFF7' }}>
                        Technical Analysis
                      </h3>
                      <WorkflowAnalysisModal
                        workflowId={workflowId}
                        trigger={
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-aeonikpro text-sm font-medium transition-all duration-300 hover:scale-105"
                            style={{ backgroundColor: 'rgba(120, 153, 168, 0.2)', color: '#D3D6E0' }}
                          >
                            <BarChart3 className="w-4 h-4" />
                            View Advanced Analysis
                          </button>
                        }
                      />
                    </div>
                    <WorkflowAnalysisPreview workflowId={workflowId} />
                  </div>

                  <div className="h-px" style={{ backgroundColor: 'rgba(157, 162, 179, 0.25)' }} />

                  {/* Version Information */}
                  {workflow.version ? (
                    <div>
                      <h3 className="font-aeonikpro text-xl font-semibold mb-4" style={{ color: '#EDEFF7' }}>
                        Version Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-aeonikpro text-sm font-medium" style={{ color: '#9DA2B3' }}>
                            Current Version
                          </span>
                          <p className="font-aeonikpro text-lg mt-1" style={{ color: '#EDEFF7' }}>
                            {workflow.version.semver}
                          </p>
                        </div>
                        {workflow.version.n8nMinVersion && (
                          <div>
                            <span className="font-aeonikpro text-sm font-medium" style={{ color: '#9DA2B3' }}>
                              Minimum n8n Version
                            </span>
                            <p className="font-aeonikpro text-lg mt-1" style={{ color: '#EDEFF7' }}>
                              {workflow.version.n8nMinVersion}
                            </p>
                          </div>
                        )}
                      </div>
                      {workflow.version.changelog && (
                        <div className="mt-4">
                          <span className="font-aeonikpro text-sm font-medium" style={{ color: '#9DA2B3' }}>
                            Changelog
                          </span>
                          <p className="font-aeonikpro mt-2" style={{ color: '#D3D6E0' }}>
                            {workflow.version.changelog}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="font-aeonikpro" style={{ color: '#9DA2B3' }}>
                        No version information available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div
              className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden sticky top-24"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="font-aeonikpro text-4xl font-bold mb-2" style={{ color: '#EDEFF7' }}>
                    {formatPrice(workflow.price, workflow.currency)}
                  </div>
                  <p className="font-aeonikpro" style={{ color: '#9DA2B3' }}>
                    One-time purchase
                  </p>
                </div>

                {workflow.userOwnsWorkflow ? (
                  <div className="space-y-3">
                    <button
                      disabled
                      className="w-full py-3 px-6 rounded-full font-aeonikpro font-medium cursor-not-allowed opacity-75 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#22c55e', color: '#FFF' }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Already Purchased
                    </button>
                    <div className="flex gap-2">
                      <CopyButton workflowId={workflowId} className="flex-1" />
                      <button
                        onClick={() => handleDownloadZip(workflowId, workflow.title)}
                        className="flex-1 py-2 px-4 rounded-full font-aeonikpro text-sm border border-[#9DA2B3]/25 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                        style={{ color: '#D3D6E0' }}
                      >
                        <Download className="w-4 h-4" />
                        Download ZIP
                      </button>
                    </div>
                    <p className="font-aeonikpro text-sm text-center" style={{ color: '#9DA2B3' }}>
                      You already own this workflow
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <PurchaseButton
                      workflowId={workflowId}
                      price={workflow.price}
                      currency={workflow.currency}
                      className="w-full bg-white text-black py-3 px-6 font-aeonikpro font-medium rounded-full transition-all duration-300"
                    >
                      Buy Now
                    </PurchaseButton>
                    <AddToCartButton
                      workflowId={workflowId}
                      price={workflow.price}
                      currency={workflow.currency}
                      className="w-full py-3 px-6 rounded-full font-aeonikpro font-medium border border-[#9DA2B3]/25 hover:bg-white transition-all duration-300 text-[#D3D6E0] bg-white/10 hover:text-black"
                    />
                  </div>
                )}

                <div className="space-y-3 mt-6 pt-6 border-t border-[#9DA2B3]/25">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-aeonikpro text-sm" style={{ color: '#D3D6E0' }}>
                      Instant download
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-aeonikpro text-sm" style={{ color: '#D3D6E0' }}>
                      Lifetime access
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-aeonikpro text-sm" style={{ color: '#D3D6E0' }}>
                      Free updates
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-aeonikpro text-sm" style={{ color: '#D3D6E0' }}>
                      Documentation available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div
              className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
              style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
            >
              <div className="p-6">
                <h3 className="font-aeonikpro text-lg font-semibold mb-4" style={{ color: '#EDEFF7' }}>
                  Creator Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-aeonikpro font-medium" style={{ color: '#EDEFF7' }}>
                      {workflow.seller.storeName || workflow.seller.displayName}
                    </p>
                    <p className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                      n8n Workflow Expert
                    </p>
                  </div>
                  <div className="flex items-center gap-4 font-aeonikpro text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#FF7700]" fill="#FF7700" />
                      <span style={{ color: '#EDEFF7' }}>{workflow.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ color: '#9DA2B3' }}>
                      <Users className="w-4 h-4" />
                      <span>{workflow.salesCount} sales</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => workflow.seller.slug && router.push(`/store/${workflow.seller.slug}`)}
                      className="w-full py-2.5 px-4 rounded-md cursor-pointer font-aeonikpro text-sm font-medium border border-[#9DA2B3]/25 hover:bg-white/10 transition-all duration-300"
                      style={{ color: '#D3D6E0' }}
                    >
                      View Store
                    </button>
                    <ContactSellerButton
                      seller={{
                        displayName: workflow.seller.displayName,
                        storeName: workflow.seller.storeName,
                        email: workflow.seller.supportEmail,
                        phoneNumber: workflow.seller.phoneNumber,
                        countryCode: workflow.seller.countryCode,
                        avatarUrl: workflow.seller.avatarUrl,
                      }}
                      workflowTitle={workflow.title}
                      size="sm"
                      className="w-full"
                    />
                    <ReportDialog entityType="workflow" entityId={workflow.id} entityName={workflow.title} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Recommendations Slider - Full Width */}
        {recommendations &&
          (recommendations.similarWorkflows.length > 0 || recommendations.storeWorkflows.length > 0) && (
            <div className="mt-16">
              <div className="mb-8">
                <h2 className="font-aeonikpro text-2xl md:text-3xl font-bold mb-2" style={{ color: '#EDEFF7' }}>
                  You might also like
                </h2>
                <p className="font-aeonikpro" style={{ color: '#9DA2B3' }}>
                  Discover more workflows that match your interests
                </p>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                  {/* Similar Workflows */}
                  {recommendations.similarWorkflows.slice(0, 5).map((similarWorkflow) => (
                    <div key={`similar-${similarWorkflow.id}`} className="flex-shrink-0" style={{ width: '280px' }}>
                      <WorkflowCardMini {...similarWorkflow} />
                    </div>
                  ))}

                  {/* Store Workflows */}
                  {recommendations.storeWorkflows.slice(0, 4).map((storeWorkflow) => (
                    <div key={`store-${storeWorkflow.id}`} className="flex-shrink-0" style={{ width: '280px' }}>
                      <WorkflowCardMini {...storeWorkflow} />
                    </div>
                  ))}

                  {/* See More from Creator Card */}
                  {recommendations.storeWorkflows.length > 0 && (
                    <div className="flex-shrink-0" style={{ width: '280px' }}>
                      <div
                        className="h-full border-2 border-dashed border-[#9DA2B3]/25 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#7899A8] hover:bg-white/5 transition-all duration-300 cursor-pointer"
                        style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                        onClick={() => recommendations.storeSlug && router.push(`/store/${recommendations.storeSlug}`)}
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                          style={{ backgroundColor: 'rgba(120, 153, 168, 0.2)' }}
                        >
                          <ShoppingBag className="w-8 h-8" style={{ color: '#7899A8' }} />
                        </div>
                        <h3 className="font-aeonikpro font-semibold mb-2" style={{ color: '#EDEFF7' }}>
                          More from {recommendations.storeName}
                        </h3>
                        <p className="font-aeonikpro text-sm mb-4" style={{ color: '#9DA2B3' }}>
                          Explore {recommendations.storeWorkflows.length} more workflows from this creator
                        </p>
                        <button
                          className="w-full py-2 px-4 rounded-full font-aeonikpro text-sm font-medium border border-[#9DA2B3]/25 hover:bg-white/10 transition-all duration-300"
                          style={{ color: '#D3D6E0' }}
                        >
                          View Store
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewSystem
            workflowId={workflowId}
            userCanReview={workflow.userCanReview}
            userHasReviewed={workflow.userHasReviewed}
          />
        </div>
      </div>
    </div>
  )
}
