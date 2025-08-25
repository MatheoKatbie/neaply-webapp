'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  // Define auth pages that should not have the navbar or footer
  const authPages = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/callback']

  // Define admin pages that should not have the main navbar and footer (they have their own)
  const adminPages = ['/admin', '/admin/dashboard', '/admin/users', '/admin/workflows', '/admin/orders', '/admin/reports', '/admin/settings']

  const shouldShowNavbar = !authPages.includes(pathname) && !adminPages.some(page => pathname.startsWith(page))
  const shouldShowFooter = !authPages.includes(pathname) && !adminPages.some(page => pathname.startsWith(page))

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {shouldShowFooter && <Footer />}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        expand={true}
        toastOptions={{
          duration: 4000,
        }}
      />
    </div>
  )
}
