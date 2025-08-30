import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ClientLayout from './client-layout'
import GoogleOneTapWrapper from '@/components/GoogleOneTapWrapper'
import { int } from 'zod'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com'),
  title: 'Neaply - Buy & Create Automation Workflows | Multi-Platform Marketplace',
  description:
    'The first marketplace for automation workflows across multiple platforms. Discover ready-to-use workflows for Make, n8n, Zapier, and more. Create and sell your automation solutions to the global community.',
  keywords:
    'automation, workflows, marketplace, make, n8n, zapier, airtable, no-code automation, buy workflows, create workflows',
  openGraph: {
    title: 'Neaply - Buy & Sell Automation Workflows',
    description:
      'The first marketplace for automation workflows across multiple platforms. Discover ready-to-use workflows or sell your own creations.',
    type: 'website',
    url: 'https://neaply.com',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'Neaply - Multi-Platform Automation Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neaply - Buy & Sell Automation Workflows',
    description: 'The first marketplace for automation workflows across multiple platforms.',
    images: ['/images/hero.png'],
  },
}

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${inter.className} antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <LanguageProvider>
                <ClientLayout>{children}</ClientLayout>
              </LanguageProvider>
            </CartProvider>
            <GoogleOneTapWrapper />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
