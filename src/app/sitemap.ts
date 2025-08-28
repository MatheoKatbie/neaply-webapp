import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com').replace(/\/$/, '')

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/marketplace',
    '/search',
    '/favorites',
    '/orders',
    '/settings',
    '/become-seller',
  ].map((route) => ({
    url: `${baseUrl}${route || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.7,
  }))

  // Dynamic routes: workflows by id page path, store by slug
  const [workflows, sellers] = await Promise.all([
    prisma.workflow.findMany({
      where: { status: 'published' },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    }),
    prisma.sellerProfile.findMany({
      where: { status: 'active' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    }),
  ])

  const workflowUrls: MetadataRoute.Sitemap = workflows.map((w) => ({
    url: `${baseUrl}/workflow/${w.id}`,
    lastModified: w.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const storeUrls: MetadataRoute.Sitemap = sellers.map((s) => ({
    url: `${baseUrl}/store/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...workflowUrls, ...storeUrls]
}
