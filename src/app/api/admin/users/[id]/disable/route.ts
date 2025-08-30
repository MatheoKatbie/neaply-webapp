import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for disabling/enabling user
const disableUserSchema = z.object({
  disabled: z.boolean(),
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
    select: { id: true, isAdmin: true },
  })

  return dbUser
}

// PATCH - Disable/Enable user and their seller profile (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const validatedData = disableUserSchema.parse(body)

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from disabling themselves
    if (targetUser.id === user.id) {
      return NextResponse.json({ error: 'Cannot disable your own account' }, { status: 400 })
    }

    // Prevent disabling other admins
    if (targetUser.isAdmin) {
      return NextResponse.json({ error: 'Cannot disable admin accounts' }, { status: 400 })
    }

    const updates: any[] = []

    // Update seller profile status if user has one
    if (targetUser.sellerProfile) {
      const newStatus = validatedData.disabled ? 'suspended' : 'active'
      updates.push(
        prisma.sellerProfile.update({
          where: { userId: id },
          data: { status: newStatus },
        })
      )

      // If disabling, also unpublish all their workflows
      if (validatedData.disabled) {
        updates.push(
          prisma.workflow.updateMany({
            where: {
              sellerId: id,
              status: { in: ['published', 'unlisted'] },
            },
            data: { status: 'disabled' },
          })
        )
      }
    }

    // Log the action
    updates.push(
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: validatedData.disabled ? 'user.disable' : 'user.enable',
          entityType: 'user',
          entityId: id,
          metadata: {
            reason: validatedData.reason,
            targetUserEmail: targetUser.email,
            hadSellerProfile: !!targetUser.sellerProfile,
          },
        },
      })
    )

    // Execute all updates in a transaction
    await prisma.$transaction(updates)

    // Fetch updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
      },
    })

    return NextResponse.json({
      user: updatedUser,
      message: `User ${validatedData.disabled ? 'disabled' : 'enabled'} successfully`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
