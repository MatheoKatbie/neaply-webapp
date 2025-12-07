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

  // Hide navbar and footer on auth pages, admin pages, and status pages
  const isAuthPage = pathname?.startsWith('/auth/')
  const isAdminPage = pathname?.startsWith('/admin/')
  const isStatusPage = pathname === '/maintenance' || pathname === '/coming-soon'
  const hideNavAndFooter = isAuthPage || isAdminPage || isStatusPage

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LanguageInitializer />
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNavAndFooter && <Footer />}
      <Toaster 
        position="bottom-right" 
        richColors 
        closeButton 
        duration={5000}
        theme="dark"
        toastOptions={{
          classNames: {
            toast: 'bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7]',
            title: 'text-[#EDEFF7]',
            description: 'text-[#9DA2B3]',
            actionButton: 'bg-black text-white hover:bg-gray-800',
            cancelButton: 'bg-[#9DA2B3]/20 text-[#EDEFF7] hover:bg-[#9DA2B3]/30',
            closeButton: 'text-[#9DA2B3] hover:text-[#EDEFF7]',
          },
          style: {
            backgroundColor: '#1E1E24',
            borderColor: 'rgba(157, 162, 179, 0.25)',
            color: '#EDEFF7',
          },
        }}
      />
    </div>
  )
}
