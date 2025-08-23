import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is a seller
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { sellerProfile: true },
    })

    if (!dbUser?.isSeller || !dbUser.sellerProfile) {
      return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
    }

    // Check if Stripe Connect account exists
    if (!dbUser.sellerProfile.stripeAccountId) {
      return NextResponse.json({ error: 'Stripe Connect account not found' }, { status: 404 })
    }

    // Get query parameters with validation
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam) || 50, 1), 100) : 50

    // Validate period parameter
    const validPeriods = ['7d', '30d', '90d', '1y']
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 })
    }

    // Calculate date range
    const now = Date.now()
    let startDate: number
    switch (period) {
      case '7d':
        startDate = now - 7 * 24 * 60 * 60 * 1000
        break
      case '30d':
        startDate = now - 30 * 24 * 60 * 60 * 1000
        break
      case '90d':
        startDate = now - 90 * 24 * 60 * 60 * 1000
        break
      case '1y':
        startDate = now - 365 * 24 * 60 * 60 * 1000
        break
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000
    }

    // Get orders from database for the seller
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            workflow: {
              sellerId: user.id,
            },
          },
        },
        status: 'paid',
        paidAt: {
          gte: new Date(startDate),
        },
      },
      include: {
        items: {
          include: {
            workflow: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
      take: limit,
    })

    // Get transfers from Stripe Connect account
    let transfers
    try {
      transfers = await stripe.transfers.list(
        {
          limit: Math.min(limit, 100),
          created: {
            gte: Math.floor(startDate / 1000),
          },
        },
        {
          stripeAccount: dbUser.sellerProfile.stripeAccountId,
        }
      )
    } catch (stripeError) {
      console.error('Stripe transfers API error:', stripeError)
      // Continue without transfers data if there's an error
      transfers = { data: [], has_more: false }
    }

    // Get application fees from Stripe (platform commissions)
    let applicationFees
    try {
      applicationFees = await stripe.applicationFees.list({
        limit: Math.min(limit, 100),
        created: {
          gte: Math.floor(startDate / 1000),
        },
      })
    } catch (stripeError) {
      console.error('Stripe application fees API error:', stripeError)
      // Continue without application fees data if there's an error
      applicationFees = { data: [], has_more: false }
    }

    // Calculate earnings summary from orders
    const totalGross = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0)

    // Calculate platform fees (assuming 10% commission - adjust as needed)
    const platformFeePercentage = 0.1 // 10%
    const totalFees = Math.round(totalGross * platformFeePercentage)
    const totalNet = totalGross - totalFees

    // Get default currency from orders or use EUR as fallback
    const defaultCurrency = orders.length > 0 ? orders[0]?.currency || 'eur' : 'eur'

    // Group by workflow for top sellers
    const workflowSales = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const workflowId = item.workflow.id
        if (!acc[workflowId]) {
          acc[workflowId] = {
            workflowId,
            title: item.workflow.title,
            slug: item.workflow.slug,
            sales: 0,
            revenue: 0,
          }
        }
        acc[workflowId].sales += 1
        acc[workflowId].revenue += item.subtotalCents || 0
      })
      return acc
    }, {} as Record<string, any>)

    const topWorkflows = Object.values(workflowSales)
      .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalGross,
          totalFees,
          totalNet,
          currency: defaultCurrency,
          salesCount: orders.length,
        },
        transfers: transfers.data.map((transfer) => ({
          id: transfer.id,
          amount: transfer.amount || 0,
          currency: transfer.currency || 'eur',
          created: transfer.created,
          description: transfer.description,
        })),
        applicationFees: applicationFees.data.map((fee) => ({
          id: fee.id,
          amount: fee.amount || 0,
          currency: fee.currency || 'eur',
          created: fee.created,
          charge: fee.charge,
        })),
        orders: orders.map((order) => ({
          id: order.id,
          totalCents: order.totalCents || 0,
          currency: order.currency || 'eur',
          paidAt: order.paidAt,
          items: order.items.map((item) => ({
            workflowTitle: item.workflow.title,
            workflowSlug: item.workflow.slug,
            unitPriceCents: item.unitPriceCents || 0,
            subtotalCents: item.subtotalCents || 0,
          })),
        })),
        topWorkflows,
        pagination: {
          hasMore: transfers.has_more || false,
          nextCursor: transfers.data.length > 0 ? transfers.data[transfers.data.length - 1]?.id : null,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching seller earnings:', error)
    return NextResponse.json({ error: 'Failed to fetch earnings information' }, { status: 500 })
  }
}
