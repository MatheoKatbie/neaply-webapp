import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

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

    // Calculate current month date range (from 1st to current day)
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get orders from database for the current month
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            items: {
              some: {
                workflow: {
                  sellerId: user.id,
                },
              },
            },
          },
          {
            packItems: {
              some: {
                pack: {
                  sellerId: user.id,
                },
              },
            },
          },
        ],
        status: 'paid',
        paidAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: {
        items: {
          include: {
            workflow: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        packItems: {
          include: {
            pack: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    // Calculate earnings summary for current month
    const totalGross = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0)

    // Platform fee is 15% (same as in the main earnings API)
    const platformFeePercentage = 0.15
    const totalFees = Math.round(totalGross * platformFeePercentage)
    const totalNet = totalGross - totalFees

    // Get default currency from orders or use USD as fallback
    const defaultCurrency = orders.length > 0 ? orders[0]?.currency || 'USD' : 'USD'

    return NextResponse.json({
      success: true,
      data: {
        currentMonth: {
          totalGross,
          totalFees,
          totalNet,
          currency: defaultCurrency,
          salesCount: orders.length,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching current month earnings:', error)
    return NextResponse.json({ error: 'Failed to fetch current month earnings' }, { status: 500 })
  }
}
