import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { isMaintenanceModeActive } from '@/lib/maintenance'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://neaply.com').replace(/\/$/, '')

  // During maintenance, return minimal sitemap
  if (isMaintenanceModeActive()) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }

  // High priority static routes (core pages)
  const highPriorityRoutes: MetadataRoute.Sitemap = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/search', priority: 0.9, changeFrequency: 'daily' },
    { route: '/marketplace', priority: 0.9, changeFrequency: 'daily' },
    { route: '/how-it-works', priority: 0.8, changeFrequency: 'weekly' },
    { route: '/become-seller', priority: 0.8, changeFrequency: 'weekly' },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route || '/'}`,
    lastModified: new Date(),
    changeFrequency: changeFrequency as 'daily' | 'weekly',
    priority,
  }))

  // Medium priority static routes (auth & user pages)
  const mediumPriorityRoutes: MetadataRoute.Sitemap = [
    { route: '/auth/login', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/auth/register', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/help', priority: 0.5, changeFrequency: 'monthly' },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: changeFrequency as 'monthly',
    priority,
  }))

  // Dynamic routes: workflows by id page path, store by slug
  try {
    const [workflows, sellers, categories] = await Promise.all([
      prisma.workflow.findMany({
        where: { status: 'published' },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 10000, // Increased limit
      }),
      prisma.sellerProfile.findMany({
        where: { status: 'active' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5000,
      }),
      // Get unique categories/platforms for category pages
      prisma.workflow.findMany({
        where: { status: 'published' },
        select: { platform: true },
        distinct: ['platform'],
      }),
    ])

    // Workflow URLs with high priority (they are the main content)
    const workflowUrls: MetadataRoute.Sitemap = workflows.map((w) => ({
      url: `${baseUrl}/workflow/${w.id}`,
      lastModified: w.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Store URLs
    const storeUrls: MetadataRoute.Sitemap = sellers.map((s) => ({
      url: `${baseUrl}/store/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Platform/category URLs
    const platformUrls: MetadataRoute.Sitemap = categories
      .filter((c) => c.platform)
      .map((c) => ({
        url: `${baseUrl}/search?platform=${encodeURIComponent(c.platform!)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }))

    return [
      ...highPriorityRoutes,
      ...mediumPriorityRoutes,
      ...platformUrls,
      ...workflowUrls,
      ...storeUrls,
    ]
  } catch (error) {
    // If database is unavailable, return static routes only
    console.error('Sitemap generation error:', error)
    return [...highPriorityRoutes, ...mediumPriorityRoutes]
  }
}
