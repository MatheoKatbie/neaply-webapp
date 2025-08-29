'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { LanguageInitializer } from '@/components/LanguageInitializer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Hide navbar and footer on auth pages and admin pages
  const isAuthPage = pathname?.startsWith('/auth/')
  const isAdminPage = pathname?.startsWith('/admin/')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LanguageInitializer />
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && !isAdminPage && <Footer />}
      <Toaster position="bottom-right" richColors closeButton duration={5000} />
    </div>
  )
}
