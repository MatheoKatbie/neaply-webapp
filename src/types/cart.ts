export interface CartItem {
  id: string
  cartId: string
  workflowId: string
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
        slug?: string
      }
    }
  }
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

export interface AddToCartRequest {
  workflowId: string
}
