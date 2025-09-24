'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { useAuth } from '@/hooks/useAuth'
import Hero from '@/components/Hero'

interface StoreCard {
  userId: string
  storeName: string
  slug: string
  bio: string | null
  user: { displayName: string; avatarUrl: string | null }
  workflowsCount: number
}

export default function Home() {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price-low' | 'price-high'>('popular')
  const [trendingWorkflows, setTrendingWorkflows] = useState<any[]>([])
  const [newestWorkflows, setNewestWorkflows] = useState<any[]>([])

  const [stores, setStores] = useState<StoreCard[]>([])
  const [activeStore, setActiveStore] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fake stores data for filling empty spaces
  const fakeStores = useMemo(
    () => [
      {
        userId: 'fake-store-1',
        storeName: 'AutoFlow Solutions',
        slug: 'autoflow-solutions',
        bio: 'Streamline your business processes with our premium automation workflows',
        user: { displayName: 'AutoFlow Team', avatarUrl: null },
        workflowsCount: 12,
      },
      {
        userId: 'fake-store-2',
        storeName: 'Data Dynamics',
        slug: 'data-dynamics',
        bio: 'Transform your data management with powerful integration workflows',
        user: { displayName: 'Data Team', avatarUrl: null },
        workflowsCount: 8,
      },
      {
        userId: 'fake-store-3',
        storeName: 'CloudSync Pro',
        slug: 'cloudsync-pro',
        bio: 'Professional cloud synchronization and backup automation solutions',
        user: { displayName: 'CloudSync Team', avatarUrl: null },
        workflowsCount: 15,
      },
      {
        userId: 'fake-store-4',
        storeName: 'Marketing Automation Hub',
        slug: 'marketing-automation-hub',
        bio: 'Boost your marketing campaigns with intelligent automation workflows',
        user: { displayName: 'Marketing Team', avatarUrl: null },
        workflowsCount: 22,
      },
      {
        userId: 'fake-store-5',
        storeName: 'DevOps Central',
        slug: 'devops-central',
        bio: 'Accelerate your development pipeline with DevOps automation tools',
        user: { displayName: 'DevOps Team', avatarUrl: null },
        workflowsCount: 18,
      },
      {
        userId: 'fake-store-6',
        storeName: 'E-commerce Engine',
        slug: 'ecommerce-engine',
        bio: 'Complete e-commerce automation solutions for online businesses',
        user: { displayName: 'E-commerce Team', avatarUrl: null },
        workflowsCount: 25,
      },
      {
        userId: 'fake-store-7',
        storeName: 'Social Media Wizard',
        slug: 'social-media-wizard',
        bio: 'Automate your social media presence across all platforms',
        user: { displayName: 'Social Team', avatarUrl: null },
        workflowsCount: 14,
      },
      {
        userId: 'fake-store-8',
        storeName: 'Finance Flow',
        slug: 'finance-flow',
        bio: 'Streamline financial processes with automated accounting workflows',
        user: { displayName: 'Finance Team', avatarUrl: null },
        workflowsCount: 10,
      },
      {
        userId: 'fake-store-9',
        storeName: 'Customer Success Suite',
        slug: 'customer-success-suite',
        bio: 'Enhance customer experience with automated support workflows',
        user: { displayName: 'Success Team', avatarUrl: null },
        workflowsCount: 16,
      },
      {
        userId: 'fake-store-10',
        storeName: 'Analytics Pro',
        slug: 'analytics-pro',
        bio: 'Advanced analytics and reporting automation for data-driven decisions',
        user: { displayName: 'Analytics Team', avatarUrl: null },
        workflowsCount: 20,
      },
    ],
    []
  )

  // Fake workflows data for filling empty spaces - memoized to prevent recreation
  const fakeWorkflows = useMemo(
    () => [
      {
        id: 'fake-1',
        title: 'Email Marketing Automation',
        description: 'Automate your email campaigns with advanced segmentation and personalization features',
        price: 2999,
        rating: 4.7,
        heroImage: null,
        categories: ['Marketing', 'Email'],
        tags: ['automation', 'email', 'marketing'],
        platform: 'n8n',
        isFake: true,
      },
      {
        id: 'fake-2',
        title: 'Social Media Scheduler',
        description: 'Schedule and manage all your social media posts across multiple platforms',
        price: 1999,
        rating: 4.5,
        heroImage: null,
        categories: ['Social Media', 'Scheduling'],
        tags: ['social', 'scheduling', 'automation'],
        platform: 'zapier',
        isFake: true,
      },
      {
        id: 'fake-3',
        title: 'Customer Support Ticket System',
        description: 'Streamline customer support with automated ticket routing and response management',
        price: 3999,
        rating: 4.8,
        heroImage: null,
        categories: ['Support', 'CRM'],
        tags: ['support', 'tickets', 'automation'],
        platform: 'make',
        isFake: true,
      },
      {
        id: 'fake-4',
        title: 'E-commerce Order Processing',
        description: 'Automate order fulfillment, inventory management, and shipping notifications',
        price: 2499,
        rating: 4.6,
        heroImage: null,
        categories: ['E-commerce', 'Orders'],
        tags: ['ecommerce', 'orders', 'automation'],
        platform: 'airtable_script',
        isFake: true,
      },
      {
        id: 'fake-5',
        title: 'Data Backup & Sync',
        description: 'Automated data backup and synchronization across multiple cloud services',
        price: 1599,
        rating: 4.4,
        heroImage: null,
        categories: ['Data', 'Backup'],
        tags: ['backup', 'sync', 'data'],
        platform: 'n8n',
        isFake: true,
      },
      {
        id: 'fake-6',
        title: 'Lead Generation Pipeline',
        description: 'Automate lead capture, qualification, and nurturing processes',
        price: 3499,
        rating: 4.9,
        heroImage: null,
        categories: ['Sales', 'Leads'],
        tags: ['leads', 'sales', 'automation'],
        platform: 'zapier',
        isFake: true,
      },
      {
        id: 'fake-7',
        title: 'Content Publishing Workflow',
        description: 'Streamline content creation, approval, and publishing across multiple channels',
        price: 2299,
        rating: 4.3,
        heroImage: null,
        categories: ['Content', 'Publishing'],
        tags: ['content', 'publishing', 'workflow'],
        platform: 'make',
        isFake: true,
      },
      {
        id: 'fake-8',
        title: 'Invoice & Payment Processing',
        description: 'Automate invoice generation, payment tracking, and financial reporting',
        price: 2799,
        rating: 4.7,
        heroImage: null,
        categories: ['Finance', 'Invoicing'],
        tags: ['invoice', 'payment', 'finance'],
        platform: 'airtable_script',
        isFake: true,
      },
    ],
    []
  )

  // Load more states
  const [newestPage, setNewestPage] = useState(1)
  const [newestHasMore, setNewestHasMore] = useState(true)
  const [isLoadingNewest, setIsLoadingNewest] = useState(false)

  // Function to fill stores with fake data if needed
  const fillStores = useMemo(() => {
    return (realStores: StoreCard[], targetCount: number = 10) => {
      if (realStores.length >= targetCount) {
        return realStores.slice(0, targetCount)
      }

      const needed = targetCount - realStores.length
      return [...realStores, ...fakeStores.slice(0, needed)]
    }
  }, [fakeStores])

  // Function to fill workflows with fake data if needed - memoized for consistency
  const fillWorkflows = useMemo(() => {
    return (realWorkflows: any[], targetCount: number = 8) => {
      if (realWorkflows.length >= targetCount) {
        return realWorkflows.slice(0, targetCount)
      }

      const needed = targetCount - realWorkflows.length
      // Use a fixed order instead of random shuffle to prevent changes
      return [...realWorkflows, ...fakeWorkflows.slice(0, needed)]
    }
  }, [fakeWorkflows])

  // Function to get display data
  const getDisplayData = () => {
    return {
      title: 'Trending Workflows',
      workflows: fillWorkflows(trendingWorkflows, 10),
    }
  }

  const goTo = (idx: number) => {
    const displayStores = fillStores(stores)
    if (displayStores.length === 0) return
    if (isAnimating) return
    setIsAnimating(true)
    setActiveStore(idx)

    // Scroll to the specific store card
    const container = document.querySelector('.store-cards-container')
    if (container) {
      const cardWidth = 320 + 16 // card width + gap
      container.scrollTo({
        left: idx * cardWidth,
        behavior: 'smooth',
      })
    }

    setTimeout(() => setIsAnimating(false), 320)
  }

  const goPrev = () => {
    const displayStores = fillStores(stores)
    const newIndex = (activeStore - 1 + displayStores.length) % displayStores.length
    goTo(newIndex)
  }

  const goNext = () => {
    const displayStores = fillStores(stores)
    const newIndex = (activeStore + 1) % displayStores.length
    goTo(newIndex)
  }

  // Auto-advance disabled per user request

  const loadData = async () => {
    const qs = new URLSearchParams()
    if (sortBy) qs.set('sortBy', sortBy)

    try {
      const [wfTrendingRes, wfNewestRes, storeRes] = await Promise.allSettled([
        fetch(`/api/marketplace/workflows?limit=8&sortBy=popular&${qs.toString()}`),
        fetch(`/api/marketplace/workflows?limit=8&sortBy=newest&${qs.toString()}`),
        fetch(`/api/store/list?limit=5&sort=top-sales&${qs.toString()}`),
      ])

      // Handle trending workflows
      if (wfTrendingRes.status === 'fulfilled' && wfTrendingRes.value.ok) {
        const wfTrendingJson = await wfTrendingRes.value.json()
        setTrendingWorkflows(wfTrendingJson.data || wfTrendingJson.workflows || [])
      } else {
        console.warn(
          'Failed to load trending workflows:',
          wfTrendingRes.status === 'rejected' ? wfTrendingRes.reason : 'API error'
        )
        setTrendingWorkflows([])
      }

      // Handle newest workflows
      if (wfNewestRes.status === 'fulfilled' && wfNewestRes.value.ok) {
        const wfNewestJson = await wfNewestRes.value.json()
        setNewestWorkflows(wfNewestJson.data || wfNewestJson.workflows || [])
        setNewestHasMore(wfNewestJson.pagination?.hasNext || false)
      } else {
        console.warn(
          'Failed to load newest workflows:',
          wfNewestRes.status === 'rejected' ? wfNewestRes.reason : 'API error'
        )
        setNewestWorkflows([])
        setNewestHasMore(false)
      }

      // Handle stores
      if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
        const storeJson = await storeRes.value.json()
        setStores(storeJson.stores || [])
      } else {
        console.warn('Failed to load stores:', storeRes.status === 'rejected' ? storeRes.reason : 'API error')
        setStores([])
      }

      // Reset pagination when filters change
      setNewestPage(1)
    } catch (error) {
      console.error('Error loading data:', error)
      // Set empty arrays as fallback
      setTrendingWorkflows([])
      setNewestWorkflows([])
      setStores([])
      setNewestHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const loadMoreNewest = async () => {
    if (isLoadingNewest || !newestHasMore) return

    setIsLoadingNewest(true)
    const nextPage = newestPage + 1
    const qs = new URLSearchParams()
    if (sortBy) qs.set('sortBy', sortBy)
    qs.set('page', nextPage.toString())

    try {
      const response = await fetch(`/api/marketplace/workflows?limit=8&sortBy=newest&${qs.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newWorkflows = data.data || data.workflows || []

      setNewestWorkflows((prev) => [...prev, ...newWorkflows])
      setNewestPage(nextPage)
      setNewestHasMore(data.pagination?.hasNext || false)
    } catch (error) {
      console.error('Error loading more newest workflows:', error)
      // Don't update state on error, just log it
    } finally {
      setIsLoadingNewest(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#02000F' }}>
        <div className="border-t border-accent" />
        <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-4">
          {/* Stores Skeleton */}
          <div className="mb-6">
            <div className="h-8 bg-card rounded-lg mb-2 animate-pulse" />
            <div className="h-80 md:h-96 bg-card rounded-xl animate-pulse" />
          </div>

          {/* Trending Workflows Skeleton */}
          <section className="mb-6">
            <div className="h-8 bg-card rounded-lg mb-2 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="group h-full">
                  <div className="block bg-card border border-border rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
                    <div className="h-48 bg-gradient-to-r from-secondary/20 to-accent/20 p-3 animate-pulse">
                      <div className="h-full rounded-lg border-2 border-border/50 animate-pulse"></div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-muted rounded animate-pulse mb-2 flex-1"></div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Newest Workflows Skeleton */}
          <section className="mb-6">
            <div className="h-8 bg-card rounded-lg mb-2 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="group h-full">
                  <div className="block bg-card border border-border rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
                    <div className="h-48 bg-gradient-to-r from-secondary/20 to-accent/20 p-3 animate-pulse">
                      <div className="h-full rounded-lg border-2 border-border/50 animate-pulse"></div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-muted rounded animate-pulse mb-2 flex-1"></div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: '#02000F' }}>
        {/* Hero Section */}
        <Hero />

        {/* Featured Stores slider (max 5) - Full width */}
        <div className="mb-6">
          <div className="max-w-screen-2xl mx-auto px-3 md:px-4">
            <div className="flex items-center justify-between my-4">
              <h2 className="text-[#EDEFF7] font-aeonikpro text-2xl ">Featured stores</h2>
            </div>
          </div>

          <div className="relative">
            {/* Container with gradient overlays for navigation */}
            <div className="relative overflow-hidden">
              {/* Calculate padding to align with text container */}
              <div
                className="store-cards-container flex gap-4 py-6 overflow-x-auto scrollbar-hide"
                style={{
                  paddingLeft: 'calc((100vw - min(100vw, 1536px)) / 2 + 0.75rem)',
                  paddingRight: '1.5rem',
                }}
              >
                {fillStores(stores).map((s, index) => {
                  // Generate vibrant gradient colors like in the image
                  const gradients = [
                    'from-blue-600 to-blue-800', // Blue like #1814FB
                    'from-purple-600 to-purple-700', // Purple
                    'from-indigo-600 to-indigo-700', // Indigo
                    'from-pink-600 to-pink-800', // Pink
                    'from-red-600 to-red-800', // Red
                    'from-orange-600 to-orange-800', // Orange
                    'from-yellow-600 to-yellow-700', // Yellow
                    'from-green-600 to-green-800', // Green
                    'from-teal-600 to-teal-800', // Teal
                    'from-cyan-600 to-cyan-800', // Cyan
                    'from-violet-600 to-violet-800', // Violet
                    'from-fuchsia-600 to-fuchsia-800', // Fuchsia
                  ]

                  // Use a seeded random based on store slug for consistency
                  const hash = s.slug.split('').reduce((a, b) => {
                    a = (a << 5) - a + b.charCodeAt(0)
                    return a & a
                  }, 0)
                  const bgColor = gradients[Math.abs(hash) % gradients.length]

                  const isFake = s.userId.startsWith('fake-store-')

                  const cardContent = (
                    <div
                      className={`relative w-80 h-64 rounded-2xl bg-gradient-to-br ${bgColor} dots-pattern p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-105 cursor-pointer group flex-shrink-0 border border-[#FFFFFF]/25`}
                    >
                      {/* Dark gradient overlay from bottom to top */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent rounded-2xl z-5" />

                      {/* Store logo/icon */}
                      <div className="relative z-10 flex items-start justify-between">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          {s.user.avatarUrl ? (
                            <img src={s.user.avatarUrl} alt={s.storeName} className="w-8 h-8 rounded-xl object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-white/30 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {s.storeName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Store info */}
                      <div className="relative z-10 text-white h-[72px] flex flex-col justify-start">
                        <h3 className="font-aeonikpro text-xl mb-2 line-clamp-1">{s.storeName}</h3>
                        <p className="font-aeonikpro text-[#BCBFCC] text-sm line-clamp-2">
                          {s.bio || s.user.displayName}
                        </p>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl z-20" />
                    </div>
                  )

                  return (
                    <div key={s.slug}>
                      {isFake ? (
                        <div onClick={() => alert('This is a demo store. Real stores will be available soon!')}>
                          {cardContent}
                        </div>
                      ) : (
                        <Link href={`/store/${s.slug}`}>{cardContent}</Link>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Navigation arrows */}
              {activeStore > 0 && (
                <button
                  aria-label="Previous store"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors cursor-pointer z-30 flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <button
                aria-label="Next store"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors cursor-pointer z-30 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-4 ">
        {/* Trending Workflows */}
        <section className="mb-6">
          <h3 className="text-foreground font-space-grotesk mb-2 text-2xl font-bold">{getDisplayData().title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {getDisplayData().workflows.map((wf) => (
              <div key={wf.id} className="group h-full">
                <a
                  href={wf.isFake ? '#' : `/workflow/${wf.id}`}
                  onClick={
                    wf.isFake
                      ? (e) => {
                          e.preventDefault()
                          alert('This is a demo workflow. Real workflows will be available soon!')
                        }
                      : undefined
                  }
                  className="block bg-card border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col"
                >
                  {/* Header with AutoThumbnail */}
                  <div className="relative h-48 bg-gradient-to-r from-secondary/20 to-accent/20 p-3">
                    <div className="absolute inset-3 rounded-lg overflow-hidden border-2 border-border/50">
                      <AutoThumbnail
                        workflow={{
                          id: wf.id,
                          title: wf.title,
                          shortDesc: wf.description,
                          longDescMd: '',
                          categories: wf.categories || [],
                          tags: wf.tags || [],
                          platform: wf.platform,
                        }}
                        size="lg"
                        className="w-full h-full"
                        authorAvatarUrl={wf.sellerAvatarUrl || undefined}
                      />
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-space-grotesk text-lg font-bold text-foreground line-clamp-2 mb-2">
                      {wf.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{wf.description}</p>

                    {/* Footer with price and rating */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-space-grotesk font-bold text-green-400">
                            {wf.price === 0
                              ? 'Free'
                              : new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }).format(wf.price / 100)}
                          </span>
                        </div>

                        {/* Rating with star */}
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-foreground">
                            {wf.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>

                      {/* Platform and downloads */}
                      <div className="flex items-center justify-between">
                        {/* Sales count with better styling */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          <span className="font-medium">{wf.salesCount || 0} sales</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Newest Workflows */}
        <section className="mb-6">
          <h3 className="text-foreground font-space-grotesk mb-2 text-2xl font-bold">Latest Workflows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {fillWorkflows(newestWorkflows, 10).map((wf) => (
              <div key={wf.id} className="group h-full">
                <a
                  href={wf.isFake ? '#' : `/workflow/${wf.id}`}
                  onClick={
                    wf.isFake
                      ? (e) => {
                          e.preventDefault()
                          alert('This is a demo workflow. Real workflows will be available soon!')
                        }
                      : undefined
                  }
                  className="block bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col"
                >
                  {/* Header with AutoThumbnail */}
                  <div className="relative h-48 bg-gradient-to-r from-secondary/20 to-accent/20 p-3">
                    <div className="absolute inset-3 rounded-lg overflow-hidden border-2 border-border/50">
                      <AutoThumbnail
                        workflow={{
                          id: wf.id,
                          title: wf.title,
                          shortDesc: wf.description,
                          longDescMd: '',
                          categories: wf.categories || [],
                          tags: wf.tags || [],
                          platform: wf.platform,
                        }}
                        size="lg"
                        className="w-full h-full"
                        authorAvatarUrl={wf.sellerAvatarUrl || undefined}
                      />
                    </div>

                    {/* Removed connection indicator overlay - platform logo is now visible */}
                  </div>

                  {/* Content section */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-space-grotesk text-lg font-bold text-foreground line-clamp-2 mb-2">
                      {wf.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{wf.description}</p>

                    {/* Footer with price and rating */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-space-grotesk font-bold text-green-400">
                            {wf.price === 0
                              ? 'Free'
                              : new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }).format(wf.price / 100)}
                          </span>
                        </div>

                        {/* Rating with star */}
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-foreground">
                            {wf.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>

                      {/* Sales count only */}
                      <div className="flex items-center justify-end">
                        {/* Sales count with better styling */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          <span className="font-medium">{wf.salesCount || 0} sales</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
            {/* Loading skeleton for new workflows */}
            {isLoadingNewest &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`loading-${i}`} className="group h-full">
                  <div className="block bg-card border border-border rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
                    <div className="h-48 bg-gradient-to-r from-secondary/20 to-accent/20 p-3 animate-pulse">
                      <div className="h-full rounded-lg border-2 border-border/50 animate-pulse"></div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-muted rounded animate-pulse mb-2 flex-1"></div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {newestHasMore && (
            <div className="text-center mt-6">
              <Button
                onClick={loadMoreNewest}
                disabled={isLoadingNewest}
                className="bg-secondary hover:bg-white/10 text-foreground rounded-full disabled:opacity-50 px-8 py-3 font-semibold"
              >
                {isLoadingNewest ? 'Loading...' : 'Load More Workflows'}
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
