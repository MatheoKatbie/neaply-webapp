'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CartIcon } from '@/components/ui/cart-icon'
import { Trans } from '@/components/ui/Trans'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { Heart, Search, User, ArrowRight, Command } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const { t } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  const isHomepage = pathname === '/'
  const isMarketplacePage = pathname === '/' || pathname === '/marketplace'
  const [isScrolled, setIsScrolled] = useState(false)

  // Debug effect for search focus
  useEffect(() => {
    console.log('isSearchFocused changed to:', isSearchFocused)
  }, [isSearchFocused])

  // Example search suggestions
  const searchSuggestions = [
    { text: 'Search "automation" in Neaply', query: 'automation' },
    { text: 'Search "email workflows" in Neaply', query: 'email workflows' },
    { text: 'Search "data processing" in Neaply', query: 'data processing' },
    { text: 'Search "API integration" in Neaply', query: 'API integration' },
  ]

  useEffect(() => {
    let ticking = false
    let lastScrollY = 0

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          // Use a higher threshold and add hysteresis to prevent glitching
          const scrolled = currentScrollY > 50

          // Only update state if there's a meaningful change
          if (Math.abs(currentScrollY - lastScrollY) > 5) {
            setIsScrolled(scrolled)
            lastScrollY = currentScrollY
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch seller profile to get store slug
  useEffect(() => {
    const fetchStoreSlug = async () => {
      if (user && user.isSeller) {
        try {
          const response = await fetch(`/api/seller-profile/${user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              setStoreSlug(data.data.slug)
            }
          }
        } catch (error) {
          console.error('Failed to fetch store slug:', error)
        }
      }
    }

    fetchStoreSlug()
  }, [user])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
    setIsDropdownOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchFocused(false)
    }
  }

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query)
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsSearchFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key to search
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setIsSearchFocused(false)
      }
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      // Escape to close search dropdown
      if (e.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false)
        searchRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchFocused])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      // Close search dropdown when clicking outside
      if (
        isSearchFocused &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchFocused])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <nav className="sticky top-0 left-0 z-50 w-full bg-card border-b border-accent">
      <div className="w-full px-4 lg:px-6">
        <div className="relative flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/neaply_logo.png" alt="Neaply Logo" width={28} height={28} />
            </Link>
          </div>

          {/* Mobile Search Bar - Centered - Only show on marketplace pages */}
          {isMarketplacePage && (
            <div className="lg:hidden flex-1 max-w-sm mx-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search in Neaply"
                    className="pl-10 pr-3 h-9 bg-secondary border-transparent text-foreground font-space-grotesk placeholder:text-foreground/60 focus:ring-2 focus:ring-white/20 text-sm"
                  />
                </div>

                {/* Mobile Search Dropdown */}
                {isSearchFocused && (
                  <div
                    ref={searchDropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-white/10 rounded-lg shadow-lg z-[9999]"
                  >
                    <div className="p-3 border-b border-white/10">
                      <div className="flex items-center justify-between text-foreground/60 text-xs">
                        <span>Press Enter to search</span>
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="text-foreground/40 text-xs px-2 py-1 mb-2">Try searching for:</div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          tabIndex={-1}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          className="w-full text-left px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-white/10 rounded-md text-sm transition-colors duration-200 flex items-center justify-between group"
                        >
                          <span>{suggestion.text}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Animated search (md+) moves from centered below to right of logo - Only show on marketplace pages */}
          {isMarketplacePage && (
            <div
              className={`hidden lg:block absolute transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform transform-gpu ${
                isHomepage && !isScrolled
                  ? 'left-1/2 top-full mt-3 w-[48rem] max-w-3xl -translate-x-1/2 translate-y-0 scale-100 opacity-100'
                  : 'left-[44px] top-1/2 w-96 translate-x-0 -translate-y-1/2 scale-100 opacity-100'
              }`}
              style={{
                transformOrigin: isHomepage && !isScrolled ? 'center top' : 'left center',
                backfaceVisibility: 'hidden',
                perspective: '1000px',
                containIntrinsicSize: '48rem 3rem',
                contentVisibility: 'auto',
              }}
            >
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 w-4 h-4 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]" />
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      console.log('DESKTOP FOCUS DETECTED! Setting isSearchFocused to true')
                      setIsSearchFocused(true)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search in Neaply"
                    className={`pl-10 pr-20 bg-secondary border-transparent text-foreground font-space-grotesk placeholder:text-foreground/60 focus:ring-2 focus:ring-white/20 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isHomepage && !isScrolled ? 'h-12 text-base' : 'h-10 text-sm'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-foreground/40 text-xs transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Search Dropdown - Completely outside transformed container - Only show on marketplace pages */}
          {/* DEBUG: isSearchFocused = {isSearchFocused ? 'true' : 'false'} */}
          {isMarketplacePage && isSearchFocused && (
            <div
              ref={searchDropdownRef}
              className="hidden lg:block absolute bg-secondary border border-white/10 rounded-lg shadow-lg z-[9999]"
              style={{
                backgroundColor: 'red !important',
                border: '2px solid yellow !important',
                minHeight: '200px',
                minWidth: '400px',
                top: isHomepage && !isScrolled ? '120px' : '50px',
                left: isHomepage && !isScrolled ? '50%' : '44px',
                transform: isHomepage && !isScrolled ? 'translateX(-50%)' : 'none',
              }}
            >
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center justify-between text-foreground/60 text-xs">
                  <span>Press Enter to search</span>
                  <div className="flex items-center gap-1">
                    <span>⌘K</span>
                    <span>to focus</span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <div className="text-foreground/40 text-xs px-2 py-1 mb-2">Try searching for:</div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className="w-full text-left px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-white/10 rounded-md text-sm transition-colors duration-200 flex items-center justify-between group cursor-pointer"
                  >
                    <span>{suggestion.text}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10 font-space-grotesk">
            <div className="flex items-baseline space-x-6">
              <Link
                href="/"
                className="text-foreground/90 hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                <Trans i18nKey="navigation.marketplace" />
              </Link>
              <Link
                href="/how-it-works"
                className="text-foreground/90 hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                How It Works
              </Link>
              {user && user.isSeller && (
                <Link
                  href={`/store/${storeSlug || user.id}`}
                  className="text-foreground/90 hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-white/10"
                >
                  <Trans i18nKey="navigation.yourStore" />
                </Link>
              )}
              {user && user.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-foreground/90 hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-white/10"
                >
                  Admin Dashboard
                </Link>
              )}
              {user && (
                <Link
                  href="/favorites"
                  className="text-foreground/90 hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-white/10 flex items-center gap-1"
                >
                  <Trans i18nKey="navigation.favorites" />
                </Link>
              )}
              {user && <CartIcon className="text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-full" />}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-20 bg-muted rounded-full animate-pulse"></div>
                <div className="h-10 w-32 bg-muted rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              // Logged in user
              <div className="flex items-center space-x-3">
                {!user.isSeller && (
                  <button
                    className="font-space-grotesk inline-flex items-center justify-center h-10 px-5 bg-secondary hover:bg-white/10  rounded-full text-sm font-medium transition-all duration-300 cursor-pointer text-foreground"
                    onClick={() => router.push('/become-seller')}
                  >
                    <Trans i18nKey="navigation.becomeCreator" />
                  </button>
                )}
                {user.isSeller && (
                  <button
                    className="font-space-grotesk inline-flex items-center justify-center h-10 px-5 bg-secondary hover:bg-white/10 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer text-foreground"
                    onClick={() => router.push('/dashboard/seller')}
                  >
                    <Trans i18nKey="navigation.creatorDashboard" />
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.displayName} className="object-cover" />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-popover rounded-lg shadow-lg border border-border z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar_url || undefined}
                              alt={user.displayName}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                              {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-popover-foreground truncate">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/orders')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
                        >
                          <Trans i18nKey="navigation.ordersHistory" />
                        </button>
                        <button
                          onClick={() => {
                            router.push('/help')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
                        >
                          <Trans i18nKey="navigation.helpSupport" />
                        </button>
                        <button
                          onClick={() => {
                            router.push('/settings')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
                        >
                          <Trans i18nKey="navigation.settings" />
                        </button>
                        <div className="border-t border-border my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 cursor-pointer"
                        >
                          <Trans i18nKey="navigation.logout" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Not logged in
              <div className="flex items-center space-x-3">
                <button
                  className="font-space-grotesk inline-flex items-center justify-center h-10 px-5 bg-transparent border border-white/30 text-foreground rounded-full text-sm font-medium transition-all duration-300 hover:bg-white/10 cursor-pointer"
                  onClick={() => router.push('/auth/register')}
                >
                  Sign-up
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Login"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2 rounded-full transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Smooth spacer to prevent background glitch during animation */}
        <div
          className={`transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isHomepage ? (isScrolled ? 'lg:h-0 lg:opacity-0' : 'lg:h-20 lg:opacity-100') : 'lg:h-0 lg:opacity-0'
          } h-0 opacity-0`}
        />

        {/* Mobile Menu with Animation */}
        <div
          ref={menuRef}
          className={`lg:hidden fixed inset-0 z-40 bg-primary/30 backdrop-blur-sm transition-opacity duration-300 min-h-screen ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className={`fixed top-0 right-0 w-80 h-full bg-background backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ height: '100vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <div className="flex items-center gap-2">
                <Image src="/images/neaply_logo.png" alt="Neaply Logo" width={24} height={24} />
                <span className="font-space-grotesk text-lg font-bold text-foreground">Neaply</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="p-6 space-y-6 bg-background">
              {/* Theme Toggle for Mobile */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  <Trans i18nKey="navigation.darkMode" />
                </span>
              </div>
              {/* Navigation Links */}
              <div className="space-y-1 font-space-grotesk">
                <Link
                  href="/"
                  className="block text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Trans i18nKey="navigation.marketplace" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="block text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
                {user && user.isSeller && (
                  <Link
                    href={`/store/${storeSlug || user.id}`}
                    className="block text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Trans i18nKey="navigation.yourStore" />
                  </Link>
                )}
                {user && user.isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="block text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user && (
                  <Link
                    href="/favorites"
                    className="flex items-center gap-2 text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <Trans i18nKey="navigation.favorites" />
                  </Link>
                )}
                {user && (
                  <div
                    className="flex items-center gap-2 text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CartIcon className="p-0" />
                    <span>Cart</span>
                  </div>
                )}
              </div>

              {/* User Actions */}
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-12 w-full bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-12 w-full bg-muted rounded-lg animate-pulse"></div>
                  </div>
                ) : user ? (
                  // Logged in user - mobile
                  <div className="space-y-3">
                    {!user.isSeller && (
                      <button
                        className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-800"
                        onClick={() => {
                          router.push('/become-seller')
                          setIsMenuOpen(false)
                        }}
                      >
                        <Trans i18nKey="navigation.becomeCreator" />
                      </button>
                    )}
                    {user.isSeller && (
                      <button
                        className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-800"
                        onClick={() => {
                          router.push('/dashboard/seller')
                          setIsMenuOpen(false)
                        }}
                      >
                        <Trans i18nKey="navigation.creatorDashboard" />
                      </button>
                    )}

                    {/* Mobile menu items without borders */}
                    <button
                      onClick={() => {
                        router.push('/orders')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-muted-foreground hover:text-foreground py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      <Trans i18nKey="navigation.ordersHistory" />
                    </button>
                    <button
                      onClick={() => {
                        router.push('/help')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-muted-foreground hover:text-foreground py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      <Trans i18nKey="navigation.helpSupport" />
                    </button>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-muted-foreground hover:text-foreground py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      <Trans i18nKey="navigation.settings" />
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-destructive hover:text-destructive py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      <Trans i18nKey="navigation.logout" />
                    </button>
                  </div>
                ) : (
                  // Not logged in - mobile
                  <div className="space-y-3">
                    <button
                      className="w-full bg-transparent text-foreground py-3 px-4 rounded-lg text-sm font-space-grotesk font-medium transition-all duration-300 hover:bg-accent"
                      onClick={() => {
                        router.push('/login')
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign-up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
