import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

async function getServerUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

// GET - Fetch all workflows flagged with plagiarism/similarity issues
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const { user, error: authError } = await getServerUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!currentUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const severity = searchParams.get('severity') // 'info', 'warning', 'critical', or null for all
        const sortBy = searchParams.get('sortBy') || 'createdAt' // 'createdAt', 'similarityScore', 'severity'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {
            similaritySeverity: { not: null }
        }

        if (severity) {
            where.similaritySeverity = severity
        }

        // Build orderBy
        const orderBy: any = {}
        if (sortBy === 'similarityScore') {
            orderBy.similarityScore = sortOrder
        } else if (sortBy === 'severity') {
            // Custom ordering for severity (critical > warning > info)
            orderBy.similarityScore = 'desc' // Higher score = more severe
        } else {
            orderBy.createdAt = sortOrder
        }

        // Fetch flagged workflows
        const [workflows, totalCount] = await Promise.all([
            prisma.workflow.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    seller: {
                        select: {
                            id: true,
                            displayName: true,
                            email: true,
                            sellerProfile: {
                                select: {
                                    storeName: true,
                                    slug: true,
                                }
                            }
                        }
                    },
                    categories: {
                        include: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                }
            }),
            prisma.workflow.count({ where })
        ])

        // Get severity counts for dashboard
        const [infoCount, warningCount, criticalCount] = await Promise.all([
            prisma.workflow.count({ where: { similaritySeverity: 'info' } }),
            prisma.workflow.count({ where: { similaritySeverity: 'warning' } }),
            prisma.workflow.count({ where: { similaritySeverity: 'critical' } }),
        ])

        // Transform data
        const transformedWorkflows = workflows.map(workflow => ({
            id: workflow.id,
            title: workflow.title,
            slug: workflow.slug,
            status: workflow.status,
            similarityScore: workflow.similarityScore,
            similaritySeverity: workflow.similaritySeverity,
            similarityMatches: workflow.similarityMatches as any[] | null,
            basePriceCents: workflow.basePriceCents,
            currency: workflow.currency,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
            seller: {
                id: workflow.seller.id,
                displayName: workflow.seller.displayName,
                email: workflow.seller.email,
                storeName: workflow.seller.sellerProfile?.storeName,
                storeSlug: workflow.seller.sellerProfile?.slug,
            },
            categories: workflow.categories.map(wc => ({
                id: wc.category.id,
                name: wc.category.name,
            }))
        }))

        return NextResponse.json({
            data: transformedWorkflows,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount,
            },
            summary: {
                total: totalCount,
                info: infoCount,
                warning: warningCount,
                critical: criticalCount,
            }
        })

    } catch (error) {
        console.error('Error fetching plagiarism data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
