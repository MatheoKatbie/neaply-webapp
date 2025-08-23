'use client'

import { Button } from '@/components/ui/button'
import { WorkflowCardMini } from '@/components/ui/workflow-card-mini'
import { useRouter } from 'next/navigation'

interface WorkflowRecommendation {
  id: string
  title: string
  shortDesc: string
  price: number
  currency: string
  rating: number
  ratingCount: number
  salesCount: number
  heroImage?: string
  platform?: string
  isNew?: boolean
  isTrending?: boolean
  categories: string[]
  tags: string[]
  slug: string
  seller: {
    displayName: string
    storeName?: string
    slug?: string
  }
  version: string
}

interface RecommendationsProps {
  similarWorkflows: WorkflowRecommendation[]
  storeWorkflows: WorkflowRecommendation[]
  storeName: string
  storeSlug?: string
  loading?: boolean
}

export function Recommendations({
  similarWorkflows,
  storeWorkflows,
  storeName,
  storeSlug,
  loading = false,
}: RecommendationsProps) {
  const router = useRouter()

  // Combine all workflows for display
  const allWorkflows = [...similarWorkflows, ...storeWorkflows]

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (allWorkflows.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Recommendations</h2>
        <p className="text-muted-foreground">
          {similarWorkflows.length > 0 && storeWorkflows.length > 0
            ? `Similar workflows and more from ${storeName}`
            : similarWorkflows.length > 0
            ? 'Similar workflows you might like'
            : `More workflows from ${storeName}`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {allWorkflows.map((workflow) => (
          <div key={workflow.id} className="flex-shrink-0 h-full">
            <WorkflowCardMini {...workflow} className="h-full" />
          </div>
        ))}
      </div>

      {storeWorkflows.length > 4 && storeSlug && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push(`/store/${storeSlug}`)}>
            View All Workflows from {storeName}
          </Button>
        </div>
      )}
    </div>
  )
}
