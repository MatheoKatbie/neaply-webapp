import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ClientLayout from './client-layout'
import GoogleOneTapWrapper from '@/components/GoogleOneTapWrapper'
import Script from 'next/script'

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

// Site configuration
const siteConfig = {
  name: 'Neaply',
  description: 'The first marketplace for automation workflows across multiple platforms. Discover ready-to-use workflows for Make, n8n, Zapier, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com',
  ogImage: '/images/neaply/discord/cover.jpg',
  twitterHandle: '@neaply',
  creator: 'Neaply Team',
}

// Viewport configuration (separate from metadata in Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#08080A' },
  ],
  colorScheme: 'dark light',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Neaply - Buy & Create Automation Workflows | Multi-Platform Marketplace',
    template: '%s | Neaply',
  },
  description: siteConfig.description,
  keywords: [
    'automation',
    'workflows',
    'marketplace',
    'make',
    'n8n',
    'zapier',
    'airtable',
    'no-code automation',
    'buy workflows',
    'create workflows',
    'automation templates',
    'workflow marketplace',
    'business automation',
    'digital products',
    'SaaS integrations',
  ],
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_FR', 'es_ES', 'de_DE'],
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Neaply - Buy & Sell Automation Workflows',
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Neaply - Multi-Platform Automation Marketplace',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: 'Neaply - Buy & Sell Automation Workflows',
    description: siteConfig.description,
    images: {
      url: '/images/neaply/x/cover.jpg',
      alt: 'Neaply - Multi-Platform Automation Marketplace',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'en-US': `${siteConfig.url}/en`,
      'fr-FR': `${siteConfig.url}/fr`,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    // yandex: 'your-yandex-verification',
    // yahoo: 'your-yahoo-verification',
    // other: { 'bing': 'your-bing-verification' },
  },
  category: 'technology',
  classification: 'Business/E-commerce',
}

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

// JSON-LD Structured Data for Organization
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/neaply/logo.png`,
  sameAs: [
    'https://twitter.com/neaply',
    'https://linkedin.com/company/neaply',
    'https://discord.gg/neaply',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'French'],
  },
}

// JSON-LD Structured Data for Website
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// JSON-LD Structured Data for WebApplication
const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '500',
    offerCount: '1000+',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for commonly used external resources */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        
        {/* JSON-LD Structured Data */}
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          strategy="afterInteractive"
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          strategy="afterInteractive"
        />
        <Script
          id="webapp-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${aeonikPro.variable} ${inter.className} antialiased`}
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
