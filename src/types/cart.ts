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
    sellerId: string
    seller: {
      id: string
      displayName: string
      storeName?: string
      slug?: string
      sellerProfile?: {
        storeName?: string
      }
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
