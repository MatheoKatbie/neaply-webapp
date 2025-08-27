'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'

interface StoreCard {
  userId: string
  storeName: string
  slug: string
  bio: string | null
  user: { displayName: string; avatarUrl: string | null }
  workflowsCount: number
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price-low' | 'price-high'>('popular')
  const [trendingWorkflows, setTrendingWorkflows] = useState<any[]>([])
  const [newestWorkflows, setNewestWorkflows] = useState<any[]>([])
  const [packs, setPacks] = useState<any[]>([])
  const [stores, setStores] = useState<StoreCard[]>([])
  const [activeStore, setActiveStore] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load more states
  const [newestPage, setNewestPage] = useState(1)
  const [newestHasMore, setNewestHasMore] = useState(true)
  const [isLoadingNewest, setIsLoadingNewest] = useState(false)

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
    if (category && category !== 'all') qs.set('category', category)
    if (sortBy) qs.set('sortBy', sortBy)

    try {
      const [wfTrendingRes, wfNewestRes, packRes, storeRes] = await Promise.allSettled([
        fetch(`/api/marketplace/workflows?limit=8&sortBy=popular&${qs.toString()}`),
        fetch(`/api/marketplace/workflows?limit=8&sortBy=newest&${qs.toString()}`),
        fetch(`/api/packs?limit=6&status=published&${qs.toString()}`),
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

      // Handle packs
      if (packRes.status === 'fulfilled' && packRes.value.ok) {
        const packJson = await packRes.value.json()
        setPacks(packJson.packs || [])
      } else {
        console.warn('Failed to load packs:', packRes.status === 'rejected' ? packRes.reason : 'API error')
        setPacks([])
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
      setPacks([])
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Stores Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-card rounded-lg mb-3 animate-pulse" />
            <div className="h-64 md:h-72 bg-card rounded-xl animate-pulse" />
          </div>

          {/* Trending Workflows Skeleton */}
          <section className="mb-8">
            <div className="h-8 bg-card rounded-lg mb-3 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-44 md:h-56 bg-card rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </section>

          {/* Newest Workflows Skeleton */}
          <section className="mb-8">
            <div className="h-8 bg-card rounded-lg mb-3 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-44 md:h-56 bg-card rounded-xl animate-pulse" />
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
      <div className="border-t border-accent" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Top filters row removed per request */}

        {/* Featured Stores slider (max 5) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-space-grotesk text-2xl">Featured Stores</h2>
          </div>

          <div className="relative">
            <div className="relative bg-card border border-border rounded-xl overflow-hidden h-64 md:h-72 group">
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
                      />
                    </div>
                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    {/* Text overlay */}
                    <div className="relative z-10 p-5 text-white h-full flex flex-col justify-end">
                      <div className="font-space-grotesk text-lg md:text-2xl">{s.storeName}</div>
                      <div className="text-sm md:text-base opacity-90">{s.bio || 'Short Description'}</div>
                      <div className="text-xs md:text-sm opacity-80 mt-1">{s.workflowsCount} workflows</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Arrows on-card, opposite sides */}
              <button
                aria-label="Previous store"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 text-white hover:bg-black/50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 mx-auto" />
              </button>
              <button
                aria-label="Next store"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 text-white hover:bg-black/50 transition-colors cursor-pointer"
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
                  className={`h-1.5 rounded-full transition-all ${
                    activeStore === idx ? 'w-10 bg-white' : 'w-6 bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Mobile prev/next overlay */}
            <div className="md:hidden absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
              <button
                aria-label="Previous store"
                onClick={goPrev}
                className="w-8 h-8 rounded-full bg-black/30 text-white hover:bg-black/40"
              >
                <ChevronLeft className="w-4 h-4 mx-auto" />
              </button>
              <button
                aria-label="Next store"
                onClick={goNext}
                className="w-8 h-8 rounded-full bg-black/30 text-white hover:bg-black/40"
              >
                <ChevronRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Trending Workflows */}
        <section className="mb-8">
          <h3 className="text-white font-space-grotesk mb-3 text-2xl">Trending workflows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingWorkflows.map((wf) => (
              <div key={wf.id} className="space-y-2">
                <a
                  href={`/workflow/${wf.id}`}
                  className="group relative rounded-xl overflow-hidden h-44 md:h-56 bg-card border border-border block"
                >
                  {/* Background image */}
                  {wf.heroImage ? (
                    <img
                      src={wf.heroImage}
                      alt={wf.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <AutoThumbnail
                        workflow={{
                          id: wf.id,
                          title: wf.title,
                          shortDesc: wf.description,
                          longDescMd: '',
                          categories: wf.categories || [],
                          tags: wf.tags || [],
                        }}
                        size="lg"
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}

                  {/* Rating - top left */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                      <svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-xs font-medium text-white">({wf.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                  </div>

                  {/* Price - top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                      <span className="text-xs font-space-grotesk font-bold text-green-400">
                        {wf.price === 0
                          ? 'Free'
                          : new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(wf.price / 100)}
                      </span>
                    </div>
                  </div>

                  {/* Hover darken overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  {/* Title overlay */}
                  <div className="relative z-10 p-4 text-white h-full flex flex-col justify-end transition-transform duration-300 group-hover:-translate-y-12">
                    <div className="font-space-grotesk text-base md:text-lg line-clamp-1">{wf.title}</div>
                    <div className="text-sm text-white/80 line-clamp-2 mt-1">{wf.description}</div>
                  </div>
                  {/* Hover CTA slides from bottom */}
                  <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center transition-all duration-300 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="px-4 py-2 rounded-full bg-white text-background font-medium">See Details</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Newest Workflows */}
        <section className="mb-8">
          <h3 className="text-white font-space-grotesk mb-3 text-2xl">Newest</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {newestWorkflows.map((wf) => (
              <div key={wf.id} className="space-y-2">
                <a
                  href={`/workflow/${wf.id}`}
                  className="group relative rounded-xl overflow-hidden h-44 md:h-56 bg-card border border-border block"
                >
                  {wf.heroImage ? (
                    <img
                      src={wf.heroImage}
                      alt={wf.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <AutoThumbnail
                        workflow={{
                          id: wf.id,
                          title: wf.title,
                          shortDesc: wf.description,
                          longDescMd: '',
                          categories: wf.categories || [],
                          tags: wf.tags || [],
                        }}
                        size="lg"
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}

                  {/* Rating - top left */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                      <svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-xs font-medium text-white">({wf.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                  </div>

                  {/* Price - top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                      <span className="text-xs font-space-grotesk font-bold text-green-400">
                        {wf.price === 0
                          ? 'Free'
                          : new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(wf.price / 100)}
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="relative z-10 p-4 text-white h-full flex flex-col justify-end transition-transform duration-300 group-hover:-translate-y-12">
                    <div className="font-space-grotesk text-base md:text-lg line-clamp-1">{wf.title}</div>
                    <div className="text-sm text-white/80 line-clamp-2 mt-1">{wf.description}</div>
                  </div>
                  <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center transition-all duration-300 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="px-4 py-2 rounded-full bg-white text-background font-medium">See Details</span>
                  </div>
                </a>
              </div>
            ))}
            {/* Loading skeleton for new workflows */}
            {isLoadingNewest &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`loading-${i}`} className="space-y-2">
                  <div className="h-44 md:h-56 bg-card rounded-xl animate-pulse" />
                </div>
              ))}
          </div>
          {newestHasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMoreNewest}
                disabled={isLoadingNewest}
                className="bg-secondary hover:bg-white/10 text-white rounded-full disabled:opacity-50"
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
