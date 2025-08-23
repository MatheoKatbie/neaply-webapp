export interface Workflow {
  id: string
  title: string
  slug: string
  shortDesc: string
  longDescMd?: string
  heroImageUrl?: string
  status: 'draft' | 'published' | 'unlisted' | 'disabled'
  basePriceCents: number
  currency: string
  salesCount: number
  ratingAvg: number
  ratingCount: number
  createdAt: string
  updatedAt: string
  sellerId: string
  seller: {
    displayName: string
    sellerProfile?: {
      storeName: string
      slug: string
    }
  }
  categories?: {
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
  tags?: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  versions?: WorkflowVersion[]
  plans?: PricingPlan[]
  _count?: {
    reviews: number
    favorites: number
    orderItems: number
  }
}

export interface WorkflowVersion {
  id: string
  workflowId: string
  semver: string
  changelogMd?: string
  n8nMinVersion?: string
  n8nMaxVersion?: string
  jsonFileUrl?: string
  jsonContent?: any // n8n workflow JSON structure
  extraAssets?: any
  isLatest: boolean
  createdAt: string
}

export interface PricingPlan {
  id: string
  workflowId: string
  name: string
  priceCents: number
  currency: string
  features: string[]
  isActive: boolean
  sortOrder: number
}

export interface WorkflowFormData {
  title: string
  shortDesc: string
  longDescMd: string
  heroImageUrl: string
  heroImageFile?: File
  basePriceCents: number
  currency: string
  status: 'draft' | 'published' | 'unlisted' | 'disabled'
  platform?: string
  jsonContent?: any
  jsonFile?: File
  n8nMinVersion?: string
  n8nMaxVersion?: string
  categoryIds?: string[]
  tagIds?: string[]
}

// n8n workflow JSON structure types
export interface N8nWorkflow {
  name: string
  nodes: N8nNode[]
  connections: Record<string, any>
  active: boolean
  settings?: Record<string, any>
  staticData?: Record<string, any>
  pinData?: Record<string, any>
  versionId?: string
  meta?: {
    templateCredsSetupCompleted?: boolean
    instanceId?: string
  }
}

export interface N8nNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters?: Record<string, any>
  credentials?: Record<string, any>
  webhookId?: string
  disabled?: boolean
  notes?: string
  color?: string
  continueOnFail?: boolean
  alwaysOutputData?: boolean
  executeOnce?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  _count?: {
    workflows: number
  }
}

export interface Tag {
  id: string
  name: string
  slug: string
  _count?: {
    workflows: number
  }
}
