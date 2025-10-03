'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Cpu,
  Globe,
  Layers,
  Play,
  RefreshCw,
  Settings,
  Shield,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

interface WorkflowAnalysisModalProps {
  workflowId: string
  trigger?: React.ReactNode
}

interface WorkflowAnalysisData {
  nodeCount: number
  nodeTypes: { [key: string]: number }
  triggerNodes: Array<{
    type: string
    name: string
    description?: string
  }>
  actionNodes: Array<{
    type: string
    name: string
    description?: string
  }>
  integrations: Array<{
    name: string
    type: 'trigger' | 'action' | 'both'
    nodeCount: number
  }>
  complexity: {
    level: 'simple' | 'medium' | 'complex' | 'expert'
    score: number
    factors: string[]
  }
  estimatedExecutionTime: {
    min: number
    max: number
    average: number
  }
  dataFlow: {
    inputDataTypes: string[]
    outputDataTypes: string[]
    transformations: string[]
  }
  automation: {
    triggers: string[]
    schedules: string[]
    webhooks: string[]
    manualTriggers: boolean
  }
  security: {
    hasAuthentication: boolean
    hasDataValidation: boolean
    hasErrorHandling: boolean
    hasRateLimiting: boolean
  }
  maintenance: {
    updateFrequency: 'low' | 'medium' | 'high'
    dependencies: string[]
    externalServices: string[]
  }
  workflow: {
    id: string
    title: string
    shortDesc: string
    platform?: string
    seller: any
    stats: {
      reviews: number
      favorites: number
      sales: number
    }
    version: {
      semver: string
      n8nMinVersion?: string
      n8nMaxVersion?: string
    }
  }
}

export function WorkflowAnalysisModal({ workflowId, trigger }: WorkflowAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<WorkflowAnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

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
      setError('Failed to load workflow analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && !analysis && !loading) {
      fetchAnalysis()
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'simple':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'complex':
        return 'bg-orange-100 text-orange-800'
      case 'expert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-muted text-gray-800'
    }
  }

  const getUpdateFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-muted text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Advanced Analysis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-aeonikpro text-xl">
            <BarChart3 className="w-5 h-5" />
            Advanced Workflow Analysis
          </DialogTitle>
          <DialogDescription className="font-aeonikpro">
            Detailed technical analysis of the workflow structure and capabilities
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-6 rounded w-1/3 mb-2" style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}></div>
              <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}></div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-32 rounded-xl" style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}></div>
              <div className="h-24 rounded-xl" style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}></div>
              <div className="h-40 rounded-xl" style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#9DA2B3' }} />
            <h3 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
              Analysis Unavailable
            </h3>
            <p className="font-aeonikpro mb-4" style={{ color: '#9DA2B3' }}>
              {error}
            </p>
            <button
              onClick={fetchAnalysis}
              className="px-6 py-2.5 rounded-full font-aeonikpro font-medium bg-white text-black hover:bg-gray-100 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Complexity and Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
                    style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                  >
                    <div className="p-4 border-b border-[#9DA2B3]/25">
                      <h3
                        className="font-aeonikpro text-lg font-semibold flex items-center gap-2"
                        style={{ color: '#EDEFF7' }}
                      >
                        <Cpu className="w-4 h-4" />
                        Complexity
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            Level
                          </span>
                          <div
                            className={`px-3 py-1 rounded-full font-aeonikpro text-xs font-medium ${getComplexityColor(
                              analysis.complexity.level
                            )}`}
                          >
                            {analysis.complexity.level.charAt(0).toUpperCase() + analysis.complexity.level.slice(1)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            Score
                          </span>
                          <span className="font-aeonikpro font-medium" style={{ color: '#EDEFF7' }}>
                            {analysis.complexity.score}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            Factors:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {analysis.complexity.factors.map((factor, index) => (
                              <div
                                key={index}
                                className="px-2 py-1 rounded-full font-aeonikpro text-xs border border-[#9DA2B3]/25"
                                style={{ color: '#D3D6E0' }}
                              >
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
                    style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                  >
                    <div className="p-4 border-b border-[#9DA2B3]/25">
                      <h3
                        className="font-aeonikpro text-lg font-semibold flex items-center gap-2"
                        style={{ color: '#EDEFF7' }}
                      >
                        <Clock className="w-4 h-4" />
                        Performance
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            Min Time
                          </span>
                          <span className="font-aeonikpro font-medium" style={{ color: '#EDEFF7' }}>
                            {formatTime(analysis.estimatedExecutionTime.min)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            Average
                          </span>
                          <span className="font-aeonikpro font-medium" style={{ color: '#EDEFF7' }}>
                            {formatTime(analysis.estimatedExecutionTime.average)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            Max Time
                          </span>
                          <span className="font-aeonikpro font-medium" style={{ color: '#EDEFF7' }}>
                            {formatTime(analysis.estimatedExecutionTime.max)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Summary */}
                <div
                  className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                >
                  <div className="p-4 border-b border-[#9DA2B3]/25">
                    <h3
                      className="font-aeonikpro text-lg font-semibold flex items-center gap-2"
                      style={{ color: '#EDEFF7' }}
                    >
                      <Layers className="w-4 h-4" />
                      Workflow Structure
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      >
                        <div className="font-aeonikpro text-2xl font-bold text-blue-500">{analysis.nodeCount}</div>
                        <div className="font-aeonikpro text-sm mt-1" style={{ color: '#9DA2B3' }}>
                          Total Nodes
                        </div>
                      </div>
                      <div
                        className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                      >
                        <div className="font-aeonikpro text-2xl font-bold text-green-500">
                          {analysis.triggerNodes.length}
                        </div>
                        <div className="font-aeonikpro text-sm mt-1" style={{ color: '#9DA2B3' }}>
                          Trigger Nodes
                        </div>
                      </div>
                      <div
                        className="text-center p-4 rounded-xl border border-[#9DA2B3]/25"
                        style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                      >
                        <div className="font-aeonikpro text-2xl font-bold text-purple-500">
                          {analysis.actionNodes.length}
                        </div>
                        <div className="font-aeonikpro text-sm mt-1" style={{ color: '#9DA2B3' }}>
                          Action Nodes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integrations */}
                <div
                  className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                >
                  <div className="p-4 border-b border-[#9DA2B3]/25">
                    <h3
                      className="font-aeonikpro text-lg font-semibold flex items-center gap-2"
                      style={{ color: '#EDEFF7' }}
                    >
                      <Globe className="w-4 h-4" />
                      Integrations
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {analysis.integrations.map((integration, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#9DA2B3]/25"
                          style={{ backgroundColor: 'rgba(120, 153, 168, 0.05)' }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-aeonikpro font-medium" style={{ color: '#EDEFF7' }}>
                              {integration.name}
                            </span>
                            <div
                              className="px-2 py-1 rounded-full font-aeonikpro text-xs border border-[#9DA2B3]/25"
                              style={{ color: '#D3D6E0' }}
                            >
                              {integration.type}
                            </div>
                          </div>
                          <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                            {integration.nodeCount} nodes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-6">
                {/* Data Flow */}
                <div
                  className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                >
                  <div className="p-4 border-b border-[#9DA2B3]/25">
                    <h3
                      className="font-aeonikpro text-lg font-semibold flex items-center gap-2"
                      style={{ color: '#EDEFF7' }}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      Data Flow
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4
                          className="font-aeonikpro font-medium mb-2 flex items-center gap-2"
                          style={{ color: '#EDEFF7' }}
                        >
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          Input Data
                        </h4>
                        <div className="space-y-1">
                          {analysis.dataFlow.inputDataTypes.length > 0 ? (
                            analysis.dataFlow.inputDataTypes.map((type, index) => (
                              <div
                                key={index}
                                className="px-2 py-1 rounded-full font-aeonikpro text-xs border border-[#9DA2B3]/25 inline-block mr-1"
                                style={{ color: '#D3D6E0' }}
                              >
                                {type}
                              </div>
                            ))
                          ) : (
                            <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                              No input data detected
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4
                          className="font-aeonikpro font-medium mb-2 flex items-center gap-2"
                          style={{ color: '#EDEFF7' }}
                        >
                          <Settings className="w-4 h-4 text-blue-500" />
                          Transformations
                        </h4>
                        <div className="space-y-1">
                          {analysis.dataFlow.transformations.length > 0 ? (
                            analysis.dataFlow.transformations.map((transformation, index) => (
                              <div
                                key={index}
                                className="px-2 py-1 rounded-full font-aeonikpro text-xs border border-[#9DA2B3]/25 inline-block mr-1"
                                style={{ color: '#D3D6E0' }}
                              >
                                {transformation}
                              </div>
                            ))
                          ) : (
                            <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                              No transformations detected
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4
                          className="font-aeonikpro font-medium mb-2 flex items-center gap-2"
                          style={{ color: '#EDEFF7' }}
                        >
                          <ArrowLeft className="w-4 h-4 text-purple-500" />
                          Output Data
                        </h4>
                        <div className="space-y-1">
                          {analysis.dataFlow.outputDataTypes.length > 0 ? (
                            analysis.dataFlow.outputDataTypes.map((type, index) => (
                              <div
                                key={index}
                                className="px-2 py-1 rounded-full font-aeonikpro text-xs border border-[#9DA2B3]/25 inline-block mr-1"
                                style={{ color: '#D3D6E0' }}
                              >
                                {type}
                              </div>
                            ))
                          ) : (
                            <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                              No output data detected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Types */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Node Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(analysis.nodeTypes).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-2 bg-background rounded">
                          <span className="text-sm font-medium truncate">{type.split('.').pop()}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="space-y-6">
                {/* Triggers */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Automation Triggers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.automation.webhooks.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            Webhooks ({analysis.automation.webhooks.length})
                          </h4>
                          <div className="space-y-1">
                            {analysis.automation.webhooks.map((webhook, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {webhook}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.automation.schedules.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Scheduled ({analysis.automation.schedules.length})
                          </h4>
                          <div className="space-y-1">
                            {analysis.automation.schedules.map((schedule, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {schedule}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.automation.manualTriggers && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Play className="w-4 h-4 text-purple-600" />
                            Manual Triggers
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            Manual execution available
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Authentication</span>
                          {analysis.security.hasAuthentication ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Validation</span>
                          {analysis.security.hasDataValidation ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Error Handling</span>
                          {analysis.security.hasErrorHandling ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate Limiting</span>
                          {analysis.security.hasRateLimiting ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Maintenance Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Update Frequency</span>
                        <Badge className={getUpdateFrequencyColor(analysis.maintenance.updateFrequency)}>
                          {analysis.maintenance.updateFrequency.charAt(0).toUpperCase() +
                            analysis.maintenance.updateFrequency.slice(1)}
                        </Badge>
                      </div>

                      {analysis.maintenance.externalServices.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">External Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.maintenance.externalServices.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.maintenance.dependencies.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Dependencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.maintenance.dependencies.map((dependency, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {dependency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
