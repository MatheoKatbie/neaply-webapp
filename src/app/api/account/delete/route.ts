import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the user ID from the request (user is deleting their own account)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify the user exists and get their data
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isSeller: true,
        email: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        userId: userId,
        status: { in: ['pending'] },
      },
    })

    if (pendingOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with pending orders. Please wait for orders to complete or cancel them.' },
        { status: 409 }
      )
    }

    // Use a transaction to delete all user-related data
    await prisma.$transaction(async (tx) => {
      if (dbUser.isSeller) {
        // For sellers, transfer workflows to system user instead of deleting
        const systemUser = await tx.user.upsert({
          where: { email: 'system@neaply.com' },
          update: {},
          create: {
            email: 'system@neaply.com',
            displayName: 'System (Orphaned Workflows)',
            isSeller: false,
            isAdmin: false,
          },
        })

        const systemUserId = systemUser.id

        // Get all workflows belonging to the user
        const userWorkflows = await tx.workflow.findMany({
          where: { sellerId: userId },
        })

        // Transfer each workflow to system user
        for (const workflow of userWorkflows) {
          await tx.workflow.update({
            where: { id: workflow.id },
            data: {
              status: 'disabled',
              sellerId: systemUserId,
              title: `[DELETED] ${workflow.title}`,
              shortDesc: 'This workflow was transferred after the seller deleted their account.',
            },
          })

          // Update workflow version changelog
          await tx.workflowVersion.updateMany({
            where: { workflowId: workflow.id },
            data: {
              changelogMd: 'Workflow ownership transferred to system after seller account deletion.',
            },
          })
        }

        // Final check: ensure no workflows remain linked to the user
        const remainingWorkflows = await tx.workflow.count({
          where: { sellerId: userId },
        })

        if (remainingWorkflows > 0) {
          // Force transfer any remaining workflows
          await tx.workflow.updateMany({
            where: { sellerId: userId },
            data: {
              status: 'disabled',
              sellerId: systemUserId,
              title: 'DELETED_WORKFLOW',
              shortDesc: 'Workflow transferred after seller account deletion',
            },
          })
        }

        // Delete seller-specific data
        await tx.sellerProfile.deleteMany({ where: { userId } })
        await tx.workflowPack.deleteMany({ where: { sellerId: userId } })
        await tx.payout.deleteMany({ where: { sellerId: userId } })
      }

      // Delete all other user data
      await tx.order.deleteMany({ where: { userId } })
      await tx.review.deleteMany({ where: { userId } })
      await tx.favorite.deleteMany({ where: { userId } })
      await tx.cart.deleteMany({ where: { userId } })
      await tx.report.deleteMany({ where: { reporterId: userId } })
      await tx.auditLog.deleteMany({ where: { userId } })

      // Finally, delete the user
      await tx.user.delete({ where: { id: userId } })
    })

    // Delete the user from Supabase Auth using service role
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting user from Supabase Auth:', deleteAuthError)
      // Even if Supabase Auth deletion fails, the database cleanup succeeded
      // We'll return a partial success message
      return NextResponse.json({
        success: true,
        message:
          'Account data deleted successfully, but there was an issue with authentication cleanup. Please contact support.',
        warning: 'Authentication cleanup incomplete',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting account:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
