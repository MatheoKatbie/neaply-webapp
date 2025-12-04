import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { sendWaitlistLaunchEmail } from '@/lib/email'

// Helper function for admin authentication
async function getAuthenticatedAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, isAdmin: true }
  })

  return dbUser?.isAdmin ? dbUser : null
}

// POST /api/admin/send-launch-emails
// Send launch emails to all waitlist subscribers
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse options from request body
    const body = await request.json().catch(() => ({}))
    const { dryRun = false, limit } = body as { dryRun?: boolean; limit?: number }

    // Get all waitlist entries that haven't received launch email
    const entries = await prisma.waitlistEntry.findMany({
      where: {
        launchEmailSent: false,
      },
      orderBy: {
        position: 'asc',
      },
      take: limit,
    })

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending launch emails to send',
        sent: 0,
        failed: 0,
      })
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Would send to ${entries.length} subscribers`,
        subscribers: entries.map(e => ({ email: e.email, position: e.position })),
      })
    }

    // Send emails one by one using the lib function
    const results = {
      sent: 0,
      failed: 0,
      successful: [] as string[],
      errors: [] as string[],
    }

    for (const entry of entries) {
      const result = await sendWaitlistLaunchEmail(entry.email)
      
      if (result.success) {
        results.sent++
        results.successful.push(entry.email)
        
        // Mark as sent
        await prisma.waitlistEntry.update({
          where: { id: entry.id },
          data: { launchEmailSent: true },
        })
      } else {
        results.failed++
        results.errors.push(`${entry.email}: ${result.error}`)
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      successful: results.successful,
      errors: results.errors,
    })

  } catch (error) {
    console.error('Error sending launch emails:', error)
    return NextResponse.json(
      { error: 'Failed to send launch emails' },
      { status: 500 }
    )
  }
}

// GET /api/admin/send-launch-emails
// Get stats about pending launch emails
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const pending = await prisma.waitlistEntry.count({
      where: { launchEmailSent: false },
    })

    const sent = await prisma.waitlistEntry.count({
      where: { launchEmailSent: true },
    })

    const total = await prisma.waitlistEntry.count()

    return NextResponse.json({
      pending,
      sent,
      total,
    })

  } catch (error) {
    console.error('Error getting launch email stats:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
