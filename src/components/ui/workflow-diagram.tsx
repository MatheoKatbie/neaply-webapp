'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { N8nNode, N8nWorkflow } from '@/types/workflow'
import { useMemo } from 'react'

interface WorkflowDiagramProps {
    workflow: N8nWorkflow | null
    maxWidth?: number
    maxHeight?: number
}

interface LayoutNode extends N8nNode {
    x: number
    y: number
    width: number
    height: number
}

interface Connection {
    from: { nodeId: string; x: number; y: number }
    to: { nodeId: string; x: number; y: number }
}

function getNodeIcon(nodeType: string): string {
    const iconMap: Record<string, string> = {
        'n8n-nodes-base.start': '▶️',
        'n8n-nodes-base.manualTrigger': '👆',
        'n8n-nodes-base.webhook': '🔗',
        'n8n-nodes-base.httpRequest': '🌐',
        'n8n-nodes-base.emailSend': '📧',
        'n8n-nodes-base.slack': '💬',
        'n8n-nodes-base.googleSheets': '📊',
        'n8n-nodes-base.discord': '🎮',
        'n8n-nodes-base.twitter': '🐦',
        'n8n-nodes-base.notion': '📝',
        'n8n-nodes-base.airtable': '🗂️',
        'n8n-nodes-base.code': '⚡',
        'n8n-nodes-base.function': '⚡',
        'n8n-nodes-base.set': '🔧',
        'n8n-nodes-base.if': '🔀',
        'n8n-nodes-base.switch': '🔀',
        'n8n-nodes-base.merge': '🔗',
        'n8n-nodes-base.split': '✂️',
        'n8n-nodes-base.wait': '⏱️',
        'n8n-nodes-base.cron': '⏰',
        'n8n-nodes-base.schedule': '📅',
        'n8n-nodes-base.filter': '🔍',
        'n8n-nodes-base.itemLists': '📋',
        'n8n-nodes-base.csv': '📑',
        'n8n-nodes-base.editImage': '🖼️'
    }

    // Check exact match first
    if (iconMap[nodeType]) {
        return iconMap[nodeType]
    }

    // Check partial matches
    const lowerType = nodeType.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerType.includes(key.toLowerCase().split('.').pop() || '')) {
            return icon
        }
    }

    return '🔧'
}

function getNodeColor(nodeType: string): string {
    if (nodeType.includes('trigger') || nodeType.includes('webhook') || nodeType.includes('manual')) {
        return '#10b981' // green for triggers
    }
    if (nodeType.includes('if') || nodeType.includes('switch') || nodeType.includes('filter')) {
        return '#f59e0b' // orange for logic
    }
    if (nodeType.includes('http') || nodeType.includes('api')) {
        return '#3b82f6' // blue for HTTP
    }
    if (nodeType.includes('email') || nodeType.includes('slack') || nodeType.includes('discord')) {
        return '#8b5cf6' // purple for communication
    }
    return '#6b7280' // gray for others
}

function getNodeDisplayName(node: N8nNode): string {
    // Use the node type as the base name (these are in English by default)
    const nodeType = node.type.split('.').pop() || node.type

    // Convert camelCase and remove common prefixes
    let displayName = nodeType
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^n8n-nodes-base\./, '') // Remove n8n prefix
        .trim()

    // Capitalize first letter
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

    return displayName
}

function calculateConnectionPoints(sourceNode: LayoutNode, targetNode: LayoutNode) {
    // Calculate the center points
    const sourceCenterX = sourceNode.x + sourceNode.width / 2
    const sourceCenterY = sourceNode.y + sourceNode.height / 2
    const targetCenterX = targetNode.x + targetNode.width / 2
    const targetCenterY = targetNode.y + targetNode.height / 2

    // Determine which edges to connect based on relative positions
    let fromX, fromY, toX, toY

    if (targetCenterX > sourceCenterX) {
        // Target is to the right of source
        fromX = sourceNode.x + sourceNode.width
        fromY = sourceCenterY
        toX = targetNode.x
        toY = targetCenterY
    } else if (targetCenterX < sourceCenterX) {
        // Target is to the left of source
        fromX = sourceNode.x
        fromY = sourceCenterY
        toX = targetNode.x + targetNode.width
        toY = targetCenterY
    } else {
        // Target is above or below source
        if (targetCenterY > sourceCenterY) {
            // Target is below source
            fromX = sourceCenterX
            fromY = sourceNode.y + sourceNode.height
            toX = targetCenterX
            toY = targetNode.y
        } else {
            // Target is above source
            fromX = sourceCenterX
            fromY = sourceNode.y
            toX = targetCenterX
            toY = targetNode.y + targetNode.height
        }
    }

    return { fromX, fromY, toX, toY }
}

function calculateLayout(workflow: N8nWorkflow, maxWidth: number, maxHeight: number) {
    const nodes = workflow.nodes || []
    const connections = workflow.connections || {}

    // Node dimensions - matching n8n style
    const nodeWidth = 100
    const nodeHeight = 60
    const padding = 40

    // Use real positions from n8n if available, otherwise create organic layout
    const layoutNodes: LayoutNode[] = nodes.map((node, index) => {
        let x, y

        if (node.position && node.position.length >= 2) {
            // Use real n8n positions
            x = node.position[0]
            y = node.position[1]
        } else {
            // Fallback: create organic flow layout
            x = index * 150 + padding
            y = Math.sin(index * 0.5) * 80 + maxHeight / 2
        }

        return {
            ...node,
            x,
            y,
            width: nodeWidth,
            height: nodeHeight
        }
    })

    // Calculate bounds of all nodes
    if (layoutNodes.length > 0) {
        const minX = Math.min(...layoutNodes.map(n => n.x))
        const maxX = Math.max(...layoutNodes.map(n => n.x + n.width))
        const minY = Math.min(...layoutNodes.map(n => n.y))
        const maxY = Math.max(...layoutNodes.map(n => n.y + n.height))

        const actualWidth = maxX - minX + padding * 2
        const actualHeight = maxY - minY + padding * 2

        // Scale to fit in viewport
        const scaleX = maxWidth / actualWidth
        const scaleY = maxHeight / actualHeight
        const scale = Math.min(scaleX, scaleY, 1)

        // Apply scaling and center
        const offsetX = (maxWidth - actualWidth * scale) / 2 - minX * scale + padding
        const offsetY = (maxHeight - actualHeight * scale) / 2 - minY * scale + padding

        layoutNodes.forEach(node => {
            node.x = node.x * scale + offsetX
            node.y = node.y * scale + offsetY
            node.width = node.width * scale
            node.height = node.height * scale
        })
    }

    // Create connections with better logic
    const connectionLines: Connection[] = []

    // Process all connections from the workflow
    Object.entries(connections).forEach(([sourceNodeName, outputs]) => {
        const sourceNode = layoutNodes.find(n => n.name === sourceNodeName)
        if (!sourceNode) return

        // Process each output from this node
        Object.entries(outputs).forEach(([outputIndex, targets]) => {
            if (Array.isArray(targets)) {
                targets.forEach(target => {
                    if (target && target.node) {
                        const targetNode = layoutNodes.find(n => n.name === target.node)
                        if (targetNode) {
                            // Calculate optimal connection points
                            const { fromX, fromY, toX, toY } = calculateConnectionPoints(sourceNode, targetNode)

                            connectionLines.push({
                                from: {
                                    nodeId: sourceNode.id,
                                    x: fromX,
                                    y: fromY
                                },
                                to: {
                                    nodeId: targetNode.id,
                                    x: toX,
                                    y: toY
                                }
                            })
                        }
                    }
                })
            }
        })
    })

    // If no connections found, create simple sequential connections for visualization
    if (connectionLines.length === 0 && layoutNodes.length > 1) {
        for (let i = 0; i < layoutNodes.length - 1; i++) {
            const sourceNode = layoutNodes[i]
            const targetNode = layoutNodes[i + 1]

            // Calculate optimal connection points
            const { fromX, fromY, toX, toY } = calculateConnectionPoints(sourceNode, targetNode)

            connectionLines.push({
                from: {
                    nodeId: sourceNode.id,
                    x: fromX,
                    y: fromY
                },
                to: {
                    nodeId: targetNode.id,
                    x: toX,
                    y: toY
                }
            })
        }
    }

    return { layoutNodes, connectionLines }
}

export function WorkflowDiagram({ workflow, maxWidth = 600, maxHeight = 280 }: WorkflowDiagramProps) {
    const { layoutNodes, connectionLines } = useMemo(() => {
        if (!workflow) return { layoutNodes: [], connectionLines: [] }
        return calculateLayout(workflow, maxWidth, maxHeight)
    }, [workflow, maxWidth, maxHeight])

    if (!workflow) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Workflow Diagram</CardTitle>
                    <CardDescription>
                        Visual representation of your n8n workflow
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        No workflow data to visualize
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Workflow Diagram</CardTitle>
                <CardDescription>
                    Visual representation of "{workflow.name || 'Unnamed Workflow'}"
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative border rounded-lg bg-gray-900 overflow-hidden">
                    <svg
                        width={maxWidth}
                        height={maxHeight}
                        viewBox={`0 0 ${maxWidth} ${maxHeight}`}
                        className="w-full h-auto"
                    >
                        {/* Background grid - dark theme */}
                        <defs>
                            <pattern
                                id="grid"
                                width="20"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 20 0 L 0 0 0 20"
                                    fill="none"
                                    stroke="#374151"
                                    strokeWidth="1"
                                    opacity="0.3"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="#1f2937" />
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Connection lines */}
                        {connectionLines.map((connection, index) => (
                            <g key={index}>
                                {/* Simple straight line */}
                                <line
                                    x1={connection.from.x}
                                    y1={connection.from.y}
                                    x2={connection.to.x}
                                    y2={connection.to.y}
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    opacity="0.8"
                                />
                            </g>
                        ))}



                        {/* Nodes */}
                        {layoutNodes.map((node) => (
                            <g key={node.id}>
                                {/* Node shadow */}
                                <rect
                                    x={node.x + 2}
                                    y={node.y + 2}
                                    width={node.width}
                                    height={node.height}
                                    rx="8"
                                    fill="rgba(0,0,0,0.1)"
                                />

                                {/* Node background */}
                                <rect
                                    x={node.x}
                                    y={node.y}
                                    width={node.width}
                                    height={node.height}
                                    rx="8"
                                    fill="white"
                                    stroke={getNodeColor(node.type)}
                                    strokeWidth="2"
                                />

                                {/* Node icon */}
                                <text
                                    x={node.x + node.width / 2}
                                    y={node.y + 18}
                                    textAnchor="middle"
                                    fontSize="16"
                                >
                                    {getNodeIcon(node.type)}
                                </text>

                                {/* Node name */}
                                <text
                                    x={node.x + node.width / 2}
                                    y={node.y + 40}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#e5e7eb"
                                    fontFamily="Inter, sans-serif"
                                    fontWeight="500"
                                >
                                    {getNodeDisplayName(node).length > 12
                                        ? `${getNodeDisplayName(node).substring(0, 12)}...`
                                        : getNodeDisplayName(node)
                                    }
                                </text>

                                {/* Node type subtitle */}
                                <text
                                    x={node.x + node.width / 2}
                                    y={node.y + 52}
                                    textAnchor="middle"
                                    fontSize="8"
                                    fill="#9ca3af"
                                    fontFamily="Inter, sans-serif"
                                >
                                    {node.type.split('.').pop()}
                                </text>


                            </g>
                        ))}
                    </svg>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Triggers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Logic</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>HTTP/API</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Communication</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-background0"></div>
                        <span>Other</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
