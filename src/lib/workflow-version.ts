import { prisma } from '@/lib/prisma'

interface CreateVersionData {
    workflowId: bigint
    jsonContent: any
    n8nMinVersion?: string | null
    n8nMaxVersion?: string | null
    semver?: string
}

export async function createWorkflowVersion(data: CreateVersionData) {
    const { workflowId, jsonContent, n8nMinVersion, n8nMaxVersion, semver } = data

    // Get current latest version to determine next semver
    const currentLatest = await prisma.workflowVersion.findFirst({
        where: { workflowId, isLatest: true }
    })

    let nextSemver = semver || '1.0.0'

    if (currentLatest && !semver) {
        // Auto-increment version (patch version)
        const [major, minor, patch] = currentLatest.semver.split('.').map(Number)
        nextSemver = `${major}.${minor}.${patch + 1}`
    }

    return await prisma.$transaction(async (tx) => {
        // Set current latest to false
        if (currentLatest) {
            await tx.workflowVersion.updateMany({
                where: { workflowId, isLatest: true },
                data: { isLatest: false }
            })
        }

        // Create new version
        return await tx.workflowVersion.create({
            data: {
                workflowId,
                semver: nextSemver,
                jsonContent,
                n8nMinVersion: n8nMinVersion || null,
                n8nMaxVersion: n8nMaxVersion || null,
                isLatest: true
            }
        })
    })
}

export async function updateWorkflowVersion(
    workflowId: bigint,
    jsonContent: any,
    n8nMinVersion?: string | null,
    n8nMaxVersion?: string | null
) {
    // Check if there's an existing version to update or if we need to create a new one
    const existingVersion = await prisma.workflowVersion.findFirst({
        where: { workflowId, isLatest: true }
    })

    if (existingVersion) {
        // Update existing version
        return await prisma.workflowVersion.update({
            where: { id: existingVersion.id },
            data: {
                jsonContent,
                n8nMinVersion: n8nMinVersion || null,
                n8nMaxVersion: n8nMaxVersion || null
            }
        })
    } else {
        // Create new version
        return await createWorkflowVersion({
            workflowId,
            jsonContent,
            n8nMinVersion,
            n8nMaxVersion
        })
    }
}
