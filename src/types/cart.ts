export interface CartItem {
  id: string
  cartId: string
  workflowId: string
  pricingPlanId?: string
  quantity: number
  createdAt: string
  updatedAt: string
  workflow: {
    id: string
    title: string
    slug: string
    shortDesc: string
    heroImageUrl?: string
    basePriceCents: number
    currency: string
    seller: {
      displayName: string
      storeName?: string
      slug?: string
    }
  }
  pricingPlan?: {
    id: string
    name: string
    priceCents: number
    currency: string
    features: string[]
  }
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface AddToCartRequest {
  workflowId: string
  pricingPlanId?: string
  quantity?: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface CartSummary {
  totalItems: number
  totalCents: number
  currency: string
  items: CartItem[]
}
