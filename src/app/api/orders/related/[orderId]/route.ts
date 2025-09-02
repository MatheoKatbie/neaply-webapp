import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
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

    const { orderId } = await params

    // Get the original order to find related orders
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, createdAt: true, metadata: true },
    })

    if (!originalOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user owns this order
    if (originalOrder.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find related orders created around the same time for the same user
    // This is for multi-vendor orders that were created together
    const relatedOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(new Date(originalOrder.createdAt).getTime() - 5 * 60 * 1000), // 5 minutes before
          lte: new Date(new Date(originalOrder.createdAt).getTime() + 5 * 60 * 1000), // 5 minutes after
        },
        status: 'paid',
        metadata: {
          path: ['orderType'],
          equals: 'multi_vendor_cart',
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
                heroImageUrl: true,
                seller: {
                  select: {
                    id: true,
                    displayName: true,
                    sellerProfile: {
                      select: {
                        storeName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      orders: relatedOrders,
    })
  } catch (error) {
    console.error('Error fetching related orders:', error)
    return NextResponse.json({ error: 'Failed to fetch related orders' }, { status: 500 })
  }
}
