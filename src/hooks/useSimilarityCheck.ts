import { useState, useCallback } from 'react'

interface SimilarWorkflow {
  title: string
  slug: string
  sellerName: string
  similarityScore: number
}

interface SimilarityCheckResult {
  isSimilar: boolean
  similarityScore: number
  warning?: string
  matchedWorkflows: SimilarWorkflow[]
}

interface UseSimilarityCheckReturn {
  checkSimilarity: (jsonContent: any, workflowId?: string) => Promise<SimilarityCheckResult | null>
  isChecking: boolean
  result: SimilarityCheckResult | null
  error: string | null
  clearResult: () => void
}

/**
 * Hook to check workflow similarity before upload
 */
export function useSimilarityCheck(): UseSimilarityCheckReturn {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<SimilarityCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkSimilarity = useCallback(async (
    jsonContent: any,
    workflowId?: string
  ): Promise<SimilarityCheckResult | null> => {
    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/workflows/check-similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonContent,
          workflowId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check similarity')
      }

      const data = await response.json()
      setResult(data.data)
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsChecking(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    checkSimilarity,
    isChecking,
    result,
    error,
    clearResult,
  }
}
