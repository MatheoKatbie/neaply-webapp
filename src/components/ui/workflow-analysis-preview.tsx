'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Info, Loader2 } from 'lucide-react'
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
          // Check if it's an HTML error page (auth redirect, etc)
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('text/html')) {
            setError('Please sign in to view technical analysis')
          } else {
            setError('Failed to load workflow analysis')
          }
          return
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          setError('Invalid response format. Please try again.')
          return
        }

        const data = await response.json()
        setAnalysis(data.data || data)
      } catch (error) {
        console.error('Error fetching workflow analysis:', error)
        if (error instanceof SyntaxError) {
          setError('Failed to parse response. Please sign in to view analysis.')
        } else {
          setError('Failed to load analysis')
        }
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
      <div
        className={`rounded-xl border border-[#9DA2B3]/25 overflow-hidden ${className}`}
        style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
      >
        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
                Technical Analysis Preview
              </h4>
              <p className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                Get detailed insights into workflow structure, complexity, and capabilities
              </p>
            </div>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7899A8' }} />
              <span className="ml-2 font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                Loading analysis...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`rounded-xl border border-[#9DA2B3]/25 overflow-hidden ${className}`}
        style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
      >
        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
                Technical Analysis Preview
              </h4>
              <p className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                Get detailed insights into workflow structure, complexity, and capabilities
              </p>
            </div>
            <div className="text-center py-8">
              <Info className="w-8 h-8 mx-auto mb-2" style={{ color: '#9DA2B3' }} />
              <p className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border border-[#9DA2B3]/25 overflow-hidden ${className}`}
      style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
    >
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h4 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
              Technical Analysis Preview
            </h4>
            <p className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
              Get detailed insights into workflow structure, complexity, and capabilities
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
              style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
            >
              <div className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                {getNodeTypesCount()}
              </div>
              <div className="font-aeonikpro text-xs mt-1" style={{ color: '#9DA2B3' }}>
                Node Types
              </div>
            </div>
            <div
              className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
              style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
            >
              <div className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                {getIntegrationsCount()}
              </div>
              <div className="font-aeonikpro text-xs mt-1" style={{ color: '#9DA2B3' }}>
                Integrations
              </div>
            </div>
            <div
              className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
              style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
            >
              <div className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                {getAvgRuntime()}
              </div>
              <div className="font-aeonikpro text-xs mt-1" style={{ color: '#9DA2B3' }}>
                Avg Runtime
              </div>
            </div>
            <div
              className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
              style={{ backgroundColor: 'rgba(120, 153, 168, 0.1)' }}
            >
              <div className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
                {getComplexity()}
              </div>
              <div className="font-aeonikpro text-xs mt-1" style={{ color: '#9DA2B3' }}>
                Complexity
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div
            className="text-center p-5 rounded-xl border border-[#9DA2B3]/25"
            style={{ backgroundColor: 'rgba(120, 153, 168, 0.05)' }}
          >
            <h5 className="font-aeonikpro font-semibold mb-2" style={{ color: '#EDEFF7' }}>
              Ready to dive deeper?
            </h5>
            <p className="font-aeonikpro text-sm mb-4" style={{ color: '#9DA2B3' }}>
              Access comprehensive technical analysis with detailed breakdowns and insights
            </p>
            {workflowId ? (
              <WorkflowAnalysisModal
                workflowId={workflowId}
                trigger={
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-aeonikpro text-sm font-medium border border-[#9DA2B3]/25 hover:bg-white/10 transition-all duration-300"
                    style={{ color: '#D3D6E0' }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Advanced Analysis
                  </button>
                }
              />
            ) : (
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-aeonikpro text-sm font-medium border border-[#9DA2B3]/25 hover:bg-white/10 transition-all duration-300"
                style={{ color: '#D3D6E0' }}
              >
                <BarChart3 className="w-4 h-4" />
                View Advanced Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
