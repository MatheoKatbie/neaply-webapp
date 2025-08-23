'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    BarChart3,
    Info,
    Loader2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { WorkflowAnalysisModal } from './workflow-analysis-modal'

interface WorkflowAnalysisPreviewProps {
  className?: string
  workflowId?: string
}

interface WorkflowAnalysisData {
  nodeCount: number
  nodeTypes: { [key: string]: number }
  integrations: Array<{
    name: string
    type: 'trigger' | 'action' | 'both'
    nodeCount: number
  }>
  complexity: {
    level: 'simple' | 'medium' | 'complex' | 'expert'
    score: number
  }
  estimatedExecutionTime: {
    min: number
    max: number
    average: number
  }
}

export function WorkflowAnalysisPreview({ className, workflowId }: WorkflowAnalysisPreviewProps) {
  const [analysis, setAnalysis] = useState<WorkflowAnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workflowId) return

    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/workflows/${workflowId}/analysis`)

        if (!response.ok) {
          throw new Error('Failed to load workflow analysis')
        }

        const data = await response.json()
        setAnalysis(data.data)
      } catch (error) {
        console.error('Error fetching workflow analysis:', error)
        setError('Failed to load analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [workflowId])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const getComplexityText = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  const getNodeTypesCount = () => {
    if (!analysis) return '0'
    return Object.keys(analysis.nodeTypes).length.toString()
  }

  const getIntegrationsCount = () => {
    if (!analysis) return '0'
    return analysis.integrations.length.toString()
  }

  const getAvgRuntime = () => {
    if (!analysis) return '0s'
    return formatTime(analysis.estimatedExecutionTime.average)
  }

  const getComplexity = () => {
    if (!analysis) return 'Unknown'
    return getComplexityText(analysis.complexity.level)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">Technical Analysis Preview</h4>
              <p className="text-sm text-muted-foreground">
                Get detailed insights into workflow structure, complexity, and capabilities
              </p>
            </div>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-muted-foreground">Loading analysis...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">Technical Analysis Preview</h4>
              <p className="text-sm text-muted-foreground">
                Get detailed insights into workflow structure, complexity, and capabilities
              </p>
            </div>
            <div className="text-center py-8">
              <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">Technical Analysis Preview</h4>
            <p className="text-sm text-muted-foreground">
              Get detailed insights into workflow structure, complexity, and capabilities
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-foreground">{getNodeTypesCount()}</div>
              <div className="text-xs text-muted-foreground">Node Types</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-foreground">{getIntegrationsCount()}</div>
              <div className="text-xs text-muted-foreground">Integrations</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-foreground">{getAvgRuntime()}</div>
              <div className="text-xs text-muted-foreground">Avg Runtime</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-foreground">{getComplexity()}</div>
              <div className="text-xs text-muted-foreground">Complexity</div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <h5 className="font-medium mb-2">Ready to dive deeper?</h5>
            <p className="text-sm text-muted-foreground mb-3">
              Access comprehensive technical analysis with detailed breakdowns and insights
            </p>
            {workflowId ? (
              <WorkflowAnalysisModal
                workflowId={workflowId}
                trigger={
                  <Button variant="outline" className="bg-background border-border text-muted-foreground hover:bg-background">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Advanced Analysis
                  </Button>
                }
              />
            ) : (
              <Button variant="outline" className="bg-background border-border text-muted-foreground hover:bg-background">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Advanced Analysis
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
