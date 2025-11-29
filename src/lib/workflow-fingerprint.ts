import { prisma } from '@/lib/prisma'
import { safeDecrypt } from '@/lib/encryption'
import crypto from 'crypto'

/**
 * Structure representing a workflow's fingerprint
 */
export interface WorkflowFingerprint {
  nodeTypes: string[] // Sorted array of node types used
  nodeCount: number
  connectionCount: number
  connectionPattern: string // Hash of connection structure
  structureHash: string // Overall structural hash
}

/**
 * Result of similarity check
 */
export interface SimilarityResult {
  isSimilar: boolean
  similarityScore: number // 0-100
  matchedWorkflows: {
    workflowId: string
    workflowTitle: string
    workflowSlug: string
    sellerId: string
    sellerName: string
    similarityScore: number
  }[]
  warning?: string
}

/**
 * Extract node types from n8n workflow JSON
 */
function extractNodeTypes(jsonContent: any): string[] {
  if (!jsonContent || !jsonContent.nodes) {
    return []
  }

  const nodeTypes = jsonContent.nodes
    .map((node: any) => node.type)
    .filter(Boolean)
    .sort()

  return nodeTypes
}

/**
 * Extract and normalize connections from n8n workflow
 */
function extractConnections(jsonContent: any): string[][] {
  if (!jsonContent || !jsonContent.connections) {
    return []
  }

  const connections: string[][] = []
  const nodeNameToType: Record<string, string> = {}

  // Build node name to type mapping
  if (jsonContent.nodes) {
    jsonContent.nodes.forEach((node: any) => {
      if (node.name && node.type) {
        nodeNameToType[node.name] = node.type
      }
    })
  }

  // Extract connections using node types instead of names
  Object.entries(jsonContent.connections).forEach(([sourceName, targets]: [string, any]) => {
    const sourceType = nodeNameToType[sourceName] || 'unknown'
    
    if (targets && typeof targets === 'object') {
      Object.values(targets).forEach((outputConnections: any) => {
        if (Array.isArray(outputConnections)) {
          outputConnections.forEach((connectionGroup: any) => {
            if (Array.isArray(connectionGroup)) {
              connectionGroup.forEach((conn: any) => {
                if (conn && conn.node) {
                  const targetType = nodeNameToType[conn.node] || 'unknown'
                  connections.push([sourceType, targetType].sort())
                }
              })
            }
          })
        }
      })
    }
  })

  return connections.sort((a, b) => a.join('-').localeCompare(b.join('-')))
}

/**
 * Generate a fingerprint for a workflow JSON
 */
export function generateFingerprint(jsonContent: any): WorkflowFingerprint {
  const nodeTypes = extractNodeTypes(jsonContent)
  const connections = extractConnections(jsonContent)

  // Create connection pattern hash
  const connectionString = connections.map(c => c.join('->')).join('|')
  const connectionPattern = crypto
    .createHash('sha256')
    .update(connectionString)
    .digest('hex')
    .substring(0, 16)

  // Create overall structure hash
  const structureData = {
    nodeTypes: nodeTypes,
    connectionPattern: connectionPattern,
  }
  const structureHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(structureData))
    .digest('hex')
    .substring(0, 32)

  return {
    nodeTypes,
    nodeCount: nodeTypes.length,
    connectionCount: connections.length,
    connectionPattern,
    structureHash,
  }
}

/**
 * Calculate similarity between two fingerprints (0-100)
 */
export function calculateSimilarity(fp1: WorkflowFingerprint, fp2: WorkflowFingerprint): number {
  // If structure hash is identical, it's 100% similar
  if (fp1.structureHash === fp2.structureHash) {
    return 100
  }

  // Calculate node type similarity (Jaccard index)
  const nodeSet1 = new Set(fp1.nodeTypes)
  const nodeSet2 = new Set(fp2.nodeTypes)
  const intersection = new Set([...nodeSet1].filter(x => nodeSet2.has(x)))
  const union = new Set([...nodeSet1, ...nodeSet2])
  const nodeTypeSimilarity = union.size > 0 ? (intersection.size / union.size) * 100 : 0

  // Connection pattern similarity
  const connectionSimilarity = fp1.connectionPattern === fp2.connectionPattern ? 100 : 0

  // Node count similarity (penalize big differences)
  const countDiff = Math.abs(fp1.nodeCount - fp2.nodeCount)
  const maxCount = Math.max(fp1.nodeCount, fp2.nodeCount)
  const countSimilarity = maxCount > 0 ? ((maxCount - countDiff) / maxCount) * 100 : 100

  // Weighted average
  // Node types: 50%, Connection pattern: 35%, Node count: 15%
  const weightedSimilarity = 
    (nodeTypeSimilarity * 0.50) + 
    (connectionSimilarity * 0.35) + 
    (countSimilarity * 0.15)

  return Math.round(weightedSimilarity * 100) / 100
}

/**
 * Check if a workflow is similar to existing workflows
 * @param jsonContent - The workflow JSON to check
 * @param excludeWorkflowId - Optional workflow ID to exclude (for updates)
 * @param excludeSellerId - Optional seller ID to exclude (same seller can have similar workflows)
 * @returns Similarity check result
 */
export async function checkWorkflowSimilarity(
  jsonContent: any,
  excludeWorkflowId?: string,
  excludeSellerId?: string
): Promise<SimilarityResult> {
  const newFingerprint = generateFingerprint(jsonContent)

  // Get all published workflows with their versions
  const workflows = await prisma.workflow.findMany({
    where: {
      status: 'published',
      ...(excludeWorkflowId && { id: { not: excludeWorkflowId } }),
      ...(excludeSellerId && { sellerId: { not: excludeSellerId } }),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      sellerId: true,
      seller: {
        select: {
          displayName: true,
          sellerProfile: {
            select: {
              storeName: true,
            },
          },
        },
      },
      versions: {
        where: { isLatest: true },
        select: {
          jsonContent: true,
        },
        take: 1,
      },
    },
  })

  const matchedWorkflows: SimilarityResult['matchedWorkflows'] = []

  for (const workflow of workflows) {
    if (!workflow.versions[0]?.jsonContent) continue

    try {
      // Decrypt the stored JSON
      const decryptedContent = safeDecrypt(workflow.versions[0].jsonContent)
      if (!decryptedContent) continue

      const existingFingerprint = generateFingerprint(decryptedContent)
      const similarityScore = calculateSimilarity(newFingerprint, existingFingerprint)

      // Only include if similarity is above threshold (50%)
      if (similarityScore >= 50) {
        matchedWorkflows.push({
          workflowId: workflow.id,
          workflowTitle: workflow.title,
          workflowSlug: workflow.slug,
          sellerId: workflow.sellerId,
          sellerName: workflow.seller.sellerProfile?.storeName || workflow.seller.displayName || 'Unknown',
          similarityScore,
        })
      }
    } catch (error) {
      // Skip workflows that can't be decrypted
      console.error(`Failed to check similarity for workflow ${workflow.id}:`, error)
    }
  }

  // Sort by similarity score (highest first)
  matchedWorkflows.sort((a, b) => b.similarityScore - a.similarityScore)

  // Determine warning level
  const highestSimilarity = matchedWorkflows[0]?.similarityScore || 0
  let warning: string | undefined

  if (highestSimilarity >= 90) {
    warning = `⚠️ Ce workflow est très similaire (${highestSimilarity}%) à un workflow existant. Assurez-vous que c'est bien votre création originale.`
  } else if (highestSimilarity >= 70) {
    warning = `⚡ Ce workflow partage des similitudes (${highestSimilarity}%) avec des workflows existants. Vérifiez qu'il s'agit bien de votre propre travail.`
  } else if (highestSimilarity >= 50) {
    warning = `ℹ️ Ce workflow a quelques points communs avec d'autres workflows sur la plateforme.`
  }

  return {
    isSimilar: highestSimilarity >= 70,
    similarityScore: highestSimilarity,
    matchedWorkflows: matchedWorkflows.slice(0, 5), // Return top 5 matches
    warning,
  }
}

/**
 * Store fingerprint for a workflow version (for faster future lookups)
 * This can be called after a workflow is created/updated
 */
export function generateFingerprintHash(jsonContent: any): string {
  const fingerprint = generateFingerprint(jsonContent)
  return fingerprint.structureHash
}
