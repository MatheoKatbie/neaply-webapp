import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for updating report status (admin only)
const updateReportSchema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']),
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
    select: { id: true, isAdmin: true },
  })

  return dbUser
}

// GET - Get specific report details (admin only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, displayName: true, email: true },
        },
        resolver: {
          select: { id: true, displayName: true, email: true },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Get entity details
    let entityDetails = null
    if (report.workflowId) {
      entityDetails = await prisma.workflow.findUnique({
        where: { id: report.workflowId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          seller: {
            select: { displayName: true, email: true },
          },
        },
      })
    } else if (report.storeId) {
      entityDetails = await prisma.sellerProfile.findUnique({
        where: { userId: report.storeId },
        select: {
          userId: true,
          storeName: true,
          slug: true,
          status: true,
          user: {
            select: { displayName: true, email: true },
          },
        },
      })
    }

    return NextResponse.json({
      report: {
        ...report,
        entityDetails,
      },
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update report status (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = updateReportSchema.parse(body)

    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const updateData: any = {
      status: validatedData.status,
    }

    // If resolving or dismissing, set resolver and resolved date
    if (validatedData.status === 'resolved' || validatedData.status === 'dismissed') {
      updateData.resolvedBy = user.id
      updateData.resolvedAt = new Date()
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, displayName: true, email: true },
        },
        resolver: {
          select: { id: true, displayName: true, email: true },
        },
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `report.${validatedData.status}`,
        entityType: 'report',
        entityId: id,
        metadata: {
          reportEntityType: report.workflowId ? 'workflow' : 'store',
          reportEntityId: report.workflowId || report.storeId,
          reason: report.reason,
        },
      },
    })

    return NextResponse.json({ report: updatedReport })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete report (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    await prisma.report.delete({
      where: { id },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'report.delete',
        entityType: 'report',
        entityId: id,
        metadata: {
          reportEntityType: report.workflowId ? 'workflow' : 'store',
          reportEntityId: report.workflowId || report.storeId,
          reason: report.reason,
        },
      },
    })

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
