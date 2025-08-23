import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { analyzeWorkflow } from '@/lib/workflow-analyzer'
import { safeDecrypt } from '@/lib/encryption'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }

    // Get the workflow with the latest version
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        versions: {
          where: { isLatest: true },
          take: 1,
        },
        seller: {
          select: {
            displayName: true,
            sellerProfile: {
              select: {
                storeName: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            orderItems: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Check if workflow is published
    if (workflow.status !== 'published') {
      return NextResponse.json({ error: 'Workflow not available' }, { status: 404 })
    }

    // Get the latest version
    const latestVersion = workflow.versions[0]
    if (!latestVersion || !latestVersion.jsonContent) {
      return NextResponse.json({ error: 'No workflow content available' }, { status: 404 })
    }

    // Decrypt the JSON content for analysis
    const decryptedContent = safeDecrypt(latestVersion.jsonContent)

    // Analyze the workflow
    const analysis = analyzeWorkflow(decryptedContent)

    // Add workflow metadata to the analysis
    const enhancedAnalysis = {
      ...analysis,
      workflow: {
        id: workflow.id,
        title: workflow.title,
        shortDesc: workflow.shortDesc,
        platform: workflow.platform,
        seller: workflow.seller,
        stats: {
          reviews: workflow._count.reviews,
          favorites: workflow._count.favorites,
          sales: workflow._count.orderItems,
        },
        version: {
          semver: latestVersion.semver,
          n8nMinVersion: latestVersion.n8nMinVersion,
          n8nMaxVersion: latestVersion.n8nMaxVersion,
        },
      },
    }

    return NextResponse.json({
      data: enhancedAnalysis,
      message: 'Workflow analysis generated successfully',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
