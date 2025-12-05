import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get current user (optional - anonymous reports allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { category, title, description, pageUrl, userAgent } = body

    // Validate required fields
    if (!category || !title || !description) {
      return NextResponse.json(
        { error: 'Category, title, and description are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['ui', 'performance', 'functional', 'security', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate lengths
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: 'Description must be 2000 characters or less' },
        { status: 400 }
      )
    }

    // Create bug report
    const bugReport = await prisma.bugReport.create({
      data: {
        reporterId: user?.id || null,
        category,
        title: title.trim(),
        description: description.trim(),
        pageUrl: pageUrl || null,
        userAgent: userAgent || null,
        status: 'open',
      },
    })

    return NextResponse.json({
      success: true,
      id: bugReport.id,
      message: 'Bug report submitted successfully',
    })
  } catch (error) {
    console.error('Error creating bug report:', error)
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    )
  }
}

// GET endpoint for admin to fetch bug reports
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true },
    })

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    const [bugReports, total] = await Promise.all([
      prisma.bugReport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bugReport.count({ where }),
    ])

    return NextResponse.json({
      bugReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching bug reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500 }
    )
  }
}
