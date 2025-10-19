'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WorkflowCard } from '@/components/ui/workflow-card'
import { useAuth } from '@/hooks/useAuth'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

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
        {/* Decorative ellipses for ambient lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Bottom ellipses */}
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

        {/* Content with higher z-index */}
        <div className="relative z-10">
          {/* Hero Section - Always displayed */}
          <section className="relative overflow-visible pt-[140px] md:pt-[170px] pb-32 bg-[#08080A]">
            {/* Small decorative ellipses */}
            <div
              className="absolute rounded-full"
              style={{
                right: '-200px',
                top: '600px',
                width: '300px',
                height: '300px',
                backgroundColor: '#7899A8',
                opacity: 0.3,
                filter: 'blur(150px)',
                zIndex: 1,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: '-150px',
                top: '0px',
                width: '350px',
                height: '350px',
                backgroundColor: '#7899A8',
                opacity: 0.3,
                filter: 'blur(150px)',
                zIndex: 1,
              }}
            />

            {/* Network Nodes Pattern - Left Side */}
            <svg
              className="absolute left-0 top-0 h-full pointer-events-none"
              style={{ zIndex: 1, width: '150px' }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="nodeGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#7899A8', stopOpacity: 0.5 }} />
                  <stop offset="100%" style={{ stopColor: '#40424D', stopOpacity: 0.3 }} />
                </linearGradient>
              </defs>

              {/* Lines connecting nodes - Left */}
              <line x1="20" y1="15%" x2="80" y2="25%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="80" y1="25%" x2="60" y2="40%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="60" y1="40%" x2="100" y2="55%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="60" y1="40%" x2="40" y2="60%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="100" y1="55%" x2="80" y2="75%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />

              {/* Nodes (circles) - Left */}
              <circle cx="20" cy="15%" r="3" fill="url(#nodeGradientLeft)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="25%" r="3.5" fill="url(#nodeGradientLeft)">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="60" cy="40%" r="3" fill="url(#nodeGradientLeft)">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="55%" r="4" fill="url(#nodeGradientLeft)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="40" cy="60%" r="3" fill="url(#nodeGradientLeft)">
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="75%" r="3.5" fill="url(#nodeGradientLeft)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.4s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Network Nodes Pattern - Right Side */}
            <svg
              className="absolute right-0 top-0 h-full pointer-events-none"
              style={{ zIndex: 1, width: '150px' }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="nodeGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#7899A8', stopOpacity: 0.5 }} />
                  <stop offset="100%" style={{ stopColor: '#40424D', stopOpacity: 0.3 }} />
                </linearGradient>
              </defs>

              {/* Lines connecting nodes - Right */}
              <line x1="130" y1="20%" x2="70" y2="30%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="70" y1="30%" x2="90" y2="45%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="90" y1="45%" x2="50" y2="50%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="90" y1="45%" x2="110" y2="65%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />
              <line x1="50" y1="50%" x2="70" y2="70%" stroke="#7899A8" strokeWidth="1" opacity="0.25" />

              {/* Nodes (circles) - Right */}
              <circle cx="130" cy="20%" r="3" fill="url(#nodeGradientRight)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.7s" repeatCount="indefinite" />
              </circle>
              <circle cx="70" cy="30%" r="3.5" fill="url(#nodeGradientRight)">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="3.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="90" cy="45%" r="4" fill="url(#nodeGradientRight)">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.9s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="50%" r="3" fill="url(#nodeGradientRight)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="110" cy="65%" r="3.5" fill="url(#nodeGradientRight)">
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="70" cy="70%" r="3" fill="url(#nodeGradientRight)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.1s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Background Image */}
            <div className="absolute z-0 top-[350px] left-0 right-0 w-full pointer-events-none">
              <img
                src="/images/hero/hero-bg.png"
                alt="FlowMarket Hero Background"
                className="w-full h-auto object-contain opacity-50"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Text Content */}
                <div className="text-white">
                  <p className="font-aeonikpro text-[#BCBFCC] text-[16px] md:text-[18px] mb-4">
                    Welcome to the workflows marketplace — neaply
                  </p>

                  {/* Main Heading */}
                  <h1 className="font-aeonikpro text-3xl md:text-4xl lg:text-5xl xl:text-[64px] text-[#EDEFF7] leading-tight lg:leading-[1.2] tracking-tight mb-6">
                    Automate your world,
                    <br />
                    Elevate your workforce.
                  </h1>

                  {/* Subheading */}
                  <p className="font-aeonikpro text-[18px] md:text-[20px] text-[#D3D6E0] mb-8 max-w-xl leading-relaxed">
                    We envision a world where automation and innovation converge seamlessly, empowering individuals and
                    businesses to transcend manual constraints and unlock their true potential.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Button
                      onClick={() => router.push('/register')}
                      className="font-aeonikpro bg-white text-black py-6 px-6 text-lg rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      Get started — it&apos;s free
                    </Button>

                    <button
                      onClick={() => router.push('/become-seller')}
                      className="relative font-aeonikpro bg-transparent text-white py-3 px-6 text-lg transition-all duration-300 cursor-pointer group"
                    >
                      Upload workflow
                      <span className="absolute left-0 bottom-1 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </button>
                  </div>
                </div>

                {/* Right Column - Workflow Preview Card */}
                <div className="relative hidden lg:block">
                  {/* Main workflow card */}
                  <div className="relative z-10">
                    <img src="/images/hero/hero-workflow.png" alt="Workflow Example" className="object-contain" />
                  </div>
                </div>
              </div>

              {/* Explore by platforms section */}
              <div className="mt-20 mb-12">
                <h2 className="font-aeonikpro text-white text-2xl font-medium mb-8 text-left">Explore by platforms</h2>

                <div className="flex flex-wrap justify-center gap-6">
                  {/* n8n Card */}
                  <div
                    onClick={() => router.push('/search?platform=n8n')}
                    className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="relative w-12 h-12">
                      <img
                        src="/images/hero/n8n-grey.png"
                        alt="n8n"
                        className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <img
                        src="/images/hero/n8n-color.png"
                        alt="n8n"
                        className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      />
                    </div>
                    <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                      n8n
                    </span>
                  </div>

                  {/* Zapier Card */}
                  <div
                    onClick={() => router.push('/search?platform=zapier')}
                    className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="relative w-12 h-12">
                      <img
                        src="/images/hero/zapier-grey.png"
                        alt="Zapier"
                        className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <img
                        src="/images/hero/zapier-color.png"
                        alt="Zapier"
                        className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      />
                    </div>
                    <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                      Zapier
                    </span>
                  </div>

                  {/* Make Card */}
                  <div
                    onClick={() => router.push('/search?platform=make')}
                    className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="relative w-12 h-12">
                      <img
                        src="/images/hero/make-grey.png"
                        alt="Make"
                        className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <img
                        src="/images/hero/make-color.png"
                        alt="Make"
                        className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      />
                    </div>
                    <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                      Make
                    </span>
                  </div>

                  {/* Airtable Card */}
                  <div
                    onClick={() => router.push('/search?platform=airtable_script')}
                    className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="relative w-12 h-12">
                      <img
                        src="/images/hero/airtable-grey.png"
                        alt="Airtable"
                        className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <img
                        src="/images/hero/airtable-color.png"
                        alt="Airtable"
                        className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      />
                    </div>
                    <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                      Airtable
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
                    {/* Black gradient fade on the right */}
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#08080A] to-transparent pointer-events-none z-20" />

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
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all cursor-pointer z-30 flex items-center justify-center"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}
                    <button
                      aria-label="Next store"
                      onClick={goNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all cursor-pointer z-30 flex items-center justify-center"
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
                      {/* Black gradient fade on the right */}
                      <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#08080A] to-transparent pointer-events-none z-20" />

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
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all cursor-pointer z-30 flex items-center justify-center"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      )}
                      <button
                        aria-label="Next workflow"
                        onClick={goNextTrending}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all cursor-pointer z-30 flex items-center justify-center"
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
                      <WorkflowCard
                        key={wf.id}
                        id={wf.id}
                        title={wf.title}
                        description={wf.description}
                        price={wf.price}
                        currency="USD"
                        platform={wf.platform}
                        rating={wf.rating}
                        salesCount={wf.salesCount}
                        isFake={wf.isFake}
                      />
                    ))}
                    {/* Loading skeleton for new workflows */}
                    {isLoadingNewest &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={`loading-${i}`} className="group h-[420px]">
                          <div
                            className="border border-[#2a2a2a] rounded-xl overflow-hidden h-full flex flex-col bg-[#0a0a0a] animate-pulse"
                          >
                            <div
                              className="h-48 p-3"
                              style={{ backgroundColor: '#1a1a1a' }}
                            >
                              <div
                                className="h-full rounded-lg animate-pulse"
                                style={{ backgroundColor: '#2a2a2a' }}
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
