'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Zap,
  Clock,
  Shield,
  Settings,
  Database,
  Code,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Network,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  GitBranch,
  Timer,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  StopCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Filter,
  Search,
  Eye,
  EyeOff,
  Download,
  Share2,
  BookOpen,
  HelpCircle,
  Star,
  Users,
  ShoppingCart,
  FileText,
  Calendar,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Link,
  ExternalLink,
  Copy,
  Check,
  X,
  Plus,
  Minus as MinusIcon,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  MoreVertical,
  RotateCcw,
  Save,
  Edit,
  Trash2,
  Archive,
  Tag,
  Hash,
  Hash as HashIcon,
  Hash as HashIcon2,
  Hash as HashIcon3,
  Hash as HashIcon4,
  Hash as HashIcon5,
  Hash as HashIcon6,
  Hash as HashIcon7,
  Hash as HashIcon8,
  Hash as HashIcon9,
  Hash as HashIcon10,
} from 'lucide-react'

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
        return 'bg-gray-100 text-gray-800'
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
        return 'bg-gray-100 text-gray-800'
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
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Advanced Workflow Analysis
          </DialogTitle>
          <DialogDescription>Detailed technical analysis of the workflow structure and capabilities</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Unavailable</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchAnalysis} className="mt-4">
              Try Again
            </Button>
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
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Complexity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Level</span>
                          <Badge className={getComplexityColor(analysis.complexity.level)}>
                            {analysis.complexity.level.charAt(0).toUpperCase() + analysis.complexity.level.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Score</span>
                          <span className="font-medium">{analysis.complexity.score}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-gray-600">Factors:</span>
                          <div className="flex flex-wrap gap-1">
                            {analysis.complexity.factors.map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Min Time</span>
                          <span className="font-medium">{formatTime(analysis.estimatedExecutionTime.min)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average</span>
                          <span className="font-medium">{formatTime(analysis.estimatedExecutionTime.average)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Max Time</span>
                          <span className="font-medium">{formatTime(analysis.estimatedExecutionTime.max)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Node Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Workflow Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{analysis.nodeCount}</div>
                        <div className="text-sm text-gray-600">Total Nodes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analysis.triggerNodes.length}</div>
                        <div className="text-sm text-gray-600">Trigger Nodes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{analysis.actionNodes.length}</div>
                        <div className="text-sm text-gray-600">Action Nodes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Integrations */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Integrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.integrations.map((integration, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{integration.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {integration.type}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">{integration.nodeCount} nodes</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="structure" className="space-y-6">
                {/* Data Flow */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      Data Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-600" />
                          Input Data
                        </h4>
                        <div className="space-y-1">
                          {analysis.dataFlow.inputDataTypes.length > 0 ? (
                            analysis.dataFlow.inputDataTypes.map((type, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No input data detected</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          Transformations
                        </h4>
                        <div className="space-y-1">
                          {analysis.dataFlow.transformations.length > 0 ? (
                            analysis.dataFlow.transformations.map((transformation, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {transformation}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No transformations detected</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4 text-purple-600" />
                          Output Data
                        </h4>
                        <div className="space-y-1">
                          {analysis.dataFlow.outputDataTypes.length > 0 ? (
                            analysis.dataFlow.outputDataTypes.map((type, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No output data detected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                        <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
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
