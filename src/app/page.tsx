'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { AutoThumbnail } from '@/components/ui/auto-thumbnail'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  // Trending workflows slider state
  const [activeTrendingWorkflow, setActiveTrendingWorkflow] = useState(0)
  const [isTrendingAnimating, setIsTrendingAnimating] = useState(false)

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

  // Trending workflows navigation functions
  const goToTrending = (idx: number) => {
    const displayWorkflows = fillWorkflows(trendingWorkflows, 10)
    if (displayWorkflows.length === 0) return
    if (isTrendingAnimating) return
    setIsTrendingAnimating(true)
    setActiveTrendingWorkflow(idx)

    // Scroll to the specific workflow card
    const container = document.querySelector('.trending-workflow-cards-container')
    if (container) {
      const cardWidth = 320 + 16 // card width + gap
      container.scrollTo({
        left: idx * cardWidth,
        behavior: 'smooth',
      })
    }

    setTimeout(() => setIsTrendingAnimating(false), 320)
  }

  const goPrevTrending = () => {
    const displayWorkflows = fillWorkflows(trendingWorkflows, 10)
    const newIndex = (activeTrendingWorkflow - 1 + displayWorkflows.length) % displayWorkflows.length
    goToTrending(newIndex)
  }

  const goNextTrending = () => {
    const displayWorkflows = fillWorkflows(trendingWorkflows, 10)
    const newIndex = (activeTrendingWorkflow + 1) % displayWorkflows.length
    goToTrending(newIndex)
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

  return (
    <>
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
        {/* Decorative Ellipses */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left Ellipse */}
          <div
            className="absolute -left-80 top-1/3 w-[639px] h-[639px] rounded-full blur-3xl"
            style={{
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(60px)',
              zIndex: 1,
            }}
          />
          {/* Right Ellipse */}
          <div
            className="absolute -right-80 top-2/3 w-[639px] h-[639px] rounded-full blur-3xl"
            style={{
              backgroundColor: '#7899A8',
              opacity: 0.35,
              filter: 'blur(60px)',
              zIndex: 1,
            }}
          />
        </div>

        {/* Content with higher z-index */}
        <div className="relative z-10">
          {/* Hero Section - Always displayed */}
          <Hero />

          {/* Loading state for the rest of the content */}
          {isLoading ? (
            <>
              {/* Featured Stores Skeleton */}
              <div className="mb-6 bg-[#08080A]">
                <div className="max-w-screen-2xl mx-auto px-3 md:px-4">
                  <div className="flex items-center justify-between my-4">
                    <div
                      className="h-8 w-48 rounded-lg animate-pulse"
                      style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}
                    />
                  </div>
                </div>
                <div
                  className="h-80 rounded-xl mx-4 animate-pulse"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}
                />
              </div>

              {/* Trending Workflows Skeleton */}
              <div className="mb-6 bg-[#08080A]">
                <div className="max-w-screen-2xl mx-auto px-3 md:px-4">
                  <div className="flex items-center justify-between my-4">
                    <div
                      className="h-8 w-56 rounded-lg animate-pulse"
                      style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}
                    />
                  </div>
                </div>
                <div
                  className="h-80 rounded-xl mx-4 animate-pulse"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}
                />
              </div>

              {/* Newest Workflows Skeleton */}
              <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-4">
                <div className="flex items-center justify-between mb-8">
                  <div
                    className="h-8 w-64 rounded-lg animate-pulse"
                    style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}
                  />
                  <div className="flex items-center gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 w-32 rounded animate-pulse"
                        style={{ backgroundColor: 'rgba(64, 66, 77, 0.3)' }}
                      />
                    ))}
                  </div>
                </div>
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
            </>
          ) : (
            <>
              {/* Featured Stores slider (max 5) - Full width */}
              <div className="mb-6">
                <div className="max-w-screen-2xl mx-auto px-3 md:px-4">
                  <div className="flex items-center justify-between py-6">
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
                          'from-[#1814FB] to-[#0E0C95]', // Blue like #1814FB
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
                            className={`relative w-80 h-64 rounded-2xl bg-gradient-to-br ${bgColor} dots-pattern p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-105 cursor-pointer group flex-shrink-0 border border-[#9DA2B3]/50`}
                          >
                            {/* Dark gradient overlay from bottom to top */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent rounded-2xl z-5" />

                            {/* Store logo/icon */}
                            <div className="relative z-10 flex items-start justify-between">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                {s.user.avatarUrl ? (
                                  <img
                                    src={s.user.avatarUrl}
                                    alt={s.storeName}
                                    className="w-8 h-8 rounded-xl object-cover"
                                  />
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
                              <p className="font-aeonikpro  text-[#BCBFCC] text-sm line-clamp-2">
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

                {/* Trending Workflows - Slider Layout */}
                <div className="mb-6">
                  <div className="max-w-screen-2xl mx-auto px-3 md:px-4">
                    <div className="flex items-center justify-between py-6">
                      <h2 className="text-[#EDEFF7] font-aeonikpro text-2xl">{getDisplayData().title}</h2>
                    </div>
                  </div>

                  <div className="relative">
                    {/* Container with gradient overlays for navigation */}
                    <div className="relative overflow-hidden">
                      {/* Calculate padding to align with text container */}
                      <div
                        className="trending-workflow-cards-container flex gap-4 py-6 overflow-x-auto scrollbar-hide"
                        style={{
                          paddingLeft: 'calc((100vw - min(100vw, 1536px)) / 2 + 0.75rem)',
                          paddingRight: '1.5rem',
                        }}
                      >
                        {getDisplayData().workflows.map((wf) => (
                          <div key={wf.id} className="group flex-shrink-0 w-72">
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
                              className="border border-[#9DA2B3]/25 rounded-xl overflow-hidden hover:border-[#9DA2B3]/50 transition-all duration-300 hover:scale-[1.02] h-[420px] flex flex-col"
                              style={{ backgroundColor: 'rgba(64, 66, 77, 0.5)' }}
                            >
                              {/* Header with custom thumbnail */}
                              <div className="relative h-48 p-3">
                                {(() => {
                                  // Define platform colors
                                  const platformColors = {
                                    zapier: 'bg-[#FF4A00]',
                                    n8n: 'bg-[#EA4B71]',
                                    make: 'bg-gradient-to-br from-[#6D00CC] to-[#F901FC]',
                                    airtable_script: 'bg-gradient-to-r from-blue-600 to-blue-800',
                                  }

                                  const bgColor =
                                    platformColors[wf.platform as keyof typeof platformColors] ||
                                    'bg-gradient-to-r from-secondary/20 to-accent/20'

                                  return (
                                    <div
                                      className={`relative w-full h-full rounded-lg ${bgColor} dots-pattern p-4 flex flex-col justify-between overflow-hidden group`}
                                    >
                                      {/* Platform logo - centered and larger */}
                                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                                        {(() => {
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

                                          const platformLogo = platformLogos[wf.platform as keyof typeof platformLogos]

                                          if (platformLogo) {
                                            return (
                                              <div className="relative w-16 h-16">
                                                <img
                                                  src={platformLogo.gray}
                                                  alt={wf.platform}
                                                  className="w-full h-full object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                                                />
                                                <img
                                                  src={platformLogo.color}
                                                  alt={wf.platform}
                                                  className="w-full h-full object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                />
                                              </div>
                                            )
                                          }
                                          return null
                                        })()}
                                      </div>

                                      {/* Sales count badge */}
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
                                        <span className="font-medium">{wf.salesCount || 0} sales</span>
                                      </div>

                                      {/* Dark gradient overlay from bottom to top */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-lg z-5" />
                                    </div>
                                  )
                                })()}
                              </div>

                              {/* Content section */}
                              <div className="px-4 py-1 flex-1 flex flex-col">
                                {/* Title */}
                                <h3 className="font-aeonikpro text-lg line-clamp-2 mb-2" style={{ color: '#EDEFF7' }}>
                                  {wf.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm line-clamp-2 flex-1 font-aeonikpro" style={{ color: '#9DA2B3' }}>
                                  {wf.description}
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
                                        {wf.price === 0
                                          ? 'Free'
                                          : new Intl.NumberFormat('en-US', {
                                              style: 'currency',
                                              currency: 'USD',
                                            }).format(wf.price / 100)}
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
                                          {wf.rating?.toFixed(1) || '0.0'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* Navigation arrows */}
                      {activeTrendingWorkflow > 0 && (
                        <button
                          aria-label="Previous workflow"
                          onClick={goPrevTrending}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors cursor-pointer z-30 flex items-center justify-center"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      )}
                      <button
                        aria-label="Next workflow"
                        onClick={goNextTrending}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors cursor-pointer z-30 flex items-center justify-center"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-screen-2xl mx-auto px-3 md:px-4 py-4 ">
                {/* Newest Workflows */}
                <section className="mb-6">
                  <div className="flex items-center justify-between py-6">
                    <h3 className="text-foreground font-aeonikpro text-2xl">Explore recently listed</h3>

                    {/* Filter dropdowns */}
                    <div className="flex items-center gap-4">
                      {/* Category filter */}
                      <Select>
                        <SelectTrigger className="w-[120px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="automation">Automation</SelectItem>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="productivity">Productivity</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Workflow type filter */}
                      <Select>
                        <SelectTrigger className="w-[140px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                          <SelectValue placeholder="Workflow type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="integration">Integration</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Price range filter */}
                      <Select>
                        <SelectTrigger className="w-[120px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                          <SelectValue placeholder="Price range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="under-50">Under $50</SelectItem>
                          <SelectItem value="50-100">$50 - $100</SelectItem>
                          <SelectItem value="over-100">Over $100</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Recently added filter */}
                      <Select>
                        <SelectTrigger className="w-[140px] bg-[#2A2D3A] border-[#404040] text-white font-aeonikpro">
                          <SelectValue placeholder="Recently added" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This week</SelectItem>
                          <SelectItem value="month">This month</SelectItem>
                          <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
                          className="border border-[#9DA2B3]/15 rounded-xl overflow-hidden hover:border-[#9DA2B3]/30 transition-all duration-300 hover:scale-[1.02] h-[420px] flex flex-col"
                          style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
                        >
                          {/* Header with custom thumbnail */}
                          <div className="relative h-48 p-3">
                            {(() => {
                              // Define platform colors
                              const platformColors = {
                                zapier: 'bg-[#FF4A00]',
                                n8n: 'bg-[#EA4B71]',
                                make: 'bg-gradient-to-br from-[#6D00CC] to-[#F901FC]',
                                airtable_script: 'bg-gradient-to-r from-blue-600 to-blue-800',
                              }

                              return (
                                <div className="relative w-full h-full rounded-lg bg-[#1E1E24] dots-pattern p-4 flex flex-col justify-between overflow-hidden group">
                                  {/* Platform logo - centered and larger */}
                                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    {(() => {
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

                                      const platformLogo = platformLogos[wf.platform as keyof typeof platformLogos]

                                      if (platformLogo) {
                                        return (
                                          <div className="relative w-16 h-16">
                                            <img
                                              src={platformLogo.color}
                                              alt={wf.platform}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        )
                                      }
                                      return null
                                    })()}
                                  </div>

                                  {/* Sales count badge */}
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
                                    <span className="font-medium">{wf.salesCount || 0} sales</span>
                                  </div>

                                  {/* Dark gradient overlay from bottom to top */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-lg z-5" />
                                </div>
                              )
                            })()}
                          </div>

                          {/* Content section */}
                          <div className="px-4 py-1 flex-1 flex flex-col">
                            {/* Title */}
                            <h3 className="font-aeonikpro text-lg line-clamp-2 mb-2" style={{ color: '#EDEFF7' }}>
                              {wf.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm line-clamp-2 flex-1 font-aeonikpro" style={{ color: '#9DA2B3' }}>
                              {wf.description}
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
                                    {wf.price === 0
                                      ? 'Free'
                                      : new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: 'USD',
                                        }).format(wf.price / 100)}
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
                                      {wf.rating?.toFixed(1) || '0.0'}
                                    </span>
                                  </div>
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
                        <div key={`loading-${i}`} className="group h-[420px]">
                          <div
                            className="border border-[#9DA2B3]/15 rounded-xl overflow-hidden shadow-lg h-full flex flex-col"
                            style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
                          >
                            <div
                              className="h-48 p-3 animate-pulse"
                              style={{ backgroundColor: 'rgba(30, 30, 36, 0.8)' }}
                            >
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
                  {/* Load More Button - Always visible */}
                  <div className="text-center mt-12">
                    <Button
                      onClick={loadMoreNewest}
                      disabled={isLoadingNewest || !newestHasMore}
                      className="group relative bg-white border border-gray-200 hover:border-gray-300 text-black rounded-full disabled:opacity-50 px-12 py-4 font-aeonikpro text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 disabled:hover:scale-100 disabled:hover:shadow-none "
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoadingNewest ? (
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
                        ) : newestHasMore ? (
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
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            All workflows loaded
                          </>
                        )}
                      </span>

                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>

                  {/* Community & Creator Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 mb-12">
                    {/* Join Community Card */}
                    <div className="relative bg-gradient-to-br from-[#0E1213] to-[#7899A8] rounded-2xl p-8 overflow-hidden">
                      {/* Dot pattern overlay */}
                      <div className="absolute inset-0 opacity-10 dots-pattern" />

                      <div className="relative z-10 text-center">
                        <div className="text-sm font-aeonikpro text-gray-300 uppercase -tracking-tight mb-4">
                          JOIN OUR COMMUNITY
                        </div>
                        <h3 className="text-3xl font-aeonikpro  text-white mb-4">
                          Join the workflow
                          <br />
                          marketplace for everyone
                        </h3>
                        <p className="text-[#D3D6E0] font-aeonikpro text-sm mb-6 leading-relaxed">
                          Connect with automation experts, share your workflows,
                          <br />
                          and discover new ways to optimize your processes
                        </p>
                        <button
                          className="bg-white/20 hover:bg-white/30 border border-white/20 hover:border-white/40 text-white font-aeonikpro px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 cursor-pointer"
                          onClick={() => router.push('auth/register')}
                        >
                          Join our community
                        </button>
                      </div>
                    </div>

                    {/* Start Selling Card */}
                    <div className="relative bg-[#40424D] rounded-2xl p-8 overflow-hidden border border-[#9DA2B3]/25">
                      {/* Dot pattern overlay */}
                      <div className="absolute inset-0 opacity-10 dots-pattern" />

                      <div className="relative z-10 text-center">
                        <div className="text-sm font-aeonikpro text-gray-300 uppercase -tracking-tight mb-4">
                          FOR WORKFLOW CREATORS
                        </div>
                        <h3 className="text-3xl font-aeonikpro  text-white mb-4">
                          Monetize & share your
                          <br />
                          workflows and automations
                        </h3>
                        <p className="text-[#D3D6E0] font-aeonikpro text-sm mb-6 leading-relaxed">
                          Turn your automation expertise into income by selling
                          <br />
                          your workflows to thousands of businesses worldwide
                        </p>
                        <button
                          className="bg-[#2F3C42] hover:bg-white/30 border border-white/20 hover:border-white/40 text-white font-aeonikpro px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 cursor-pointer"
                          onClick={() => router.push('/become-seller')}
                        >
                          Start selling workflows
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
