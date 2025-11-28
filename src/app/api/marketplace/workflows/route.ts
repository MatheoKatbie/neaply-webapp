import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

// Schema for marketplace workflow query parameters
const marketplaceQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(['popular', 'newest', 'rating', 'price-low', 'price-high']).optional().default('popular'),
})

export async function GET(req: NextRequest) {
  try {
    // Get user for favorite status
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedParams = marketplaceQuerySchema.parse(queryParams)

    const page = parseInt(validatedParams.page)
    const limit = Math.min(parseInt(validatedParams.limit), 50) // Max 50 items per page
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {
      status: 'published', // Only show published workflows
      // Only show workflows from active sellers
      seller: {
        sellerProfile: {
          status: 'active'
        }
      }
    }

    // Exclude user's own workflows if logged in
    if (user) {
      where.sellerId = {
        not: user.id,
      }
    }

    // Search filter
    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase()
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          shortDesc: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            some: {
              tag: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ]
    }

    // Category filter
    if (validatedParams.category && validatedParams.category !== 'all') {
      where.categories = {
        some: {
          category: {
            slug: validatedParams.category,
          },
        },
      }
    }

    // Platform filter
    if (validatedParams.platform && validatedParams.platform !== 'all') {
      where.platform = validatedParams.platform
    }

    // Price range filter
    if (validatedParams.minPrice || validatedParams.maxPrice) {
      where.basePriceCents = {}
      if (validatedParams.minPrice) {
        where.basePriceCents.gte = parseInt(validatedParams.minPrice) * 100
      }
      if (validatedParams.maxPrice) {
        where.basePriceCents.lte = parseInt(validatedParams.maxPrice) * 100
      }
    }

    // Build order by clause for sorting
    let orderBy: any = {}
    switch (validatedParams.sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'rating':
        orderBy = { ratingAvg: 'desc' }
        break
      case 'price-low':
        orderBy = { basePriceCents: 'asc' }
        break
      case 'price-high':
        orderBy = { basePriceCents: 'desc' }
        break
      case 'popular':
      default:
        orderBy = { salesCount: 'desc' }
        break
    }

    // Fetch workflows, total count, categories, and user favorites
    const [workflows, totalCount, categories, userFavorites] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          seller: {
            select: {
              displayName: true,
              avatarUrl: true,
              sellerProfile: {
                select: {
                  storeName: true,
                  slug: true,
                },
              },
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          versions: {
            where: { isLatest: true },
            take: 1,
            select: {
              id: true,
              semver: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.workflow.count({ where }),
      // Get all categories for filter dropdown
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              workflows: {
                where: {
                  workflow: {
                    status: 'published',
                  },
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      // Get user favorites if logged in
      user
        ? prisma.favorite.findMany({
            where: { userId: user.id },
            select: { workflowId: true },
          })
        : Promise.resolve([]),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Create a set of favorited workflow IDs for quick lookup
    const favoritedWorkflowIds = new Set(userFavorites.map((fav) => fav.workflowId.toString()))

    // Transform data for frontend
    const transformedWorkflows = workflows.map((workflow) => {
      const latestVersion = workflow.versions[0]
      const isNew = latestVersion && new Date(latestVersion.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // New if created in last 7 days
      const isTrending = workflow.salesCount > 50 && workflow.ratingAvg.toNumber() > 4.0 // Trending if good sales and rating

      return {
        id: workflow.id.toString(),
        title: workflow.title,
        description: workflow.shortDesc,
        price: workflow.basePriceCents,
        currency: workflow.currency,
        platform: workflow.platform,
        sellerId: workflow.sellerId.toString(),
        seller: workflow.seller.sellerProfile?.storeName || workflow.seller.displayName,
        sellerSlug: workflow.seller.sellerProfile?.slug,
        sellerAvatarUrl: workflow.seller.avatarUrl,
        rating: parseFloat(workflow.ratingAvg.toString()),
        ratingCount: workflow.ratingCount,
        salesCount: workflow.salesCount,
        heroImage: workflow.heroImageUrl,
        categories: workflow.categories.map((cat) => cat.category.name),
        tags: workflow.tags.map((tag) => tag.tag.name),
        isFavorite: favoritedWorkflowIds.has(workflow.id.toString()),
        isNew,
        isTrending,
        slug: workflow.slug,
        createdAt: workflow.createdAt,
      }
    })

    // Transform categories for filter dropdown
    const transformedCategories = categories
      .filter((cat) => cat._count.workflows > 0)
      .map((cat) => ({
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        count: cat._count.workflows,
      }))

    return NextResponse.json({
      data: transformedWorkflows,
      categories: transformedCategories,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Marketplace API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
