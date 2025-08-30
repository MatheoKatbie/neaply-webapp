import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

async function getServerUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

// PUT - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication via shared supabase server client
        const { user, error: authError } = await getServerUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!currentUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()

        // Validate required fields
        if (!body.displayName || !body.email) {
            return NextResponse.json(
                { error: 'Display name and email are required' },
                { status: 400 }
            )
        }

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: body.email,
                id: { not: id }
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already taken by another user' },
                { status: 400 }
            )
        }

        // Get current seller profile status for comparison
        const currentProfile = await prisma.sellerProfile.findUnique({
            where: { userId: id },
            select: { status: true }
        })

        const oldStatus = currentProfile?.status
        const newStatus = body.sellerProfile?.status || 'active'
        const statusChanged = oldStatus && oldStatus !== newStatus

        const updates: any[] = []

        // Update user
        updates.push(
            prisma.user.update({
                where: { id },
                data: {
                    displayName: body.displayName,
                    email: body.email,
                    isAdmin: body.isAdmin,
                    isSeller: body.isSeller,
                    sellerProfile: body.isSeller ? {
                        upsert: {
                            create: {
                                storeName: body.sellerProfile?.storeName || '',
                                bio: body.sellerProfile?.bio || '',
                                websiteUrl: body.sellerProfile?.websiteUrl || '',
                                phoneNumber: body.sellerProfile?.phoneNumber || '',
                                countryCode: body.sellerProfile?.countryCode || '',
                                status: newStatus,
                                slug: body.sellerProfile?.slug || `${body.sellerProfile?.storeName || 'store'}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]/g, '-')
                            },
                            update: {
                                storeName: body.sellerProfile?.storeName || '',
                                bio: body.sellerProfile?.bio || '',
                                websiteUrl: body.sellerProfile?.websiteUrl || '',
                                phoneNumber: body.sellerProfile?.phoneNumber || '',
                                countryCode: body.sellerProfile?.countryCode || '',
                                status: newStatus
                            }
                        }
                    } : undefined
                },
                include: {
                    sellerProfile: true
                }
            })
        )

        // Handle workflow status changes when seller status changes
        if (statusChanged && body.isSeller) {
            if (newStatus === 'suspended') {
                // Disable all published workflows when seller is suspended
                updates.push(
                    prisma.workflow.updateMany({
                        where: { 
                            sellerId: id,
                            status: { in: ['published', 'unlisted'] }
                        },
                        data: { status: 'disabled' }
                    })
                )

                // Also disable their workflow packs
                updates.push(
                    prisma.workflowPack.updateMany({
                        where: { 
                            sellerId: id,
                            status: { in: ['published', 'unlisted'] }
                        },
                        data: { status: 'disabled' }
                    })
                )
            }
            // Note: We don't automatically re-enable workflows when unsuspending
            // The seller will need to manually republish their content
        }

        // Log the action
        updates.push(
            prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: statusChanged ? `user.status_change.${oldStatus}_to_${newStatus}` : 'user.update',
                    entityType: 'user',
                    entityId: id,
                    metadata: {
                        changes: {
                            displayName: body.displayName !== undefined,
                            email: body.email !== undefined,
                            isAdmin: body.isAdmin !== undefined,
                            isSeller: body.isSeller !== undefined,
                            sellerProfile: body.sellerProfile !== undefined,
                            statusChange: statusChanged ? { from: oldStatus, to: newStatus } : null
                        }
                    }
                }
            })
        )

        // Execute all updates in a transaction
        const results = await prisma.$transaction(updates)
        const updatedUser = results[0] // First update is the user update

        return NextResponse.json({
            message: 'User updated successfully',
            user: updatedUser
        })

    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication via shared supabase server client
        const { user, error: authError } = await getServerUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!currentUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        const { id } = await params

        // Prevent admin from deleting themselves
        if (id === user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        // Check if user exists
        const userToDelete = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        workflows: true,
                        orders: true,
                        reviews: true
                    }
                }
            }
        })

        if (!userToDelete) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Delete user and all related data in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete reviews
            await tx.review.deleteMany({
                where: { userId: id }
            })

            // Delete order items and orders
            const orders = await tx.order.findMany({
                where: { userId: id },
                select: { id: true }
            })

            for (const order of orders) {
                await tx.orderItem.deleteMany({
                    where: { orderId: order.id }
                })
            }

            await tx.order.deleteMany({
                where: { userId: id }
            })

            // Delete workflow versions and workflows
            const workflows = await tx.workflow.findMany({
                where: { sellerId: id },
                select: { id: true }
            })

            for (const workflow of workflows) {
                await tx.workflowVersion.deleteMany({
                    where: { workflowId: workflow.id }
                })
            }

            await tx.workflow.deleteMany({
                where: { sellerId: id }
            })

            // Delete seller profile
            await tx.sellerProfile.deleteMany({
                where: { userId: id }
            })

            // Delete favorites
            await tx.favorite.deleteMany({
                where: { userId: id }
            })

            // Delete reports
            await tx.report.deleteMany({
                where: { reporterId: id }
            })

            // Finally delete the user
            await tx.user.delete({
                where: { id }
            })
        })

        return NextResponse.json({
            message: 'User and all related data deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
