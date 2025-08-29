import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/auth/callback/', '/checkout/'],
      },
    ],
    host: baseUrl.replace(/\/$/, ''),
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
  }
}
