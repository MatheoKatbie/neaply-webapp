import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a seller
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isSeller: true },
    })

    if (!dbUser?.isSeller) {
      return NextResponse.json({ error: 'User is not a seller' }, { status: 403 })
    }

    // Check if seller has pending orders that would prevent deletion
    const pendingOrders = await prisma.order.count({
      where: {
        items: {
          some: {
            workflow: {
              sellerId: user.id,
            },
          },
        },
        status: 'pending',
      },
    })

    if (pendingOrders > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete store with pending orders. Please wait for all orders to be processed.',
        },
        { status: 409 }
      )
    }

    // Use transaction to delete store and clean up all related data
    await prisma.$transaction(async (tx) => {
      // First, disable all workflows (set status to 'disabled')
      await tx.workflow.updateMany({
        where: { sellerId: user.id },
        data: { status: 'disabled' },
      })

      // Delete all workflow-related data
      await tx.workflowVersion.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      await tx.workflowCategory.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      await tx.workflowTag.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      await tx.workflowCompatibility.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all reviews for seller's workflows
      await tx.review.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all favorites for seller's workflows
      await tx.favorite.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all reports for seller's workflows
      await tx.report.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all order items for seller's workflows
      await tx.orderItem.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all cart items for seller's workflows
      await tx.cartItem.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all workflow pack items for seller's workflows
      await tx.workflowPackItem.deleteMany({
        where: {
          workflow: { sellerId: user.id },
        },
      })

      // Delete all workflow packs created by the seller
      await tx.workflowPack.deleteMany({
        where: { sellerId: user.id },
      })

      // Delete all payouts for the seller
      await tx.payout.deleteMany({
        where: { sellerId: user.id },
      })

      // Delete seller profile (this will cascade to related data)
      await tx.sellerProfile.delete({
        where: { userId: user.id },
      })

      // Update user to no longer be a seller
      await tx.user.update({
        where: { id: user.id },
        data: { isSeller: false },
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'store.delete',
          entityType: 'store',
          entityId: null, // No specific entity ID for store deletion
          metadata: {
            reason: 'User requested store deletion',
            workflowsDisabled: true,
            dataCleaned: true,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully. All workflows have been disabled and related data has been cleaned up.',
    })
  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
