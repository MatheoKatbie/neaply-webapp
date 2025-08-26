import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50)
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    if (status && ['pending', 'paid', 'failed', 'refunded', 'cancelled'].includes(status)) {
      where.status = status
    }

    // Fetch orders with related data
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              workflow: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  heroImageUrl: true,
                },
              },
              pricingPlan: {
                select: {
                  id: true,
                  name: true,
                  features: true,
                },
              },
            },
          },
          packItems: {
            include: {
              pack: {
                include: {
                  workflows: {
                    include: {
                      workflow: {
                        select: {
                          id: true,
                          title: true,
                          slug: true,
                          heroImageUrl: true,
                        },
                      },
                    },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders,
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
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
