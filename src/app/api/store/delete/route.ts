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

    // Check if seller has active orders or workflows that would prevent deletion
    const activeWorkflows = await prisma.workflow.count({
      where: {
        sellerId: user.id,
        status: { in: ['published', 'unlisted'] },
      },
    })

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

    if (activeWorkflows > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete store with active workflows. Please delete or unpublish all workflows first.',
        },
        { status: 409 }
      )
    }

    if (pendingOrders > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete store with pending orders. Please wait for all orders to be processed.',
        },
        { status: 409 }
      )
    }

    // Use transaction to delete store and update user
    await prisma.$transaction(async (tx) => {
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
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
