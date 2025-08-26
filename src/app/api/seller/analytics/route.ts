import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is a seller
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isSeller: true },
    })

    if (!userProfile?.isSeller) {
      return NextResponse.json({ error: 'Seller access required' }, { status: 403 })
    }

    // Get date range from query params (default to last 12 months)
    const { searchParams } = new URL(req.url)
    const months = parseInt(searchParams.get('months') || '12')
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Fetch analytics data in parallel
    const [
      totalWorkflows,
      totalPacks,
      totalFavoritesWorkflows,
      totalFavoritesPacks,
      salesOverTimeWorkflows,
      salesOverTimePacks,
      workflowStats,
      packStats,
      totalRevenueWorkflows,
      totalRevenuePacks,
    ] = await Promise.all([
      // Total number of workflows (all statuses)
      prisma.workflow.count({
        where: { sellerId: user.id },
      }),

      // Total number of packs (all statuses)
      prisma.workflowPack.count({
        where: { sellerId: user.id },
      }),

      // Total favorites across all user workflows
      prisma.favorite.count({
        where: {
          workflow: {
            sellerId: user.id,
          },
        },
      }),

      // Total favorites across all user packs
      prisma.packFavorite.count({
        where: {
          pack: {
            sellerId: user.id,
          },
        },
      }),

      // Sales over time (monthly aggregation)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', o."createdAt") as month,
          COUNT(DISTINCT oi."workflowId") as workflows_sold,
          COUNT(oi.id) as total_sales,
          SUM(oi."unitPriceCents") as revenue_cents
        FROM "Order" o
        JOIN "OrderItem" oi ON o.id = oi."orderId"
        JOIN "Workflow" w ON oi."workflowId" = w.id
        WHERE w."sellerId"::text = ${user.id}
          AND o.status = 'paid'
          AND o."createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', o."createdAt")
        ORDER BY month ASC
      `,

      // Pack sales over time (monthly aggregation)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', o."createdAt") as month,
          COUNT(DISTINCT poi."packId") as packs_sold,
          COUNT(poi.id) as total_sales,
          SUM(poi."unitPriceCents") as revenue_cents
        FROM "Order" o
        JOIN "PackOrderItem" poi ON o.id = poi."orderId"
        JOIN "WorkflowPack" p ON poi."packId" = p.id
        WHERE p."sellerId"::text = ${user.id}
          AND o.status = 'paid'
          AND o."createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', o."createdAt")
        ORDER BY month ASC
      `,

      // Workflow performance stats
      prisma.workflow.findMany({
        where: { sellerId: user.id },
        select: {
          id: true,
          title: true,
          status: true,
          salesCount: true,
          ratingAvg: true,
          ratingCount: true,
          _count: {
            select: {
              favorites: true,
              reviews: true,
              orderItems: {
                where: {
                  order: {
                    status: 'paid',
                  },
                },
              },
            },
          },
        },
        orderBy: {
          salesCount: 'desc',
        },
        take: 10, // Top 10 workflows
      }),

      // Pack performance stats
      prisma.workflowPack.findMany({
        where: { sellerId: user.id },
        select: {
          id: true,
          title: true,
          status: true,
          _count: {
            select: {
              favorites: true,
              reviews: true,
              orderItems: {
                where: {
                  order: {
                    status: 'paid',
                  },
                },
              },
            },
          },
          reviews: {
            select: { rating: true },
            take: 1000,
          },
        },
      }),

      // Total revenue from workflow order items
      prisma.orderItem.aggregate({
        where: {
          workflow: {
            sellerId: user.id,
          },
          order: {
            status: 'paid',
          },
        },
        _sum: {
          unitPriceCents: true,
        },
      }),

      // Total revenue from pack order items
      prisma.packOrderItem.aggregate({
        where: {
          pack: {
            sellerId: user.id,
          },
          order: {
            status: 'paid',
          },
        },
        _sum: {
          unitPriceCents: true,
        },
      }),
    ])

    // Process sales over time data (merge workflows + packs per month)
    const wfData = (salesOverTimeWorkflows as any[]).map((item) => ({
      month: item.month.toISOString().slice(0, 7),
      workflowsSold: parseInt(item.workflows_sold) || 0,
      wfSales: parseInt(item.total_sales) || 0,
      wfRevenueCents: parseInt(item.revenue_cents) || 0,
    }))

    const packData = (salesOverTimePacks as any[]).map((item) => ({
      month: item.month.toISOString().slice(0, 7),
      packsSold: parseInt(item.packs_sold) || 0,
      packSales: parseInt(item.total_sales) || 0,
      packRevenueCents: parseInt(item.revenue_cents) || 0,
    }))

    const byMonth: Record<string, any> = {}
    for (const row of wfData) {
      byMonth[row.month] = {
        month: row.month,
        workflowsSold: row.workflowsSold,
        packsSold: 0,
        totalSales: row.wfSales,
        revenueCents: row.wfRevenueCents,
      }
    }
    for (const row of packData) {
      if (!byMonth[row.month]) {
        byMonth[row.month] = {
          month: row.month,
          workflowsSold: 0,
          packsSold: row.packsSold,
          totalSales: row.packSales,
          revenueCents: row.packRevenueCents,
        }
      } else {
        byMonth[row.month].packsSold = row.packsSold
        byMonth[row.month].totalSales += row.packSales
        byMonth[row.month].revenueCents += row.packRevenueCents
      }
    }
    const mergedSalesData = Object.values(byMonth).map((m: any) => ({
      month: m.month,
      workflowsSold: m.workflowsSold,
      packsSold: m.packsSold,
      itemsSold: (m.workflowsSold || 0) + (m.packsSold || 0),
      totalSales: m.totalSales || 0,
      revenueCents: m.revenueCents || 0,
    }))

    // Fill in missing months with zero values
    const filledSalesData = []
    const currentDate = new Date(startDate)
    const endDate = new Date()

    while (currentDate <= endDate) {
      const monthKey = currentDate.toISOString().slice(0, 7)
      const existingData = mergedSalesData.find((d) => d.month === monthKey)

      filledSalesData.push({
        month: monthKey,
        workflowsSold: existingData?.workflowsSold || 0,
        packsSold: existingData?.packsSold || 0,
        itemsSold: existingData?.itemsSold || 0,
        totalSales: existingData?.totalSales || 0,
        revenueCents: existingData?.revenueCents || 0,
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Calculate workflow status distribution
    const statusCounts = await prisma.workflow.groupBy({
      by: ['status'],
      where: { sellerId: user.id },
      _count: {
        id: true,
      },
    })

    const statusDistribution = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Calculate totals
    const totalRevenueCents = (totalRevenueWorkflows._sum.unitPriceCents || 0) + (totalRevenuePacks._sum.unitPriceCents || 0)
    const totalFavorites = (totalFavoritesWorkflows || 0) + (totalFavoritesPacks || 0)
    const totalSales = mergedSalesData.reduce((sum, item: any) => sum + (item.totalSales || 0), 0)

    return NextResponse.json({
      data: {
        overview: {
          totalWorkflows,
          totalPacks,
          totalFavorites,
          totalRevenueCents,
          totalSales,
        },
        salesOverTime: filledSalesData,
        topWorkflows: workflowStats.map((workflow) => ({
          id: workflow.id,
          title: workflow.title,
          status: workflow.status,
          salesCount: workflow.salesCount,
          rating: parseFloat(workflow.ratingAvg.toString()),
          ratingCount: workflow.ratingCount,
          favoritesCount: workflow._count.favorites,
          reviewsCount: workflow._count.reviews,
          paidOrdersCount: workflow._count.orderItems,
        })),
        topPacks: packStats
          .map((pack) => {
            const ratingCount = pack.reviews.length
            const rating = ratingCount > 0 ? pack.reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / ratingCount : 0
            return {
              id: pack.id,
              title: pack.title,
              status: pack.status,
              rating: Number(rating.toFixed(2)),
              ratingCount,
              favoritesCount: pack._count.favorites,
              reviewsCount: pack._count.reviews,
              paidOrdersCount: pack._count.orderItems,
            }
          })
          .sort((a, b) => (b.paidOrdersCount || 0) - (a.paidOrdersCount || 0))
          .slice(0, 10),
        statusDistribution,
      },
    })
  } catch (error) {
    console.error('Seller Analytics API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
