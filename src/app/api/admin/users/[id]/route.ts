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

        // Update user
        const updatedUser = await prisma.user.update({
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
                            status: body.sellerProfile?.status || 'active',
                            slug: body.sellerProfile?.slug || ''
                        },
                        update: {
                            storeName: body.sellerProfile?.storeName || '',
                            bio: body.sellerProfile?.bio || '',
                            websiteUrl: body.sellerProfile?.websiteUrl || '',
                            phoneNumber: body.sellerProfile?.phoneNumber || '',
                            countryCode: body.sellerProfile?.countryCode || '',
                            status: body.sellerProfile?.status || 'active'
                        }
                    }
                } : undefined
            },
            include: {
                sellerProfile: true
            }
        })

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
