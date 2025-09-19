'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Check, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { PlatformBadge } from '@/components/ui/platform-badge'
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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price-low' | 'price-high'>('popular')
  const [trendingWorkflows, setTrendingWorkflows] = useState<any[]>([])
  const [newestWorkflows, setNewestWorkflows] = useState<any[]>([])

  const [stores, setStores] = useState<StoreCard[]>([])
  const [activeStore, setActiveStore] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  // Function to get display data based on current filter
  const getDisplayData = () => {
    return {
      title:
        category === 'all' ? 'Trending Workflows' : `${category.charAt(0).toUpperCase() + category.slice(1)} Workflows`,
      workflows: fillWorkflows(trendingWorkflows, 10),
    }
  }

  const goTo = (idx: number) => {
    if (stores.slice(0, 5).length === 0) return
    if (isAnimating) return
    setIsAnimating(true)
    setActiveStore(idx)
    setTimeout(() => setIsAnimating(false), 320)
  }
  const goPrev = () => goTo((activeStore - 1 + Math.min(stores.length, 5)) % Math.min(stores.length, 5))
  const goNext = () => goTo((activeStore + 1) % Math.min(stores.length, 5))

  // Auto-advance every 3s (stable, not tied to activeStore to avoid reset loop)
  useEffect(() => {
    const visible = Math.min(stores.length, 5)
    if (visible <= 1) return
    const id = setInterval(() => {
      if (isAnimating) return
      setIsAnimating(true)
      setActiveStore((prev) => (prev + 1) % visible)
      setTimeout(() => setIsAnimating(false), 320)
    }, 3000)
    return () => clearInterval(id)
  }, [stores, isAnimating])

  // Theme per request - now using CSS custom properties
  const pageBg = 'hsl(var(--background))'
  const topBorder = 'hsl(var(--accent))'

  const loadData = async () => {
    const qs = new URLSearchParams()
    if (search) qs.set('search', search)
    if (category && category !== 'all') {
      qs.set('platform', category)
    }
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
  }, [search, category, sortBy])

  const loadMoreNewest = async () => {
    if (isLoadingNewest || !newestHasMore) return

    setIsLoadingNewest(true)
    const nextPage = newestPage + 1
    const qs = new URLSearchParams()
    if (search) qs.set('search', search)
    if (category && category !== 'all') qs.set('category', category)
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
      <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
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
    <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
      {/* Hero Section */}
      <Hero />

      <div className="border-t border-accent" />

      <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-4">
        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setCategory('all')}
                className={`flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                  category === 'all'
                    ? 'bg-secondary text-foreground border-white/20'
                    : 'bg-secondary text-foreground/60 hover:text-foreground/80 border-white/20'
                }`}
              >
                {category === 'all' && <Check className="w-4 h-4" />}
                All
              </button>
              <button
                onClick={() => setCategory('n8n')}
                className={`flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                  category === 'n8n'
                    ? 'bg-secondary text-foreground border-white/20'
                    : 'bg-secondary text-foreground/60 hover:text-foreground/80  border-white/20'
                }`}
              >
                {category === 'n8n' && <Check className="w-4 h-4" />}
                n8n
              </button>
              <button
                onClick={() => setCategory('zapier')}
                className={`flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                  category === 'zapier'
                    ? 'bg-secondary text-foreground border-white/20'
                    : 'bg-secondary text-foreground/60 hover:text-foreground/80  border-white/20'
                }`}
              >
                {category === 'zapier' && <Check className="w-4 h-4" />}
                Zapier
              </button>
              <button
                onClick={() => setCategory('make')}
                className={`flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                  category === 'make'
                    ? 'bg-secondary text-foreground border-white/20'
                    : 'bg-secondary text-foreground/60 hover:text-foreground/80  border-white/20'
                }`}
              >
                {category === 'make' && <Check className="w-4 h-4" />}
                Make
              </button>
              <button
                onClick={() => setCategory('airtable_script')}
                className={`flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                  category === 'airtable_script'
                    ? 'bg-secondary text-foreground border-white/20'
                    : 'bg-secondary text-foreground/60 hover:text-foreground/80  border-white/20'
                }`}
              >
                {category === 'airtable_script' && <Check className="w-4 h-4" />}
                Airtable
              </button>
            </div>
          </div>
        </div>

        {/* Featured Stores slider (max 5) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-foreground font-space-grotesk text-2xl font-bold">Featured Stores</h2>
          </div>

          <div className="relative">
            <div className="relative bg-card border border-border rounded-xl overflow-hidden h-80 md:h-96 group shadow-lg">
              {/* Slides track */}
              <div
                className="absolute inset-0 flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeStore * 100}%)` }}
              >
                {stores.slice(0, 5).map((s) => (
                  <Link key={s.slug} href={`/store/${s.slug}`} className="min-w-full h-full block relative">
                    {/* Background image */}
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.02]">
                      <AutoThumbnail
                        workflow={{
                          id: s.userId,
                          title: s.storeName,
                          shortDesc: s.bio || s.user.displayName,
                          longDescMd: '',
                          categories: [],
                          tags: [],
                        }}
                        size="lg"
                        className="absolute inset-0 w-full h-full"
                        authorAvatarUrl={s.user.avatarUrl || undefined}
                      />
                    </div>
                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Text overlay */}
                    <div className="relative z-10 p-6 text-background h-full flex flex-col justify-end">
                      <div className="font-space-grotesk text-xl md:text-3xl font-bold mb-2">{s.storeName}</div>
                      <div className="text-sm md:text-lg opacity-90 mb-2">{s.bio || 'Short Description'}</div>
                      <div className="text-xs md:text-sm opacity-80 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                        {s.workflowsCount} workflows
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Arrows on-card, opposite sides */}
              <button
                aria-label="Previous store"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/30 text-background hover:bg-foreground/70 transition-colors cursor-pointer backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5 mx-auto" />
              </button>
              <button
                aria-label="Next store"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/30 text-background hover:bg-foreground/70 transition-colors cursor-pointer backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5 mx-auto" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {stores.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to store ${idx + 1}`}
                  onClick={() => setActiveStore(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeStore === idx ? 'w-12 bg-white' : 'w-8 bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Mobile prev/next overlay */}
            <div className="md:hidden absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
              <button
                aria-label="Previous store"
                onClick={goPrev}
                className="w-10 h-10 rounded-full bg-black/40 text-foreground hover:bg-black/60 backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5 mx-auto" />
              </button>
              <button
                aria-label="Next store"
                onClick={goNext}
                className="w-10 h-10 rounded-full bg-black/40 text-foreground hover:bg-black/60 backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>

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
    </div>
  )
}
