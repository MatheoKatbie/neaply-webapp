'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { LanguageInitializer } from '@/components/LanguageInitializer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LanguageInitializer />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="bottom-right" richColors closeButton duration={5000} />
    </div>
  )
}
