import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { sendBroadcastEmail } from '@/lib/email'
import { z } from 'zod'

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

// Validation schema
const broadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().url().optional(),
  audience: z.enum(['all', 'sellers', 'buyers', 'waitlist']),
  testEmail: z.string().email().optional(), // For test sends
})

// POST /api/admin/emails/broadcast
export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = broadcastSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { subject, content, ctaText, ctaUrl, audience, testEmail } = validation.data

    // If test email is provided, only send to that email
    if (testEmail) {
      const result = await sendBroadcastEmail({
        emails: [testEmail],
        subject: `[TEST] ${subject}`,
        content,
        ctaText,
        ctaUrl,
      })

      return NextResponse.json({
        success: true,
        test: true,
        sent: result.sent,
        failed: result.failed,
        errors: result.errors,
      })
    }

    // Get emails based on audience
    let emails: string[] = []

    switch (audience) {
      case 'all':
        const allUsers = await prisma.user.findMany({
          select: { email: true },
        })
        emails = allUsers.map(u => u.email)
        break

      case 'sellers':
        const sellers = await prisma.user.findMany({
          where: { isSeller: true },
          select: { email: true },
        })
        emails = sellers.map(u => u.email)
        break

      case 'buyers':
        // Users who have made at least one order
        const buyerIds = await prisma.order.findMany({
          distinct: ['userId'],
          select: { userId: true },
        })
        const buyerUsers = await prisma.user.findMany({
          where: { id: { in: buyerIds.map(o => o.userId) } },
          select: { email: true },
        })
        emails = buyerUsers.map(u => u.email)
        break

      case 'waitlist':
        const waitlist = await prisma.waitlistEntry.findMany({
          select: { email: true },
        })
        emails = waitlist.map(w => w.email)
        break
    }

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recipients found for this audience',
        sent: 0,
        failed: 0,
      })
    }

    // Send broadcast
    const result = await sendBroadcastEmail({
      emails,
      subject,
      content,
      ctaText,
      ctaUrl,
    })

    // Log the broadcast
    console.log(`[BROADCAST] Admin ${admin.id} sent email to ${audience}: ${result.sent} sent, ${result.failed} failed`)

    return NextResponse.json({
      success: true,
      audience,
      totalRecipients: emails.length,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors.slice(0, 10), // Limit errors in response
    })

  } catch (error) {
    console.error('Error sending broadcast email:', error)
    return NextResponse.json(
      { error: 'Failed to send broadcast email' },
      { status: 500 }
    )
  }
}

// GET /api/admin/emails/broadcast
// Get audience stats
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalWaitlist,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isSeller: true } }),
      prisma.order.findMany({ distinct: ['userId'] }).then(orders => orders.length),
      prisma.waitlistEntry.count(),
    ])

    return NextResponse.json({
      audiences: {
        all: totalUsers,
        sellers: totalSellers,
        buyers: totalBuyers,
        waitlist: totalWaitlist,
      },
    })

  } catch (error) {
    console.error('Error getting audience stats:', error)
    return NextResponse.json(
      { error: 'Failed to get audience stats' },
      { status: 500 }
    )
  }
}
