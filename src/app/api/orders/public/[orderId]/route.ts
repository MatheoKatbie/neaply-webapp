import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params

    // Validate order ID format
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // Fetch order with items and workflow details, plus pack items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            workflow: {
              include: {
                seller: {
                  select: {
                    displayName: true,
                    sellerProfile: {
                      select: {
                        storeName: true,
                        slug: true,
                      },
                    },
                  },
                },
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
                      select: { id: true, title: true, slug: true },
                    },
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amountCents: true,
            currency: true,
            processedAt: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only return basic order information for public access
    // Don't include sensitive user information
    const publicOrder = {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items.map((item) => ({
        id: item.id,
        workflowId: item.workflowId,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        subtotalCents: item.subtotalCents,
        workflow: item.workflow,
      })),
      packItems: order.packItems.map((pi) => ({
        id: pi.id,
        packId: pi.packId,
        unitPriceCents: pi.unitPriceCents,
        quantity: pi.quantity,
        subtotalCents: pi.subtotalCents,
        pack: {
          id: pi.pack.id,
          title: pi.pack.title,
          slug: pi.pack.slug,
          heroImageUrl: pi.pack.heroImageUrl || undefined,
          workflows: pi.pack.workflows.map((pw) => ({
            workflowId: pw.workflowId,
            sortOrder: pw.sortOrder,
            workflow: {
              id: pw.workflow.id,
              title: pw.workflow.title,
              slug: pw.workflow.slug,
            },
          })),
        },
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        amountCents: payment.amountCents,
        currency: payment.currency,
        processedAt: payment.processedAt,
      })),
    }

    return NextResponse.json({
      order: publicOrder,
    })
  } catch (error) {
    console.error('Error fetching public order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
