import { prisma } from '@/lib/prisma'
import { safeEncrypt, safeDecrypt } from '@/lib/encryption'

interface CreateVersionData {
  workflowId: string
  jsonContent: any
  n8nMinVersion?: string | null
  n8nMaxVersion?: string | null
  semver?: string
}

export async function createWorkflowVersion(data: CreateVersionData) {
  const { workflowId, jsonContent, n8nMinVersion, n8nMaxVersion, semver } = data

  // Encrypt JSON content before storing
  const encryptedJsonContent = safeEncrypt(jsonContent)

  // Get current latest version to determine next semver
  const currentLatest = await prisma.workflowVersion.findFirst({
    where: { workflowId, isLatest: true },
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
        data: { isLatest: false },
      })
    }

    // Create new version with encrypted content
    return await tx.workflowVersion.create({
      data: {
        workflowId,
        semver: nextSemver,
        jsonContent: encryptedJsonContent,
        n8nMinVersion: n8nMinVersion || null,
        n8nMaxVersion: n8nMaxVersion || null,
        isLatest: true,
      },
    })
  })
}

export async function updateWorkflowVersion(
  workflowId: string,
  jsonContent: any,
  n8nMinVersion?: string | null,
  n8nMaxVersion?: string | null
) {
  // Encrypt JSON content before storing
  const encryptedJsonContent = safeEncrypt(jsonContent)

  // Check if there's an existing version to update or if we need to create a new one
  const existingVersion = await prisma.workflowVersion.findFirst({
    where: { workflowId, isLatest: true },
  })

  if (existingVersion) {
    // Update existing version with encrypted content
    return await prisma.workflowVersion.update({
      where: { id: existingVersion.id },
      data: {
        jsonContent: encryptedJsonContent,
        n8nMinVersion: n8nMinVersion || null,
        n8nMaxVersion: n8nMaxVersion || null,
      },
    })
  } else {
    // Create new version
    return await createWorkflowVersion({
      workflowId,
      jsonContent,
      n8nMinVersion,
      n8nMaxVersion,
    })
  }
}

/**
 * Get workflow version with decrypted JSON content
 * @param versionId - The version ID to retrieve
 * @returns Workflow version with decrypted JSON content
 */
export async function getWorkflowVersionWithDecryptedContent(versionId: string) {
  const version = await prisma.workflowVersion.findUnique({
    where: { id: versionId },
  })

  if (!version) {
    throw new Error('Workflow version not found')
  }

  // Decrypt JSON content
  const decryptedContent = safeDecrypt(version.jsonContent)

  return {
    ...version,
    jsonContent: decryptedContent,
  }
}

/**
 * Get latest workflow version with decrypted JSON content
 * @param workflowId - The workflow ID
 * @returns Latest workflow version with decrypted JSON content
 */
export async function getLatestWorkflowVersionWithDecryptedContent(workflowId: string) {
  const version = await prisma.workflowVersion.findFirst({
    where: { workflowId, isLatest: true },
  })

  if (!version) {
    throw new Error('Latest workflow version not found')
  }

  // Decrypt JSON content
  const decryptedContent = safeDecrypt(version.jsonContent)

  return {
    ...version,
    jsonContent: decryptedContent,
  }
}
