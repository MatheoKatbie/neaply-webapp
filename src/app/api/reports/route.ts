import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating a new report
const createReportSchema = z.object({
  entityType: z.enum(['workflow', 'store']),
  entityId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
})

// Schema for updating report status (admin only)
const updateReportSchema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']),
  resolvedBy: z.string().uuid().optional(),
})

// Helper function for authentication
async function getAuthenticatedUser() {
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

  return dbUser
}

// GET - List reports (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const entityType = searchParams.get('entityType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (entityType === 'workflow') where.workflowId = { not: null }
    if (entityType === 'store') where.storeId = { not: null }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, displayName: true, email: true }
          },
          workflow: {
            select: { id: true, title: true, slug: true, status: true }
          },
          store: {
            select: { userId: true, storeName: true, slug: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.report.count({ where })
    ])

    // Add entity type and details to reports
    const enrichedReports = reports.map((report) => ({
      ...report,
      entityType: report.workflowId ? 'workflow' : 'store',
      entityDetails: report.workflowId ? report.workflow : report.store
    }))

    return NextResponse.json({
      reports: enrichedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new report
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createReportSchema.parse(body)

    // Verify the entity exists
    if (validatedData.entityType === 'workflow') {
      const workflow = await prisma.workflow.findUnique({
        where: { id: validatedData.entityId },
        select: { id: true }
      })
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }
    } else if (validatedData.entityType === 'store') {
      const store = await prisma.sellerProfile.findUnique({
        where: { userId: validatedData.entityId },
        select: { userId: true }
      })
      if (!store) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 })
      }
    }

    // Check if user has already reported this entity
    const whereClause: any = {
      reporterId: user.id,
      status: { in: ['open', 'reviewing'] }
    }
    
    if (validatedData.entityType === 'workflow') {
      whereClause.workflowId = validatedData.entityId
    } else {
      whereClause.storeId = validatedData.entityId
    }
    
    const existingReport = await prisma.report.findFirst({ where: whereClause })

    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this item' }, { status: 400 })
    }

    const reportData: any = {
      reporterId: user.id,
      reason: validatedData.reason,
      description: validatedData.description,
    }
    
    if (validatedData.entityType === 'workflow') {
      reportData.workflowId = validatedData.entityId
    } else {
      reportData.storeId = validatedData.entityId
    }
    
    const report = await prisma.report.create({
      data: reportData,
      include: {
        reporter: {
          select: { id: true, displayName: true, email: true }
        }
      }
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
