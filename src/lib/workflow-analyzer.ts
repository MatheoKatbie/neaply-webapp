import type { WorkflowNode, WorkflowConnection } from './types/workflow'

export interface WorkflowAnalysis {
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
    min: number // seconds
    max: number // seconds
    average: number // seconds
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
}

export function analyzeWorkflow(jsonContent: any): WorkflowAnalysis {
  if (!jsonContent || !jsonContent.nodes || !Array.isArray(jsonContent.nodes)) {
    return createDefaultAnalysis()
  }

  const nodes = jsonContent.nodes as WorkflowNode[]
  const connections = jsonContent.connections || {}

  // Count nodes by type
  const nodeTypes: { [key: string]: number } = {}
  const triggerNodes: Array<{ type: string; name: string; description?: string }> = []
  const actionNodes: Array<{ type: string; name: string; description?: string }> = []

  nodes.forEach((node) => {
    const nodeType = node.type || 'unknown'
    nodeTypes[nodeType] = (nodeTypes[nodeType] || 0) + 1

    // Categorize nodes
    if (isTriggerNode(nodeType)) {
      triggerNodes.push({
        type: nodeType,
        name: node.name || 'Unnamed Trigger',
        description: extractNodeDescription(node),
      })
    } else {
      actionNodes.push({
        type: nodeType,
        name: node.name || 'Unnamed Action',
        description: extractNodeDescription(node),
      })
    }
  })

  // Analyze integrations
  const integrations = analyzeIntegrations(nodes)

  // Calculate complexity
  const complexity = calculateComplexity(nodes, connections)

  // Estimate execution time
  const executionTime = estimateExecutionTime(nodes, connections)

  // Analyze data flow
  const dataFlow = analyzeDataFlow(nodes, connections)

  // Analyze automation patterns
  const automation = analyzeAutomation(nodes)

  // Analyze security features
  const security = analyzeSecurity(nodes)

  // Analyze maintenance requirements
  const maintenance = analyzeMaintenance(nodes)

  return {
    nodeCount: nodes.length,
    nodeTypes,
    triggerNodes,
    actionNodes,
    integrations,
    complexity,
    estimatedExecutionTime: executionTime,
    dataFlow,
    automation,
    security,
    maintenance,
  }
}

function createDefaultAnalysis(): WorkflowAnalysis {
  return {
    nodeCount: 0,
    nodeTypes: {},
    triggerNodes: [],
    actionNodes: [],
    integrations: [],
    complexity: {
      level: 'simple',
      score: 0,
      factors: ['No workflow data available'],
    },
    estimatedExecutionTime: {
      min: 0,
      max: 0,
      average: 0,
    },
    dataFlow: {
      inputDataTypes: [],
      outputDataTypes: [],
      transformations: [],
    },
    automation: {
      triggers: [],
      schedules: [],
      webhooks: [],
      manualTriggers: false,
    },
    security: {
      hasAuthentication: false,
      hasDataValidation: false,
      hasErrorHandling: false,
      hasRateLimiting: false,
    },
    maintenance: {
      updateFrequency: 'low',
      dependencies: [],
      externalServices: [],
    },
  }
}

function isTriggerNode(nodeType: string): boolean {
  const triggerTypes = [
    'n8n-nodes-base.webhook',
    'n8n-nodes-base.scheduleTrigger',
    'n8n-nodes-base.cron',
    'n8n-nodes-base.manualTrigger',
    'n8n-nodes-base.pollingTrigger',
  ]
  return triggerTypes.includes(nodeType)
}

function extractNodeDescription(node: WorkflowNode): string | undefined {
  if (node.parameters?.description) return node.parameters.description
  if (node.parameters?.operation) return `Operation: ${node.parameters.operation}`
  if (node.parameters?.resource) return `Resource: ${node.parameters.resource}`
  return undefined
}

function analyzeIntegrations(
  nodes: WorkflowNode[]
): Array<{ name: string; type: 'trigger' | 'action' | 'both'; nodeCount: number }> {
  const integrationMap = new Map<string, { trigger: boolean; action: boolean; count: number }>()

  nodes.forEach((node) => {
    const integrationName = extractIntegrationName(node.type || '')
    if (!integrationName) return

    const isTrigger = isTriggerNode(node.type || '')
    const current = integrationMap.get(integrationName) || { trigger: false, action: false, count: 0 }

    integrationMap.set(integrationName, {
      trigger: current.trigger || isTrigger,
      action: current.action || !isTrigger,
      count: current.count + 1,
    })
  })

  return Array.from(integrationMap.entries()).map(([name, data]) => ({
    name,
    type: data.trigger && data.action ? 'both' : data.trigger ? 'trigger' : 'action',
    nodeCount: data.count,
  }))
}

function extractIntegrationName(nodeType: string): string {
  // Extract integration name from n8n node type
  const match = nodeType.match(/n8n-nodes-base\.(.+)/)
  if (match) {
    return match[1].split('.')[0] // Get the first part before any dot
  }
  return nodeType
}

function calculateComplexity(
  nodes: WorkflowNode[],
  connections: any
): { level: 'simple' | 'medium' | 'complex' | 'expert'; score: number; factors: string[] } {
  let score = 0
  const factors: string[] = []

  // Base score from node count
  score += nodes.length * 2
  if (nodes.length > 20) factors.push('High number of nodes')
  if (nodes.length > 50) factors.push('Very complex workflow structure')

  // Connection complexity
  const connectionCount = Object.keys(connections).length
  score += connectionCount
  if (connectionCount > nodes.length * 2) factors.push('Complex data flow')

  // Node type diversity
  const uniqueNodeTypes = new Set(nodes.map((n) => n.type)).size
  score += uniqueNodeTypes * 3
  if (uniqueNodeTypes > 10) factors.push('Multiple integration types')

  // Conditional logic
  const hasConditions = nodes.some((n) => n.type?.includes('if') || n.type?.includes('switch'))
  if (hasConditions) {
    score += 10
    factors.push('Conditional logic')
  }

  // Loops
  const hasLoops = nodes.some((n) => n.type?.includes('loop') || n.type?.includes('iterator'))
  if (hasLoops) {
    score += 15
    factors.push('Looping logic')
  }

  // Error handling
  const hasErrorHandling = nodes.some((n) => n.type?.includes('error') || n.type?.includes('catch'))
  if (hasErrorHandling) {
    score += 5
    factors.push('Error handling')
  }

  // Determine complexity level
  let level: 'simple' | 'medium' | 'complex' | 'expert'
  if (score < 30) {
    level = 'simple'
  } else if (score < 60) {
    level = 'medium'
  } else if (score < 100) {
    level = 'complex'
  } else {
    level = 'expert'
  }

  return { level, score, factors }
}

function estimateExecutionTime(nodes: WorkflowNode[], connections: any): { min: number; max: number; average: number } {
  let totalMin = 0
  let totalMax = 0
  let totalAverage = 0

  nodes.forEach((node) => {
    const nodeTime = estimateNodeExecutionTime(node)
    totalMin += nodeTime.min
    totalMax += nodeTime.max
    totalAverage += nodeTime.average
  })

  // Add overhead for connections and data transfer
  const connectionOverhead = Object.keys(connections).length * 0.5
  totalMin += connectionOverhead
  totalMax += connectionOverhead * 2
  totalAverage += connectionOverhead * 1.5

  return {
    min: Math.round(totalMin),
    max: Math.round(totalMax),
    average: Math.round(totalAverage),
  }
}

function estimateNodeExecutionTime(node: WorkflowNode): { min: number; max: number; average: number } {
  const nodeType = node.type || ''

  // Base execution times for different node types (in seconds)
  const baseTimes: { [key: string]: { min: number; max: number; average: number } } = {
    'n8n-nodes-base.webhook': { min: 0.1, max: 0.5, average: 0.2 },
    'n8n-nodes-base.httpRequest': { min: 1, max: 30, average: 5 },
    'n8n-nodes-base.function': { min: 0.1, max: 5, average: 0.5 },
    'n8n-nodes-base.if': { min: 0.1, max: 0.5, average: 0.2 },
    'n8n-nodes-base.switch': { min: 0.1, max: 0.5, average: 0.2 },
    'n8n-nodes-base.set': { min: 0.1, max: 0.5, average: 0.2 },
    'n8n-nodes-base.code': { min: 0.5, max: 10, average: 2 },
    'n8n-nodes-base.wait': { min: 1, max: 3600, average: 60 },
  }

  return baseTimes[nodeType] || { min: 1, max: 10, average: 3 }
}

function analyzeDataFlow(
  nodes: WorkflowNode[],
  connections: any
): { inputDataTypes: string[]; outputDataTypes: string[]; transformations: string[] } {
  const inputDataTypes: string[] = []
  const outputDataTypes: string[] = []
  const transformations: string[] = []

  nodes.forEach((node) => {
    const nodeType = node.type || ''

    // Analyze input data types
    if (nodeType.includes('httpRequest')) {
      inputDataTypes.push('HTTP API')
    } else if (nodeType.includes('webhook')) {
      inputDataTypes.push('Webhook')
    } else if (nodeType.includes('file')) {
      inputDataTypes.push('File')
    } else if (nodeType.includes('database')) {
      inputDataTypes.push('Database')
    }

    // Analyze transformations
    if (nodeType.includes('function') || nodeType.includes('code')) {
      transformations.push('Custom logic')
    } else if (nodeType.includes('set')) {
      transformations.push('Data mapping')
    } else if (nodeType.includes('if') || nodeType.includes('switch')) {
      transformations.push('Conditional processing')
    }

    // Analyze output data types
    if (nodeType.includes('httpRequest')) {
      outputDataTypes.push('HTTP Response')
    } else if (nodeType.includes('email')) {
      outputDataTypes.push('Email')
    } else if (nodeType.includes('slack') || nodeType.includes('discord')) {
      outputDataTypes.push('Chat notification')
    } else if (nodeType.includes('database')) {
      outputDataTypes.push('Database record')
    }
  })

  return {
    inputDataTypes: [...new Set(inputDataTypes)],
    outputDataTypes: [...new Set(outputDataTypes)],
    transformations: [...new Set(transformations)],
  }
}

function analyzeAutomation(nodes: WorkflowNode[]): {
  triggers: string[]
  schedules: string[]
  webhooks: string[]
  manualTriggers: boolean
} {
  const triggers: string[] = []
  const schedules: string[] = []
  const webhooks: string[] = []
  let manualTriggers = false

  nodes.forEach((node) => {
    const nodeType = node.type || ''

    if (nodeType.includes('webhook')) {
      webhooks.push('Webhook trigger')
    } else if (nodeType.includes('schedule') || nodeType.includes('cron')) {
      schedules.push('Scheduled trigger')
    } else if (nodeType.includes('manualTrigger')) {
      manualTriggers = true
      triggers.push('Manual trigger')
    }
  })

  return { triggers, schedules, webhooks, manualTriggers }
}

function analyzeSecurity(nodes: WorkflowNode[]): {
  hasAuthentication: boolean
  hasDataValidation: boolean
  hasErrorHandling: boolean
  hasRateLimiting: boolean
} {
  let hasAuthentication = false
  let hasDataValidation = false
  let hasErrorHandling = false
  let hasRateLimiting = false

  nodes.forEach((node) => {
    const nodeType = node.type || ''
    const parameters = node.parameters || {}

    // Check for authentication
    if (parameters.authentication || parameters.apiKey || parameters.oauth) {
      hasAuthentication = true
    }

    // Check for data validation
    if (nodeType.includes('if') || nodeType.includes('validate') || parameters.validation) {
      hasDataValidation = true
    }

    // Check for error handling
    if (nodeType.includes('error') || nodeType.includes('catch') || parameters.errorHandling) {
      hasErrorHandling = true
    }

    // Check for rate limiting
    if (parameters.rateLimit || parameters.throttle || parameters.delay) {
      hasRateLimiting = true
    }
  })

  return { hasAuthentication, hasDataValidation, hasErrorHandling, hasRateLimiting }
}

function analyzeMaintenance(nodes: WorkflowNode[]): {
  updateFrequency: 'low' | 'medium' | 'high'
  dependencies: string[]
  externalServices: string[]
} {
  const dependencies: string[] = []
  const externalServices: string[] = []
  let updateFrequency: 'low' | 'medium' | 'high' = 'low'

  nodes.forEach((node) => {
    const nodeType = node.type || ''

    // Identify external services
    if (nodeType.includes('httpRequest')) {
      externalServices.push('External API')
    } else if (nodeType.includes('slack')) {
      externalServices.push('Slack')
    } else if (nodeType.includes('discord')) {
      externalServices.push('Discord')
    } else if (nodeType.includes('email')) {
      externalServices.push('Email service')
    } else if (nodeType.includes('database')) {
      externalServices.push('Database')
    }

    // Identify dependencies
    if (nodeType.includes('function') || nodeType.includes('code')) {
      dependencies.push('Custom code')
    }
  })

  // Determine update frequency based on external dependencies
  const uniqueServices = new Set(externalServices).size
  if (uniqueServices > 5) {
    updateFrequency = 'high'
  } else if (uniqueServices > 2) {
    updateFrequency = 'medium'
  }

  return { updateFrequency, dependencies: [...new Set(dependencies)], externalServices: [...new Set(externalServices)] }
}
