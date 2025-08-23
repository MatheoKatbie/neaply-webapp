import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { getLatestWorkflowVersionWithDecryptedContent } from '@/lib/workflow-version'
import JSZip from 'jszip'

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
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json' // 'json' or 'zip'

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

    // Get latest version with decrypted content
    const latestVersion = await getLatestWorkflowVersionWithDecryptedContent(workflowId)

    if (!latestVersion.jsonContent) {
      return NextResponse.json({ error: 'Workflow content not available' }, { status: 404 })
    }

    if (format === 'zip') {
      // Create a ZIP file with JSON and documentation
      const zip = new JSZip()
      
      // Add the workflow JSON
      const workflowJson = {
        workflow: latestVersion.jsonContent,
        metadata: {
          title: workflow.title,
          version: latestVersion.semver,
          downloadedAt: new Date().toISOString(),
        },
      }
      
      zip.file(`${workflow.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`, JSON.stringify(workflowJson, null, 2))
      
      // Add documentation as markdown
      const documentation = `# ${workflow.title}

## Description
${workflow.shortDesc || 'No description available'}

${workflow.longDescMd || ''}

## Version Information
- **Version**: ${latestVersion.semver}
- **Downloaded**: ${new Date().toLocaleDateString()}

## Installation Instructions

### For n8n:
1. Copy the JSON content from the \`${workflow.title.replace(/[^a-zA-Z0-9]/g, '_')}.json\` file
2. Open your n8n instance
3. Click on "Import from Clipboard" or use Ctrl+V
4. Paste the JSON content
5. Configure any required credentials and connections

### For Zapier:
1. Create a new Zap in Zapier
2. Use the workflow structure as a reference to recreate the automation
3. Configure triggers and actions based on the workflow nodes

## Support
For support with this workflow, please contact the seller through the FlowMarket platform.

---
*Downloaded from FlowMarket - The Ultimate n8n Workflow Marketplace*
`
      
      zip.file('README.md', documentation)
      
      // Generate the ZIP file
      const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })
      
      // Return the ZIP file
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${workflow.title.replace(/[^a-zA-Z0-9]/g, '_')}_workflow.zip"`,
        },
      })
    } else {
      // Return JSON format for copy to clipboard
      return NextResponse.json({
        workflow: latestVersion.jsonContent,
        metadata: {
          title: workflow.title,
          version: latestVersion.semver,
          downloadedAt: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('Download API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
