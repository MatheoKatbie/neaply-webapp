import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for restricting/unrestricting seller
const restrictSellerSchema = z.object({
  restrict: z.boolean(),
  reason: z.string().optional(),
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

// POST - Restrict or unrestrict seller based on report (admin only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = restrictSellerSchema.parse(body)

    // Get the report details
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        workflow: {
          select: { 
            sellerId: true,
            seller: {
              select: { 
                id: true, 
                displayName: true,
                sellerProfile: {
                  select: { status: true, storeName: true }
                }
              }
            }
          }
        },
        store: {
          select: { 
            userId: true,
            user: {
              select: { 
                id: true, 
                displayName: true 
              }
            },
            status: true,
            storeName: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Determine the seller ID
    let sellerId: string | null = null
    let sellerName: string | null = null
    let currentStatus: string | null = null

    if (report.workflowId && report.workflow) {
      sellerId = report.workflow.sellerId
      sellerName = report.workflow.seller.displayName
      currentStatus = report.workflow.seller.sellerProfile?.status || null
    } else if (report.storeId && report.store) {
      sellerId = report.store.userId
      sellerName = report.store.user.displayName
      currentStatus = report.store.status
    }

    if (!sellerId) {
      return NextResponse.json({ 
        error: 'Cannot determine seller from this report' 
      }, { status: 400 })
    }

    // Check if seller exists and has a seller profile
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: {
        sellerProfile: true
      }
    })

    if (!seller || !seller.sellerProfile) {
      return NextResponse.json({ 
        error: 'Seller not found or does not have a seller profile' 
      }, { status: 404 })
    }

    // Prevent admin from restricting themselves
    if (seller.id === user.id) {
      return NextResponse.json({ 
        error: 'Cannot restrict your own account' 
      }, { status: 400 })
    }

    // Prevent restricting other admins
    if (seller.isAdmin) {
      return NextResponse.json({ 
        error: 'Cannot restrict admin accounts' 
      }, { status: 400 })
    }

    const updates: any[] = []
    const newStatus = validatedData.restrict ? 'suspended' : 'active'

    // Update seller profile status
    updates.push(
      prisma.sellerProfile.update({
        where: { userId: sellerId },
        data: { status: newStatus }
      })
    )

    // If restricting, disable all their workflows
    if (validatedData.restrict) {
      updates.push(
        prisma.workflow.updateMany({
          where: { 
            sellerId: sellerId,
            status: { in: ['published', 'unlisted'] }
          },
          data: { status: 'disabled' }
        })
      )

      // Also disable their workflow packs
      updates.push(
        prisma.workflowPack.updateMany({
          where: { 
            sellerId: sellerId,
            status: { in: ['published', 'unlisted'] }
          },
          data: { status: 'disabled' }
        })
      )
    } else {
      // If unrestricting, we don't automatically re-enable workflows
      // The seller will need to manually republish them
    }

    // Log the action
    updates.push(
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: validatedData.restrict ? 'seller.restrict' : 'seller.unrestrict',
          entityType: 'user',
          entityId: sellerId,
          metadata: {
            reportId: params.id,
            reason: validatedData.reason,
            previousStatus: currentStatus,
            newStatus: newStatus,
            sellerName: sellerName,
            reportType: report.workflowId ? 'workflow' : 'store'
          }
        }
      })
    )

    // Execute all updates in a transaction
    await prisma.$transaction(updates)

    // Get updated seller profile for response
    const updatedSeller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
      include: {
        user: {
          select: { displayName: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: validatedData.restrict 
        ? `Seller "${sellerName}" has been restricted` 
        : `Seller "${sellerName}" restriction has been lifted`,
      seller: updatedSeller,
      action: validatedData.restrict ? 'restricted' : 'unrestricted'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.issues 
      }, { status: 400 })
    }
    console.error('Error restricting seller:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
