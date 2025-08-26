import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { getLatestWorkflowVersionWithDecryptedContent } from '@/lib/workflow-version'
import JSZip from 'jszip'

async function getAuthenticatedUser() {
    const supabase = await createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    return user
}

async function userOwnsPack(userId: string, packId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
        where: {
            userId,
            status: 'paid',
            packItems: {
                some: {
                    packId,
                },
            },
        },
    })

    return !!order
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: packId } = await params

        // Get authenticated user
        const user = await getAuthenticatedUser()

        // Check if user owns the pack
        const ownsPack = await userOwnsPack(user.id, packId)
        if (!ownsPack) {
            return NextResponse.json(
                { error: 'You do not own this pack' },
                { status: 403 }
            )
        }

        // Get pack with all workflows
        const pack = await prisma.workflowPack.findUnique({
            where: { id: packId },
            include: {
                workflows: {
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                shortDesc: true,
                                longDescMd: true,
                                documentationUrl: true,
                            }
                        }
                    },
                    orderBy: { sortOrder: 'asc' }
                }
            }
        })

        if (!pack) {
            return NextResponse.json(
                { error: 'Pack not found' },
                { status: 404 }
            )
        }

        // Create ZIP file
        const zip = new JSZip()

        // Add README file for the pack
        const readmeContent = `# ${pack.title}

${pack.longDescMd || pack.shortDesc}

## Included Workflows

This pack contains ${pack.workflows.length} workflows:

${pack.workflows.map((pw, index) => `${index + 1}. ${pw.workflow.title}`).join('\n')}

## Installation Instructions

1. Import each workflow file into your n8n instance
2. Configure the necessary credentials for each workflow
3. Activate the workflows as needed

## Support

If you need help with these workflows, please contact the seller through the FlowMarket platform.

---
Downloaded from FlowMarket
Pack ID: ${pack.id}
`

        zip.file('README.md', readmeContent)

        // Process each workflow in the pack
        for (const packWorkflow of pack.workflows) {
            try {
                const workflowVersion = await getLatestWorkflowVersionWithDecryptedContent(packWorkflow.workflow.id)

                if (workflowVersion && workflowVersion.jsonContent) {
                    // Clean filename
                    const cleanTitle = packWorkflow.workflow.title.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim()
                    const filename = `${cleanTitle.replace(/\s+/g, '_')}.json`

                    // Add workflow JSON to zip
                    zip.file(filename, JSON.stringify(workflowVersion.jsonContent, null, 2))

                    // If workflow has a documentation file in storage, fetch and include it
                    try {
                        const docUrl = (packWorkflow.workflow as any).documentationUrl as string | undefined
                        if (docUrl) {
                            let fileBuffer: ArrayBuffer | null = null
                            let fileName = 'documentation'

                            // Support formats:
                            // - Absolute URL (https://...)
                            // - storage://bucket/path/to/file.ext
                            // - bucket/path/to/file.ext
                            if (/^https?:\/\//i.test(docUrl)) {
                                const res = await fetch(docUrl)
                                if (res.ok) {
                                    fileBuffer = await res.arrayBuffer()
                                    const urlPath = new URL(docUrl)
                                    fileName = urlPath.pathname.split('/').pop() || fileName
                                }
                            } else {
                                // Use Supabase Storage signed URL to fetch private file
                                const storageRef = docUrl.replace(/^storage:\/\//, '')
                                const firstSlash = storageRef.indexOf('/')
                                const bucket = storageRef.slice(0, firstSlash)
                                const path = storageRef.slice(firstSlash + 1)
                                const supabase = await createClient()
                                const { data: signed, error: signErr } = await supabase.storage
                                    .from(bucket)
                                    .createSignedUrl(path, 60)
                                if (!signErr && signed?.signedUrl) {
                                    const res = await fetch(signed.signedUrl)
                                    if (res.ok) {
                                        fileBuffer = await res.arrayBuffer()
                                        fileName = path.split('/').pop() || fileName
                                    }
                                }
                            }

                            if (fileBuffer) {
                                const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/)
                                const ext = extMatch ? `.${extMatch[1]}` : ''
                                zip.file(`${cleanTitle.replace(/\s+/g, '_')}_DOCUMENTATION${ext}`, fileBuffer)
                            }
                        }
                    } catch (docErr) {
                        console.error(`Failed to include documentation for workflow ${packWorkflow.workflow.id}:`, docErr)
                    }
                }
            } catch (error) {
                console.error(`Error processing workflow ${packWorkflow.workflow.id}:`, error)
                // Continue with other workflows even if one fails
            }
        }

        // Generate ZIP buffer
        const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })

        // Create response with ZIP file
        const response = new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${pack.title.replace(/[^a-zA-Z0-9]/g, '_')}_pack.zip"`,
                'Content-Length': zipBuffer.byteLength.toString(),
            },
        })

        return response
    } catch (error) {
        console.error('Error downloading pack:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Please log in to download this pack' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to download pack' },
            { status: 500 }
        )
    }
}
