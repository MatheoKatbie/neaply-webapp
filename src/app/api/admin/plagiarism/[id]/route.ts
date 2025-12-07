import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

async function getServerUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

// GET - Fetch a specific flagged workflow with details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, error: authError } = await getServerUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!currentUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        const { id } = await params

        const workflow = await prisma.workflow.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        sellerProfile: {
                            select: {
                                storeName: true,
                                slug: true,
                            }
                        }
                    }
                },
                categories: {
                    include: {
                        category: true
                    }
                },
                versions: {
                    where: { isLatest: true },
                    take: 1,
                }
            }
        })

        if (!workflow) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        return NextResponse.json({ data: workflow })

    } catch (error) {
        console.error('Error fetching workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update workflow plagiarism status (dismiss flag or disable workflow)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, error: authError } = await getServerUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        if (!currentUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { action } = body

        const workflow = await prisma.workflow.findUnique({
            where: { id },
            select: { id: true, title: true, sellerId: true }
        })

        if (!workflow) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        let updateData: any = {}

        switch (action) {
            case 'dismiss':
                // Clear the plagiarism flag (admin determined it's not actually plagiarism)
                updateData = {
                    similarityScore: null,
                    similaritySeverity: null,
                }
                break

            case 'disable':
                // Disable the workflow due to plagiarism
                updateData = {
                    status: 'admin_disabled',
                }
                break

            case 'unpublish':
                // Set to draft (less severe than disable)
                updateData = {
                    status: 'draft',
                }
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: dismiss, disable, or unpublish' },
                    { status: 400 }
                )
        }

        const updatedWorkflow = await prisma.workflow.update({
            where: { id },
            data: updateData,
            include: {
                seller: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                    }
                }
            }
        })

        // TODO: Optionally send notification to the seller about the action taken

        return NextResponse.json({
            data: updatedWorkflow,
            message: `Workflow ${action === 'dismiss' ? 'flag dismissed' : action === 'disable' ? 'disabled' : 'unpublished'} successfully`
        })

    } catch (error) {
        console.error('Error updating workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
