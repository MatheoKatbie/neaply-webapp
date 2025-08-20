'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { N8nWorkflow, N8nNode, WorkflowPreview } from '@/types/workflow'

interface WorkflowPreviewProps {
    workflow: N8nWorkflow | null
}

function analyzeWorkflow(workflow: N8nWorkflow): WorkflowPreview {
    const nodes = workflow.nodes || []
    const nodeTypes = [...new Set(nodes.map(node => node.type))]

    // Check for webhooks
    const hasWebhooks = nodes.some(node =>
        node.type.toLowerCase().includes('webhook') ||
        node.type.toLowerCase().includes('trigger')
    )

    // Check for credentials
    const hasCredentials = nodes.some(node =>
        node.credentials && Object.keys(node.credentials).length > 0
    )

    // Get required credentials
    const requiredCredentials = [...new Set(
        nodes
            .filter(node => node.credentials)
            .flatMap(node => Object.keys(node.credentials || {}))
    )]

    // Estimate complexity based on node count and connections
    let estimatedComplexity: 'simple' | 'medium' | 'complex' = 'simple'
    if (nodes.length > 20) {
        estimatedComplexity = 'complex'
    } else if (nodes.length > 5) {
        estimatedComplexity = 'medium'
    }

    return {
        nodeCount: nodes.length,
        nodeTypes,
        hasWebhooks,
        hasCredentials,
        estimatedComplexity,
        requiredCredentials,
        description: workflow.name
    }
}

function getNodeTypeIcon(nodeType: string): string {
    const iconMap: Record<string, string> = {
        'webhook': '🔗',
        'http': '🌐',
        'email': '📧',
        'slack': '💬',
        'googlesheets': '📊',
        'discord': '🎮',
        'twitter': '🐦',
        'notion': '📝',
        'airtable': '🗂️',
        'code': '⚡',
        'function': '⚡',
        'set': '🔧',
        'if': '🔀',
        'switch': '🔀',
        'merge': '🔗',
        'split': '✂️',
        'wait': '⏱️',
        'cron': '⏰',
        'schedule': '📅',
        'manual': '👆',
        'start': '▶️'
    }

    const lowerType = nodeType.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerType.includes(key)) {
            return icon
        }
    }
    return '🔧'
}

function getComplexityColor(complexity: string): string {
    switch (complexity) {
        case 'simple': return 'bg-green-100 text-green-800'
        case 'medium': return 'bg-yellow-100 text-yellow-800'
        case 'complex': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export function WorkflowPreview({ workflow }: WorkflowPreviewProps) {
    if (!workflow) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Workflow Preview</CardTitle>
                    <CardDescription>
                        Upload or paste a workflow JSON to see preview
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        No workflow data to preview
                    </div>
                </CardContent>
            </Card>
        )
    }

    const preview = analyzeWorkflow(workflow)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Workflow Preview</CardTitle>
                <CardDescription>
                    Analysis of your n8n workflow
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{preview.nodeCount}</div>
                        <div className="text-xs text-gray-500">Nodes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{preview.nodeTypes.length}</div>
                        <div className="text-xs text-gray-500">Node Types</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl">{preview.hasWebhooks ? '✅' : '❌'}</div>
                        <div className="text-xs text-gray-500">Webhooks</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl">{preview.hasCredentials ? '🔐' : '🔓'}</div>
                        <div className="text-xs text-gray-500">Credentials</div>
                    </div>
                </div>

                {/* Workflow Name */}
                {workflow.name && (
                    <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Workflow Name</h4>
                        <p className="text-sm bg-gray-50 p-2 rounded">{workflow.name}</p>
                    </div>
                )}

                {/* Complexity */}
                <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Complexity</h4>
                    <Badge className={getComplexityColor(preview.estimatedComplexity)}>
                        {preview.estimatedComplexity.charAt(0).toUpperCase() + preview.estimatedComplexity.slice(1)}
                    </Badge>
                </div>

                {/* Node Types */}
                {preview.nodeTypes.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Node Types</h4>
                        <div className="flex flex-wrap gap-1">
                            {preview.nodeTypes.slice(0, 10).map((nodeType) => (
                                <Badge key={nodeType} variant="outline" className="text-xs">
                                    {getNodeTypeIcon(nodeType)} {nodeType}
                                </Badge>
                            ))}
                            {preview.nodeTypes.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                    +{preview.nodeTypes.length - 10} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Required Credentials */}
                {preview.requiredCredentials.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Required Credentials</h4>
                        <div className="flex flex-wrap gap-1">
                            {preview.requiredCredentials.map((cred) => (
                                <Badge key={cred} variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                                    🔑 {cred}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-yellow-600 mt-2">
                            ⚠️ Buyers will need to configure these credentials
                        </p>
                    </div>
                )}

                {/* Warnings & Recommendations */}
                <div className="space-y-2">
                    {preview.hasWebhooks && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="text-sm text-blue-800">
                                <strong>ℹ️ Webhook Detected:</strong> This workflow uses webhooks.
                                Make sure to document the webhook configuration in your description.
                            </div>
                        </div>
                    )}

                    {preview.hasCredentials && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <div className="text-sm text-yellow-800">
                                <strong>⚠️ Credentials Required:</strong> This workflow requires external service credentials.
                                Make sure to list all required services in your description.
                            </div>
                        </div>
                    )}

                    {preview.estimatedComplexity === 'complex' && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-3">
                            <div className="text-sm text-orange-800">
                                <strong>🚀 Complex Workflow:</strong> This is a complex workflow with many nodes.
                                Consider providing detailed setup instructions and documentation.
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
