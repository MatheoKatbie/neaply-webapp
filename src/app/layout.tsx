import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import localFont from 'next/font/local'
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

// AeonikPro local font configuration
const aeonikPro = localFont({
  src: [
    {
      path: './fonts/AeonikProTRIAL-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/AeonikProTRIAL-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/AeonikProTRIAL-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/AeonikProTRIAL-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/AeonikProTRIAL-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/AeonikProTRIAL-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-aeonikpro',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com'),
  title: 'Neaply - Buy & Create Automation Workflows | Multi-Platform Marketplace',
  description:
    'The first marketplace for automation workflows across multiple platforms. Discover ready-to-use workflows for Make, n8n, Zapier, and more. Create and sell your automation solutions to the global community.',
  keywords:
    'automation, workflows, marketplace, make, n8n, zapier, airtable, no-code automation, buy workflows, create workflows',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      { rel: 'android-chrome', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome', url: '/android-chrome-512x512.png' },
    ],
  },
  openGraph: {
    title: 'Neaply - Buy & Sell Automation Workflows',
    description:
      'The first marketplace for automation workflows across multiple platforms. Discover ready-to-use workflows or sell your own creations.',
    type: 'website',
    url: 'https://neaply.com',
    siteName: 'Neaply',
    images: [
      {
        url: '/images/neaply/discord/cover.jpg',
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
    images: ['/images/neaply/x/cover.jpg'],
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
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${aeonikPro.variable} ${inter.className} antialiased mb-8`}
        suppressHydrationWarning={true}
        style={{ backgroundColor: '#08080A' }}
      >
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
