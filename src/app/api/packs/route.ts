import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

// Validation schemas
const createPackSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    shortDesc: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
    longDescMd: z.string().optional(),
    basePriceCents: z.number().min(0, 'Price must be non-negative'),
    currency: z.enum(['EUR', 'USD']).default('EUR'),
    status: z.enum(['draft', 'published', 'unlisted', 'disabled']).default('draft'),
    categoryIds: z.array(z.string().uuid()).optional(),
    tagIds: z.array(z.string().uuid()).optional(),
    workflowIds: z.array(z.string().uuid()).max(10, 'Maximum 10 workflows allowed per pack').min(1, 'At least one workflow is required'),
})

const updatePackSchema = createPackSchema.partial().extend({
    id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { sellerProfile: true }
        })

        if (!dbUser?.isSeller || !dbUser.sellerProfile) {
            return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
        }

        const body = await req.json()
        const validated = createPackSchema.parse(body)

        // Check if workflows exist and belong to the seller
        const workflows = await prisma.workflow.findMany({
            where: {
                id: { in: validated.workflowIds },
                sellerId: user.id,
                status: { in: ['published', 'unlisted'] }
            }
        })

        if (workflows.length !== validated.workflowIds.length) {
            return NextResponse.json({ error: 'Some workflows not found or not accessible' }, { status: 400 })
        }

        // Generate slug from title
        const slug = validated.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36)

        // Create pack with workflows
        const pack = await prisma.workflowPack.create({
            data: {
                sellerId: user.id,
                title: validated.title,
                slug,
                shortDesc: validated.shortDesc,
                longDescMd: validated.longDescMd,
                basePriceCents: validated.basePriceCents,
                currency: validated.currency,
                status: validated.status,
                workflows: {
                    create: validated.workflowIds.map((workflowId, index) => ({
                        workflowId,
                        sortOrder: index
                    }))
                },
                categories: validated.categoryIds ? {
                    create: validated.categoryIds.map(categoryId => ({
                        categoryId
                    }))
                } : undefined,
                tags: validated.tagIds ? {
                    create: validated.tagIds.map(tagId => ({
                        tagId
                    }))
                } : undefined,
            },
            include: {
                workflows: {
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                title: true,
                                shortDesc: true,
                                heroImageUrl: true
                            }
                        }
                    },
                    orderBy: { sortOrder: 'asc' }
                },
                categories: {
                    include: { category: true }
                },
                tags: {
                    include: { tag: true }
                }
            }
        })

        return NextResponse.json({ pack }, { status: 201 })
    } catch (error) {
        console.error('Error creating pack:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') as 'draft' | 'published' | 'unlisted' | 'disabled' | undefined
        const sellerId = searchParams.get('sellerId')
        const category = searchParams.get('category')
        const tag = searchParams.get('tag')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where: any = {}

        if (status) {
            where.status = status
        } else {
            where.status = { in: ['published', 'unlisted'] }
        }

        if (sellerId) {
            where.sellerId = sellerId
        }

        if (category) {
            where.categories = {
                some: {
                    category: { slug: category }
                }
            }
        }

        if (tag) {
            where.tags = {
                some: {
                    tag: { slug: tag }
                }
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { shortDesc: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [packs, total] = await Promise.all([
            prisma.workflowPack.findMany({
                where,
                include: {
                    seller: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                            sellerProfile: {
                                select: {
                                    storeName: true,
                                    slug: true
                                }
                            }
                        }
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
                                    ratingCount: true
                                }
                            }
                        },
                        orderBy: { sortOrder: 'asc' }
                    },
                    categories: {
                        include: { category: true }
                    },
                    tags: {
                        include: { tag: true }
                    },
                    _count: {
                        select: {
                            reviews: true,
                            favorites: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.workflowPack.count({ where })
        ])

        return NextResponse.json({
            packs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching packs:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
