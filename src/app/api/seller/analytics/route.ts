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
      totalFavorites,
      salesOverTime,
      workflowStats,
    ] = await Promise.all([
      // Total number of workflows (all statuses)
      prisma.workflow.count({
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
    ])

    // Process sales over time data
    const salesData = (salesOverTime as any[]).map((item) => ({
      month: item.month.toISOString().slice(0, 7), // YYYY-MM format
      workflowsSold: parseInt(item.workflows_sold),
      totalSales: parseInt(item.total_sales),
      revenueCents: parseInt(item.revenue_cents),
    }))

    // Fill in missing months with zero values
    const filledSalesData = []
    const currentDate = new Date(startDate)
    const endDate = new Date()

    while (currentDate <= endDate) {
      const monthKey = currentDate.toISOString().slice(0, 7)
      const existingData = salesData.find((d) => d.month === monthKey)
      
      filledSalesData.push({
        month: monthKey,
        workflowsSold: existingData?.workflowsSold || 0,
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

    // Calculate total revenue
    const totalRevenue = await prisma.orderItem.aggregate({
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
    })

    return NextResponse.json({
      data: {
        overview: {
          totalWorkflows,
          totalFavorites,
          totalRevenueCents: totalRevenue._sum.unitPriceCents || 0,
          totalSales: salesData.reduce((sum, item) => sum + item.totalSales, 0),
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
        statusDistribution,
      },
    })
  } catch (error) {
    console.error('Seller Analytics API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
