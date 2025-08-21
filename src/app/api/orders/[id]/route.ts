import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: orderId } = await params

    // Fetch order with related data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id, // Ensure user can only access their own orders
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
        payments: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
