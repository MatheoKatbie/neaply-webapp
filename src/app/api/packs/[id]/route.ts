import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

const updatePackSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
    shortDesc: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters').optional(),
    longDescMd: z.string().optional(),
    basePriceCents: z.number().min(0, 'Price must be non-negative').optional(),
    currency: z.enum(['EUR', 'USD']).optional(),
    status: z.enum(['draft', 'published', 'unlisted', 'disabled']).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    tagIds: z.array(z.string().uuid()).optional(),
    workflowIds: z.array(z.string().uuid()).max(10, 'Maximum 10 workflows allowed per pack').min(1, 'At least one workflow is required').optional(),
})

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const pack = await prisma.workflowPack.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        sellerProfile: {
                            select: {
                                storeName: true,
                                slug: true,
                                bio: true
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
                                ratingCount: true,
                                salesCount: true,
                                basePriceCents: true,
                                currency: true,
                                platform: true,
                                categories: {
                                    include: { category: true }
                                },
                                tags: {
                                    include: { tag: true }
                                }
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
                plans: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' }
                },
                reviews: {
                    where: { status: 'published' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        reviews: true,
                        favorites: true
                    }
                }
            }
        })

        if (!pack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        // Check if user is authenticated and if they've favorited this pack
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let isFavorited = false
        let userOwnsPack = false
        if (user) {
            const favorite = await prisma.packFavorite.findUnique({
                where: {
                    userId_packId: {
                        userId: user.id,
                        packId: id
                    }
                }
            })
            isFavorited = !!favorite

            // Check if user owns the pack
            const order = await prisma.order.findFirst({
                where: {
                    userId: user.id,
                    status: 'paid',
                    packItems: {
                        some: {
                            packId: id,
                        },
                    },
                },
            })
            userOwnsPack = !!order
        }

        return NextResponse.json({
            pack: {
                ...pack,
                isFavorited,
                userOwnsPack
            }
        })
    } catch (error) {
        console.error('Error fetching pack:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if pack exists and belongs to user
        const existingPack = await prisma.workflowPack.findUnique({
            where: { id },
            include: { workflows: true }
        })

        if (!existingPack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        if (existingPack.sellerId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const validated = updatePackSchema.parse(body)

        // If updating workflows, validate they belong to the seller
        if (validated.workflowIds) {
            const workflows = await prisma.workflow.findMany({
                where: {
                    id: { in: validated.workflowIds },
                    sellerId: user.id,
                    status: { in: ['published', 'unlisted', 'pack_only'] }
                }
            })

            if (workflows.length !== validated.workflowIds.length) {
                return NextResponse.json({ error: 'Some workflows not found or not accessible' }, { status: 400 })
            }
        }

        // Update pack
        const pack = await prisma.workflowPack.update({
            where: { id },
            data: {
                title: validated.title,
                shortDesc: validated.shortDesc,
                longDescMd: validated.longDescMd,
                basePriceCents: validated.basePriceCents,
                currency: validated.currency,
                status: validated.status,
                // Update workflows if provided
                workflows: validated.workflowIds ? {
                    deleteMany: {},
                    create: validated.workflowIds.map((workflowId, index) => ({
                        workflowId,
                        sortOrder: index
                    }))
                } : undefined,
                // Update categories if provided
                categories: validated.categoryIds ? {
                    deleteMany: {},
                    create: validated.categoryIds.map(categoryId => ({
                        categoryId
                    }))
                } : undefined,
                // Update tags if provided
                tags: validated.tagIds ? {
                    deleteMany: {},
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

        return NextResponse.json({ pack })
    } catch (error) {
        console.error('Error updating pack:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if pack exists and belongs to user
        const existingPack = await prisma.workflowPack.findUnique({
            where: { id }
        })

        if (!existingPack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        if (existingPack.sellerId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete pack (cascades to related records)
        await prisma.workflowPack.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Pack deleted successfully' })
    } catch (error) {
        console.error('Error deleting pack:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
