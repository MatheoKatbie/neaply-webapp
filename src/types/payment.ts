export interface CreateCheckoutSessionRequest {
  workflowId: string
  pricingPlanId?: string
  successUrl?: string
  cancelUrl?: string
}

export interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string
  orderId: string
}

export interface Order {
  id: string
  userId: string
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  totalCents: number
  currency: string
  provider?: string
  providerIntent?: string
  createdAt: string
  paidAt?: string
  items: OrderItem[]
  packItems: PackItem[]
  payments: Payment[]
}

export interface OrderItem {
  id: string
  orderId: string
  workflowId: string
  pricingPlanId?: string
  unitPriceCents: number
  quantity: number
  subtotalCents: number
  workflow: {
    id: string
    title: string
    slug: string
    heroImageUrl?: string
  }
  pricingPlan?: {
    id: string
    name: string
    features: string[]
  }
}

export interface Payment {
  id: string
  orderId: string
  provider: string
  providerCharge: string
  amountCents: number
  currency: string
  status: 'succeeded' | 'failed' | 'refunded' | 'partial_refund'
  processedAt: string
  rawPayload?: any
}

// Pack purchases
export interface PackItem {
  id: string
  orderId: string
  packId: string
  unitPriceCents: number
  quantity: number
  subtotalCents: number
  pack: {
    id: string
    title: string
    slug: string
    heroImageUrl?: string
    // Included workflows in the pack (for display only)
    workflows?: Array<{
      workflowId: string
      sortOrder: number
      workflow: {
        id: string
        title: string
        slug: string
      }
    }>
  }
}

export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

export interface CheckoutSessionCompleted {
  id: string
  payment_intent: string
  customer_email?: string
  amount_total: number
  currency: string
  metadata: {
    orderId: string
    userId: string
  }
}

export interface ChargeRefunded {
  id: string
  payment_intent: string
  amount_refunded: number
  currency: string
  metadata: {
    orderId: string
  }
}
