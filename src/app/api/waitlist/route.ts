import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendWaitlistWelcomeEmail } from '@/lib/email'

// Rate limiting - simple in-memory store (use Redis in production for distributed)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 3 // Max 3 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  entry.count++
  return true
}

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional(),
  referrer: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    
    // Validate input
    const validation = waitlistSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, source, referrer } = validation.data

    // Check if email already exists
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingEntry) {
      return NextResponse.json(
        { 
          message: 'You are already on the waitlist!',
          position: existingEntry.position,
          alreadyExists: true,
        },
        { status: 200 }
      )
    }

    // Get current count for position
    const currentCount = await prisma.waitlistEntry.count()
    const position = currentCount + 1

    // Create waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email: email.toLowerCase(),
        source,
        referrer,
        position,
        metadata: {
          ip,
          userAgent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Send welcome email (async, don't block response)
    sendWaitlistWelcomeEmail(email, position)
      .then(async (result) => {
        if (result.success) {
          // Update entry to mark email as sent
          await prisma.waitlistEntry.update({
            where: { id: entry.id },
            data: { emailSent: true },
          })
        }
      })
      .catch((error) => {
        console.error('Failed to send waitlist email:', error)
      })

    return NextResponse.json({
      message: 'Welcome to the waitlist!',
      position: entry.position,
      alreadyExists: false,
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Get waitlist stats (for admin or public display)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const showCount = searchParams.get('count') === 'true'

    if (showCount) {
      const count = await prisma.waitlistEntry.count()
      return NextResponse.json({ count })
    }

    // You could add admin authentication here for full list
    return NextResponse.json({ message: 'Use ?count=true for waitlist count' })
  } catch (error) {
    console.error('Waitlist GET error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
