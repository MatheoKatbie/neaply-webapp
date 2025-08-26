'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isHomepage = pathname === '/'

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    <nav className="static top-0 left-0 z-50 w-full bg-background rounded-none border-b border-border shadow-sm md:fixed md:top-4 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[min(96vw,1280px)] md:rounded-full md:border md:shadow-lg">
      <div className="w-full px-4 md:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-space-grotesk text-xl font-bold text-foreground">Neaply</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-6">
              <Link
                href="/marketplace"
                className="font-inter text-muted-foreground hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-accent"
              >
                Marketplace
              </Link>
              {user && user.isSeller && (
                <Link
                  href={`/store/${storeSlug || user.id}`}
                  className="font-inter text-muted-foreground hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-accent"
                >
                  Your Store
                </Link>
              )}
              {user && (
                <Link
                  href="/favorites"
                  className="font-inter text-muted-foreground hover:text-foreground px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-accent flex items-center gap-1"
                >
                  Favorites
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
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
                    className="font-inter inline-flex items-center justify-center h-10 px-5 bg-primary border border-border text-primary-foreground rounded-full text-sm font-medium transition-all duration-300 hover:bg-background hover:text-foreground hover:shadow-lg cursor-pointer"
                    onClick={() => router.push('/become-seller')}
                  >
                    Become a Creator
                  </button>
                )}
                {user.isSeller && (
                  <button
                    className="font-inter inline-flex items-center justify-center h-10 px-5 bg-primary border border-border text-primary-foreground rounded-full text-sm font-medium transition-all duration-300 hover:bg-background hover:text-foreground hover:shadow-lg cursor-pointer"
                    onClick={() => router.push('/dashboard/seller')}
                  >
                    Creator Dashboard
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
                          Orders History
                        </button>
                        <button
                          onClick={() => {
                            router.push('/help')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
                        >
                          Help & Support
                        </button>
                        <button
                          onClick={() => {
                            router.push('/settings')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
                        >
                          Settings
                        </button>
                        <div className="border-t border-border my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 cursor-pointer"
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
                  className="font-inter inline-flex items-center justify-center h-10 px-5 bg-transparent border border-black text-foreground rounded-full text-sm font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </button>
                <button
                  className="font-inter inline-flex items-center justify-center h-10 px-5 bg-primary border border-black text-primary-foreground rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/auth/register')}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
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

        {/* Mobile Menu with Animation */}
        <div
          ref={menuRef}
          className={`md:hidden fixed inset-0 z-40 bg-primary/30 backdrop-blur-sm transition-opacity duration-300 min-h-screen ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className={`fixed top-0 right-0 w-80 h-full bg-background backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            style={{ height: '100vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <div className="flex items-center gap-2">
                <Image src="/images/logo_flowmarket_256.png" alt="Neaply Logo" width={24} height={24} />
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
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
                <ThemeToggle />
              </div>
              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  href="/marketplace"
                  className="block text-muted-foreground hover:text-foreground py-3 text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Marketplace
                </Link>
                {user && user.isSeller && (
                  <Link
                    href={`/store/${storeSlug || user.id}`}
                    className="block text-muted-foreground hover:text-foreground py-3 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Store
                  </Link>
                )}
                {user && (
                  <Link
                    href="/favorites"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-3 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Favorites
                  </Link>
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
                        Become a Creator
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
                        Creator Dashboard
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
                      Orders History
                    </button>
                    <button
                      onClick={() => {
                        router.push('/help')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-muted-foreground hover:text-foreground py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      Help & Support
                    </button>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-muted-foreground hover:text-foreground py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-destructive hover:text-destructive py-3 px-4 text-sm font-medium transition-colors duration-200 text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  // Not logged in - mobile
                  <div className="space-y-3">
                    <button
                      className="w-full bg-transparent text-foreground py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-accent"
                      onClick={() => {
                        router.push('/auth/login')
                        setIsMenuOpen(false)
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-800"
                      onClick={() => {
                        router.push('/auth/register')
                        setIsMenuOpen(false)
                      }}
                    >
                      Register
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
