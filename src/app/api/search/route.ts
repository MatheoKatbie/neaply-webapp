import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

// Schema for search query parameters
const searchQuerySchema = z.object({
    q: z.string().min(1, 'Search query is required'),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('16'),
    type: z.enum(['all', 'workflows', 'packs']).optional().default('all'),
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

        const validatedParams = searchQuerySchema.parse(queryParams)

        const page = parseInt(validatedParams.page)
        const limit = Math.min(parseInt(validatedParams.limit), 50) // Max 50 items per page
        const skip = (page - 1) * limit
        const searchTerm = validatedParams.q.toLowerCase()

        // Build search conditions
        const searchConditions = [
            {
                title: {
                    contains: searchTerm,
                    mode: 'insensitive' as const,
                },
            },
            {
                shortDesc: {
                    contains: searchTerm,
                    mode: 'insensitive' as const,
                },
            },
            {
                tags: {
                    some: {
                        tag: {
                            name: {
                                contains: searchTerm,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                },
            },
        ]

        let workflows: any[] = []
        let packs: any[] = []
        let totalWorkflows = 0
        let totalPacks = 0

        // Fetch workflows if requested
        if (validatedParams.type === 'all' || validatedParams.type === 'workflows') {
            const workflowWhere: any = {
                status: 'published',
                OR: searchConditions,
            }

            // Exclude user's own workflows if logged in
            if (user) {
                workflowWhere.sellerId = {
                    not: user.id,
                }
            }

            const [workflowResults, workflowCount] = await Promise.all([
                prisma.workflow.findMany({
                    where: workflowWhere,
                    include: {
                        seller: {
                            select: {
                                displayName: true,
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
                    orderBy: { salesCount: 'desc' },
                    skip: validatedParams.type === 'workflows' ? skip : 0,
                    take: validatedParams.type === 'workflows' ? limit : 8, // Limit for mixed results
                }),
                prisma.workflow.count({ where: workflowWhere }),
            ])

            workflows = workflowResults
            totalWorkflows = workflowCount
        }

        // Fetch packs if requested
        if (validatedParams.type === 'all' || validatedParams.type === 'packs') {
            const packWhere: any = {
                status: 'published',
                OR: searchConditions,
            }

            // Exclude user's own packs if logged in
            if (user) {
                packWhere.sellerId = {
                    not: user.id,
                }
            }

            const [packResults, packCount] = await Promise.all([
                prisma.workflowPack.findMany({
                    where: packWhere,
                    include: {
                        seller: {
                            select: {
                                displayName: true,
                                sellerProfile: {
                                    select: {
                                        storeName: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                        workflows: {
                            include: {
                                workflow: {
                                    select: {
                                        id: true,
                                        title: true,
                                        shortDesc: true,
                                        heroImageUrl: true,
                                        ratingAvg: true,
                                        ratingCount: true,
                                    },
                                },
                            },
                            orderBy: { sortOrder: 'asc' },
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
                        _count: {
                            select: {
                                reviews: true,
                                favorites: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: validatedParams.type === 'packs' ? skip : 0,
                    take: validatedParams.type === 'packs' ? limit : 8, // Limit for mixed results
                }),
                prisma.workflowPack.count({ where: packWhere }),
            ])

            packs = packResults
            totalPacks = packCount
        }

        // Get user favorites if logged in
        const [userWorkflowFavorites, userPackFavorites] = await Promise.all([
            user
                ? prisma.favorite.findMany({
                    where: { userId: user.id },
                    select: { workflowId: true },
                })
                : Promise.resolve([]),
            user
                ? prisma.packFavorite.findMany({
                    where: { userId: user.id },
                    select: { packId: true },
                })
                : Promise.resolve([]),
        ])

        const favoritedWorkflowIds = new Set(userWorkflowFavorites.map((fav) => fav.workflowId.toString()))
        const favoritedPackIds = new Set(userPackFavorites.map((fav) => fav.packId.toString()))

        // Transform workflows data
        const transformedWorkflows = workflows.map((workflow) => {
            const latestVersion = workflow.versions[0]
            const isNew = latestVersion && new Date(latestVersion.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            const isTrending = workflow.salesCount > 50 && workflow.ratingAvg.toNumber() > 4.0

            return {
                id: workflow.id.toString(),
                type: 'workflow',
                title: workflow.title,
                description: workflow.shortDesc,
                price: workflow.basePriceCents,
                currency: workflow.currency,
                platform: workflow.platform,
                seller: workflow.seller.sellerProfile?.storeName || workflow.seller.displayName,
                rating: parseFloat(workflow.ratingAvg.toString()),
                ratingCount: workflow.ratingCount,
                salesCount: workflow.salesCount,
                heroImage: workflow.heroImageUrl,
                categories: workflow.categories.map((cat: any) => cat.category.name),
                tags: workflow.tags.map((tag: any) => tag.tag.name),
                isFavorite: favoritedWorkflowIds.has(workflow.id.toString()),
                isNew,
                isTrending,
                slug: workflow.slug,
                createdAt: workflow.createdAt,
            }
        })

        // Transform packs data
        const transformedPacks = packs.map((pack) => {
            const totalRating = pack.workflows.reduce((sum: number, wf: any) => sum + parseFloat(wf.workflow.ratingAvg.toString()), 0)
            const avgRating = pack.workflows.length > 0 ? totalRating / pack.workflows.length : 0
            const totalRatingCount = pack.workflows.reduce((sum: number, wf: any) => sum + wf.workflow.ratingCount, 0)

            return {
                id: pack.id.toString(),
                type: 'pack',
                title: pack.title,
                description: pack.shortDesc,
                price: pack.basePriceCents,
                currency: pack.currency,
                seller: pack.seller.sellerProfile?.storeName || pack.seller.displayName,
                rating: avgRating,
                ratingCount: totalRatingCount,
                workflowCount: pack.workflows.length,
                heroImage: pack.workflows[0]?.workflow.heroImageUrl || null,
                categories: pack.categories.map((cat: any) => cat.category.name),
                tags: pack.tags.map((tag: any) => tag.tag.name),
                isFavorite: favoritedPackIds.has(pack.id.toString()),
                slug: pack.slug,
                createdAt: pack.createdAt,
                workflows: pack.workflows.map((wf: any) => ({
                    id: wf.workflow.id.toString(),
                    title: wf.workflow.title,
                    description: wf.workflow.shortDesc,
                    heroImage: wf.workflow.heroImageUrl,
                    rating: parseFloat(wf.workflow.ratingAvg.toString()),
                    ratingCount: wf.workflow.ratingCount,
                })),
            }
        })

        // Combine and sort results for mixed search
        let combinedResults = [...transformedWorkflows, ...transformedPacks]
        let totalCount = totalWorkflows + totalPacks

        if (validatedParams.type === 'all') {
            // Sort by relevance (newer items first for mixed results)
            combinedResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            combinedResults = combinedResults.slice(0, limit)
        } else {
            // Use the specific type results
            combinedResults = validatedParams.type === 'workflows' ? transformedWorkflows : transformedPacks
            totalCount = validatedParams.type === 'workflows' ? totalWorkflows : totalPacks
        }

        const totalPages = Math.ceil(totalCount / limit)

        return NextResponse.json({
            data: combinedResults,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            stats: {
                workflows: totalWorkflows,
                packs: totalPacks,
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

        console.error('Search API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
