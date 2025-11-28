import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET

/**
 * API endpoint for scheduled notification purge
 * Can be triggered by Vercel Cron or external scheduler
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/purge-notifications",
 *     "schedule": "0 3 1 * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has valid secret
    const authHeader = request.headers.get('authorization')
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    
    if (!isVercelCron && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get months parameter from query string (default: 9)
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '9', 10)

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)

    // Count before deletion
    const countBefore = await prisma.notification.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    if (countBefore === 0) {
      return NextResponse.json({
        success: true,
        message: 'No notifications to purge',
        deleted: 0,
        cutoffDate: cutoffDate.toISOString(),
      })
    }

    // Delete old notifications
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    console.log(`[CRON] Purged ${result.count} notifications older than ${months} months`)

    return NextResponse.json({
      success: true,
      message: `Successfully purged ${result.count} notifications`,
      deleted: result.count,
      months,
      cutoffDate: cutoffDate.toISOString(),
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[CRON] Error purging notifications:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to purge notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
