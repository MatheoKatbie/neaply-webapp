import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { getLatestWorkflowVersionWithDecryptedContent } from '@/lib/workflow-version'

// Helper function to get authenticated user
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
  })

  return dbUser
}

// Helper function to check if user owns the workflow
async function userOwnsWorkflow(userId: string, workflowId: string): Promise<boolean> {
  const purchase = await prisma.orderItem.findFirst({
    where: {
      workflowId: workflowId,
      order: {
        userId: userId,
        status: 'paid',
      },
    },
  })

  return !!purchase
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }

    const workflowId = id

    // Check if user owns this workflow
    const hasAccess = await userOwnsWorkflow(user.id, workflowId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. You must purchase this workflow to download it.' },
        { status: 403 }
      )
    }

    // Get the workflow with its latest version and decrypted content
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Get latest version with decrypted content
    const latestVersion = await getLatestWorkflowVersionWithDecryptedContent(workflowId)

    if (!latestVersion.jsonContent) {
      return NextResponse.json({ error: 'Workflow content not available' }, { status: 404 })
    }

    // Return the decrypted workflow JSON content
    return NextResponse.json({
      workflow: latestVersion.jsonContent,
      metadata: {
        title: workflow.title,
        version: latestVersion.semver,
        downloadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Download API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
