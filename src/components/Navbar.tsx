'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHomepage = pathname === '/'

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
  return (
    <nav className="static top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-md rounded-none border-b border-gray-200 shadow-sm md:fixed md:top-4 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[min(96vw,1280px)] md:rounded-full md:border md:shadow-lg">
      <div className="w-full px-4 md:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo_flowmarket_256.png" alt="FlowMarket Logo" width={30} height={30} />
              <span className="font-space-grotesk text-xl font-bold text-black">FlowMarket</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-6">
              <Link
                href="/marketplace"
                className="font-inter text-gray-700 hover:text-black px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-gray-100"
              >
                Marketplace
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              // Logged in user
              <div className="flex items-center space-x-3">
                {!user.isSeller && (
                  <button
                    className="font-inter inline-flex items-center justify-center h-10 px-5 bg-black border border-black text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:shadow-lg cursor-pointer"
                    onClick={() => router.push('/become-seller')}
                  >
                    Become a Seller
                  </button>
                )}
                {user.isSeller && (
                  <button
                    className="font-inter inline-flex items-center justify-center h-10 px-5 bg-black border border-black text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:shadow-lg cursor-pointer"
                    onClick={() => router.push('/dashboard/seller')}
                  >
                    Seller Dashboard
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
                      <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 z-50">
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
                            <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/help')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-200 cursor-pointer"
                        >
                          Help & Support
                        </button>
                        <button
                          onClick={() => {
                            router.push('/settings')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-200 cursor-pointer"
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
                  className="font-inter inline-flex items-center justify-center h-10 px-5 bg-transparent border border-black text-black rounded-full text-sm font-medium transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </button>
                <button
                  className="font-inter inline-flex items-center justify-center h-10 px-5 bg-black border border-black text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:shadow-lg cursor-pointer"
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
              className="text-gray-700 hover:text-black p-2 rounded-full transition-colors duration-200"
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

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md rounded-2xl mt-2 border border-gray-200 shadow-lg">
              <Link
                href="/marketplace"
                className="font-inter text-gray-700 hover:text-black block px-3 py-2 rounded-full text-base font-medium transition-colors duration-200 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>

              <div className="pt-4 space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-10 w-full bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ) : user ? (
                  // Logged in user - mobile
                  <div className="space-y-2">
                    {!user.isSeller && (
                      <button
                        className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-black border border-black text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800"
                        onClick={() => {
                          router.push('/become-seller')
                          setIsMenuOpen(false)
                        }}
                      >
                        Become a Seller
                      </button>
                    )}
                    {user.isSeller && (
                      <button
                        className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-black border border-black text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800"
                        onClick={() => {
                          router.push('/dashboard/seller')
                          setIsMenuOpen(false)
                        }}
                      >
                        Seller Dashboard
                      </button>
                    )}

                    {/* Mobile dropdown items */}
                    <button
                      onClick={() => {
                        router.push('/help')
                        setIsMenuOpen(false)
                      }}
                      className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-transparent border border-gray-300 text-gray-700 rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:text-black cursor-pointer"
                    >
                      Help & Support
                    </button>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setIsMenuOpen(false)
                      }}
                      className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-transparent border border-gray-300 text-gray-700 rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:text-black cursor-pointer"
                    >
                      Parameters
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-transparent border border-red-500 text-red-500 rounded-full text-sm font-medium transition-all duration-300 hover:bg-red-500 hover:text-white cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  // Not logged in - mobile
                  <div className="space-y-2">
                    <button
                      className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-transparent border border-black text-black rounded-full text-sm font-medium transition-all duration-300 hover:bg-black hover:text-white"
                      onClick={() => {
                        router.push('/auth/login')
                        setIsMenuOpen(false)
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="font-inter w-full inline-flex items-center justify-center h-10 px-4 bg-black border border-black text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-800"
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
        )}
      </div>
    </nav>
  )
}
