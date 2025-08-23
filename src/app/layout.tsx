import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ClientLayout from './client-layout'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flowmarket.com'),
  title: 'FlowMarket - Buy & Sell n8n Workflows | Automation Marketplace',
  description:
    'The premier marketplace for n8n workflow automation. Discover ready-to-use workflows or sell your own creations to the automation community. Join thousands of users automating their workflows.',
  keywords: 'n8n, workflows, automation, marketplace, buy workflows, sell workflows, no-code automation',
  openGraph: {
    title: 'FlowMarket - Buy & Sell n8n Workflows',
    description:
      'The premier marketplace for n8n workflow automation. Discover ready-to-use workflows or sell your own creations.',
    type: 'website',
    url: 'https://flowmarket.com',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'FlowMarket - n8n Workflow Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowMarket - Buy & Sell n8n Workflows',
    description: 'The premier marketplace for n8n workflow automation.',
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
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
