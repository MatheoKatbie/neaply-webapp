export interface WorkflowNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters?: any
  credentials?: any
  webhookId?: string
  continueOnFail?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
  timeout?: number
  notes?: string
  alwaysOutputData?: boolean
  executeOnce?: boolean
  disabled?: boolean
  continueOnFail?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
  timeout?: number
  notes?: string
  alwaysOutputData?: boolean
  executeOnce?: boolean
  disabled?: boolean
}

export interface WorkflowConnection {
  [nodeId: string]: {
    main: Array<{
      source: string
      target: string
      sourceOutput: string
      targetInput: string
    }>
  }
}

export interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection
  active: boolean
  settings?: {
    executionOrder?: 'v1' | 'v2'
    saveExecutionProgress?: boolean
    saveManualExecutions?: boolean
    callerPolicy?: string
    errorWorkflow?: string
    timezone?: string
  }
  staticData?: any
  tags?: string[]
  triggerCount?: number
  updatedAt?: string
  versionId?: string
}
