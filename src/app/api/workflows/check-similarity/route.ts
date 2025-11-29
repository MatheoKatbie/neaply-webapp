import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { checkWorkflowSimilarity } from '@/lib/workflow-fingerprint'

/**
 * POST /api/workflows/check-similarity
 * Check if a workflow JSON is similar to existing workflows
 * Called before uploading/encrypting to warn the user
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is a seller
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isSeller: true },
    })

    if (!dbUser?.isSeller) {
      return NextResponse.json(
        { error: 'Seller account required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { jsonContent, workflowId } = body

    if (!jsonContent) {
      return NextResponse.json(
        { error: 'jsonContent is required' },
        { status: 400 }
      )
    }

    // Validate that jsonContent looks like an n8n workflow
    if (!jsonContent.nodes || !Array.isArray(jsonContent.nodes)) {
      return NextResponse.json(
        { error: 'Invalid workflow format: missing nodes array' },
        { status: 400 }
      )
    }

    // Check similarity (exclude current workflow if updating, and exclude own workflows)
    const result = await checkWorkflowSimilarity(
      jsonContent,
      workflowId, // Exclude current workflow if updating
      user.id // Exclude seller's own workflows
    )

    return NextResponse.json({
      success: true,
      data: {
        isSimilar: result.isSimilar,
        similarityScore: result.similarityScore,
        warning: result.warning,
        matchedWorkflows: result.matchedWorkflows.map(w => ({
          title: w.workflowTitle,
          slug: w.workflowSlug,
          sellerName: w.sellerName,
          similarityScore: w.similarityScore,
        })),
      },
    })
  } catch (error) {
    console.error('Error checking workflow similarity:', error)
    return NextResponse.json(
      { error: 'Failed to check workflow similarity' },
      { status: 500 }
    )
  }
}
