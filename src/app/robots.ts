import type { MetadataRoute } from 'next'
import { isMaintenanceModeActive } from '@/lib/maintenance'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com'
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  // During maintenance, tell crawlers to come back later
  if (isMaintenanceModeActive()) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      host: normalizedBaseUrl,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/callback/',
          '/checkout/',
          '/cart/',
          '/settings/',
          '/maintenance/',
          '/_next/',
          '/private/',
        ],
      },
      // Googlebot specific rules
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/checkout/',
          '/cart/',
          '/settings/',
          '/maintenance/',
        ],
      },
      // Bingbot specific rules
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/checkout/',
          '/cart/',
          '/settings/',
          '/maintenance/',
        ],
      },
      // Block AI crawlers if desired (optional)
      // Uncomment if you want to block AI training crawlers
      // {
      //   userAgent: 'GPTBot',
      //   disallow: '/',
      // },
      // {
      //   userAgent: 'ChatGPT-User',
      //   disallow: '/',
      // },
      // {
      //   userAgent: 'CCBot',
      //   disallow: '/',
      // },
      // {
      //   userAgent: 'anthropic-ai',
      //   disallow: '/',
      // },
    ],
    host: normalizedBaseUrl,
    sitemap: `${normalizedBaseUrl}/sitemap.xml`,
  }
}
