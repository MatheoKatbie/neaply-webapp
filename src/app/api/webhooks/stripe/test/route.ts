import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const orderCount = await prisma.order.count()
    const paymentCount = await prisma.payment.count()

    return NextResponse.json({
      status: 'ok',
      message: 'Webhook endpoint is working',
      database: {
        orders: orderCount,
        payments: paymentCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate a webhook event for testing
    console.log('Test webhook received:', body)

    return NextResponse.json({
      status: 'ok',
      message: 'Test webhook processed successfully',
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Test webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
