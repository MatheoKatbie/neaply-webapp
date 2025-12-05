import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ReportStatus } from '@prisma/client'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!dbUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { status, priority } = body

        const updateData: { status?: ReportStatus; priority?: string | null } = {}

        if (status !== undefined) {
            // Validate status against ReportStatus enum values
            const validStatuses: ReportStatus[] = [
                ReportStatus.open,
                ReportStatus.reviewing,
                ReportStatus.resolved,
                ReportStatus.dismissed,
            ]
            if (!validStatuses.includes(status as ReportStatus)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
            }
            updateData.status = status as ReportStatus
        }

        if (priority !== undefined) {
            if (priority === '' || priority === null) {
                updateData.priority = null
            } else if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
                return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
            } else {
                updateData.priority = priority
            }
        }

        const updatedReport = await prisma.bugReport.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(updatedReport)
    } catch (error) {
        console.error('Error updating bug report:', error)
        return NextResponse.json({ error: 'Failed to update bug report' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!dbUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.bugReport.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting bug report:', error)
        return NextResponse.json({ error: 'Failed to delete bug report' }, { status: 500 })
    }
}
