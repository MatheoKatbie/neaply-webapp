import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { getLatestWorkflowVersionWithDecryptedContent } from '@/lib/workflow-version'

// Helper function to get authenticated admin user
async function getAuthenticatedAdmin() {
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

    if (!dbUser?.isAdmin) {
        return null
    }

    return dbUser
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAuthenticatedAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { id } = await params

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(id)) {
            return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
        }

        // Get the workflow with its latest version
        const workflow = await prisma.workflow.findUnique({
            where: { id },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        })

        if (!workflow) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        // Get decrypted content
        const latestVersion = await getLatestWorkflowVersionWithDecryptedContent(id)
        
        if (!latestVersion || !latestVersion.jsonContent) {
            return NextResponse.json({ error: 'Workflow content not found' }, { status: 404 })
        }

        // Return JSON content
        return NextResponse.json({
            workflowId: workflow.id,
            title: workflow.title,
            slug: workflow.slug,
            version: latestVersion.semver,
            jsonContent: latestVersion.jsonContent,
        })
    } catch (error) {
        console.error('Error downloading workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
