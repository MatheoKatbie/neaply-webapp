'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  // Define auth pages that should not have the navbar
  const authPages = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/callback']

  const shouldShowNavbar = !authPages.includes(pathname)

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? 'py-10' : ''}>{children}</main>
    </>
  )
}
