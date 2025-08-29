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
    select: { id: true, isAdmin: true }
  })

  return dbUser
}

// GET - Get specific report details (admin only)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: { id: true, displayName: true, email: true }
        },
        resolver: {
          select: { id: true, displayName: true, email: true }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Get entity details
    let entityDetails = null
    if (report.entityType === 'workflow') {
      entityDetails = await prisma.workflow.findUnique({
        where: { id: report.entityId },
        select: { 
          id: true, 
          title: true, 
          slug: true, 
          status: true,
          seller: {
            select: { displayName: true, email: true }
          }
        }
      })
    } else if (report.entityType === 'store') {
      entityDetails = await prisma.sellerProfile.findUnique({
        where: { userId: report.entityId },
        select: { 
          userId: true, 
          storeName: true, 
          slug: true, 
          status: true,
          user: {
            select: { displayName: true, email: true }
          }
        }
      })
    }

    return NextResponse.json({
      report: {
        ...report,
        entityDetails
      }
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update report status (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = updateReportSchema.parse(body)

    const report = await prisma.report.findUnique({
      where: { id: params.id }
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
      where: { id: params.id },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, displayName: true, email: true }
        },
        resolver: {
          select: { id: true, displayName: true, email: true }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `report.${validatedData.status}`,
        entityType: 'report',
        entityId: params.id,
        metadata: {
          reportEntityType: report.entityType,
          reportEntityId: report.entityId,
          reason: report.reason
        }
      }
    })

    return NextResponse.json({ report: updatedReport })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete report (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    await prisma.report.delete({
      where: { id: params.id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'report.delete',
        entityType: 'report',
        entityId: params.id,
        metadata: {
          reportEntityType: report.entityType,
          reportEntityId: report.entityId,
          reason: report.reason
        }
      }
    })

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
