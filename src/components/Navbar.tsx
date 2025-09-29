'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShoppingCart } from 'lucide-react'
import { Trans } from '@/components/ui/Trans'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useTranslation } from '@/hooks/useTranslation'
import { Heart, Search, User, ArrowRight, Command } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import CartSlider from '@/components/CartSlider'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const { cart } = useCart()
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

  // Calculate cart items count
  const cartItemsCount = cart?.items.length || 0

  const handleCartClick = () => {
    setIsCartOpen(true)
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
    <>
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] font-aeonikpro w-full max-w-7xl mx-auto px-4">
        <div
          className="flex items-center px-6"
          style={{
            height: '59px',
            borderRadius: '20px',
            backgroundColor: 'rgba(30, 30, 36, 0.25)',
            border: '1px solid rgba(211, 214, 224, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo and Navigation */}
          <div className="flex items-center flex-1">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 bg-white rounded-xl py-2 px-2 cursor-pointer">
                <Image src="/images/neaply/logo-search.png" alt="Neaply Logo" width={20} height={20} />
              </Link>
            </div>

            {/* Search Bar - Right of logo */}
            <div className="hidden lg:flex ml-6 flex-1 max-w-md">
              <div className="relative w-full">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      ref={searchRef}
                      type="text"
                      placeholder="Search workflows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onKeyDown={handleKeyDown}
                      className="pl-10 pr-12 h-9 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20 focus:border-white/40 rounded-full"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/20 text-gray-300 rounded border border-white/30">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </form>

                {/* Search Dropdown */}
                {isSearchFocused && (
                  <div
                    ref={searchDropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-2 px-2">Quick searches</div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-3 h-3 text-gray-400" />
                            <span>{suggestion.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            {/* Navigation Links - Before auth buttons */}
            <div className="flex items-center space-x-8 font-aeonikpro">
              <Link
                href="/"
                className="relative font-medium transition-colors duration-200 group"
                style={{ color: '#EDEFF7' }}
              >
                Explore
              </Link>
              <Link
                href="/how-it-works"
                className="relative font-medium transition-colors duration-200 group"
                style={{ color: '#EDEFF7' }}
              >
                How it works
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-20 rounded-full animate-pulse" style={{ backgroundColor: '#40424D' }}></div>
                <div className="h-10 w-32 rounded-full animate-pulse" style={{ backgroundColor: '#D3D6E0' }}></div>
              </div>
            ) : user ? (
              // Logged in user
              <div className="flex items-center space-x-3">
                {user && (
                  <button
                    onClick={handleCartClick}
                    className="relative p-2 transition-colors duration-200 cursor-pointer"
                    style={{ color: '#EDEFF7' }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  className="font-aeonikpro inline-flex items-center justify-center h-10 px-6 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer text-black"
                  style={{ backgroundColor: '#D3D6E0' }}
                  onClick={() => router.push('/dashboard/seller')}
                >
                  Get started
                </button>

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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar_url || undefined}
                              alt={user.displayName}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                              {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black truncate">{user.displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/orders')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors duration-200 cursor-pointer"
                        >
                          Orders History
                        </button>
                        <button
                          onClick={() => {
                            router.push('/help')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors duration-200 cursor-pointer"
                        >
                          Help & Support
                        </button>
                        <button
                          onClick={() => {
                            router.push('/settings')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors duration-200 cursor-pointer"
                        >
                          Settings
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                        >
                          Logout
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
                  className="font-aeonikpro inline-flex items-center justify-center h-10 px-6 rounded-full text-sm text-white cursor-pointer bg-[#40424D]/25 hover:bg-[#40424D]/75 transition-all duration-300"
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </button>
                <button
                  className="font-aeonikpro inline-flex items-center justify-center h-10 px-6 rounded-full text-sm text-[#40424D] cursor-pointer bg-[#D3D6E0] hover:bg-white/90 hover:text-black transition-all duration-300"
                  onClick={() => router.push('/auth/register')}
                >
                  Get started
                </button>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full transition-colors duration-200"
              style={{ color: '#EDEFF7' }}
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <span className="font-aeonikpro text-lg font-semibold text-black">neaply</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition-colors duration-200"
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
              <div className="space-y-1 font-aeonikpro">
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
                  <button
                    onClick={() => {
                      setIsCartOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-2 text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-md px-2 py-3 text-base font-medium transition-colors duration-200 w-full text-left"
                  >
                    <div className="relative">
                      <ShoppingCart className="w-4 h-4" />
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                          {cartItemsCount > 99 ? '99+' : cartItemsCount}
                        </span>
                      )}
                    </div>
                    <span>Cart</span>
                  </button>
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
                      className="w-full bg-transparent text-foreground py-3 px-4 rounded-lg text-sm font-aeonikpro font-medium transition-all duration-300 hover:bg-accent"
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
      </nav>

      {/* Cart Slider */}
      <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
