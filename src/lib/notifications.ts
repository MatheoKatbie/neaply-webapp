import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

/**
 * Create a notification for a user
 * The notification will be automatically pushed via Supabase Realtime
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata: metadata || {},
    },
  })
}

/**
 * Create a notification when a seller receives a new order
 */
export async function notifySellerNewOrder({
  sellerId,
  buyerName,
  workflowTitle,
  amount,
  orderId,
}: {
  sellerId: string
  buyerName: string
  workflowTitle: string
  amount: number
  orderId: string
}) {
  return createNotification({
    userId: sellerId,
    type: 'new_sale',
    title: 'Nouvelle vente ! 🎉',
    message: `${buyerName} a acheté "${workflowTitle}" pour ${amount.toFixed(2)}€`,
    link: `/dashboard/seller/orders`,
    metadata: { orderId, buyerName, workflowTitle, amount },
  })
}

/**
 * Create a notification when a buyer's order is confirmed
 */
export async function notifyBuyerOrderConfirmed({
  buyerId,
  workflowTitle,
  orderId,
}: {
  buyerId: string
  workflowTitle: string
  orderId: string
}) {
  return createNotification({
    userId: buyerId,
    type: 'order_confirmed',
    title: 'Commande confirmée ✅',
    message: `Votre achat de "${workflowTitle}" est confirmé. Vous pouvez maintenant le télécharger.`,
    link: `/orders`,
    metadata: { orderId, workflowTitle },
  })
}

/**
 * Create a notification when a seller receives a new review
 */
export async function notifySellerNewReview({
  sellerId,
  reviewerName,
  workflowTitle,
  rating,
  reviewId,
}: {
  sellerId: string
  reviewerName: string
  workflowTitle: string
  rating: number
  reviewId: string
}) {
  const stars = '⭐'.repeat(rating)
  return createNotification({
    userId: sellerId,
    type: 'new_review',
    title: 'Nouvel avis reçu',
    message: `${reviewerName} a laissé un avis ${stars} sur "${workflowTitle}"`,
    link: `/dashboard/seller/reviews`,
    metadata: { reviewId, reviewerName, workflowTitle, rating },
  })
}

/**
 * Create a notification when a workflow the user bought is updated
 */
export async function notifyBuyerWorkflowUpdated({
  buyerId,
  workflowTitle,
  workflowId,
  versionNumber,
}: {
  buyerId: string
  workflowTitle: string
  workflowId: string
  versionNumber: string
}) {
  return createNotification({
    userId: buyerId,
    type: 'workflow_updated',
    title: 'Mise à jour disponible 🔄',
    message: `"${workflowTitle}" a été mis à jour (v${versionNumber}). Téléchargez la nouvelle version !`,
    link: `/orders`,
    metadata: { workflowId, workflowTitle, versionNumber },
  })
}

/**
 * Create a notification for system announcements
 */
export async function notifySystemAnnouncement({
  userId,
  title,
  message,
  link,
}: {
  userId: string
  title: string
  message: string
  link?: string
}) {
  return createNotification({
    userId,
    type: 'system',
    title,
    message,
    link,
  })
}

/**
 * Create a notification when a payout is processed
 */
export async function notifySellerPayoutProcessed({
  sellerId,
  amount,
  payoutId,
}: {
  sellerId: string
  amount: number
  payoutId: string
}) {
  return createNotification({
    userId: sellerId,
    type: 'payout_sent',
    title: 'Paiement envoyé 💰',
    message: `Un virement de ${amount.toFixed(2)}€ a été initié vers votre compte bancaire.`,
    link: `/dashboard/seller/payouts`,
    metadata: { payoutId, amount },
  })
}

/**
 * Notify all buyers of a workflow about an update
 */
export async function notifyAllBuyersWorkflowUpdated({
  workflowId,
  workflowTitle,
  versionNumber,
}: {
  workflowId: string
  workflowTitle: string
  versionNumber: string
}) {
  // Get all users who purchased this workflow
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          workflowId,
        },
      },
      status: 'paid',
    },
    select: {
      userId: true,
    },
    distinct: ['userId'],
  })

  // Create notifications for all buyers
  const notifications = orders.map((order) =>
    notifyBuyerWorkflowUpdated({
      buyerId: order.userId,
      workflowTitle,
      workflowId,
      versionNumber,
    })
  )

  return Promise.all(notifications)
}

/**
 * Create a notification when someone follows a store
 */
export async function notifySellerNewFollower({
  sellerId,
  followerName,
  followerId,
  storeSlug,
}: {
  sellerId: string
  followerName: string
  followerId: string
  storeSlug: string
}) {
  return createNotification({
    userId: sellerId,
    type: 'new_follower',
    title: 'Nouveau follower ! 👥',
    message: `${followerName} suit maintenant votre store`,
    link: `/store/${storeSlug}`,
    metadata: { followerId, followerName },
  })
}

/**
 * Notify all followers of a store when a new workflow is published
 */
export async function notifyFollowersNewWorkflow({
  sellerId,
  storeName,
  storeSlug,
  workflowId,
  workflowTitle,
  workflowSlug,
}: {
  sellerId: string
  storeName: string
  storeSlug: string
  workflowId: string
  workflowTitle: string
  workflowSlug: string
}) {
  // Get all followers of this store
  const followers = await prisma.storeFollow.findMany({
    where: { sellerId },
    select: { followerId: true },
  })

  if (followers.length === 0) return []

  // Create notifications for all followers
  const notifications = followers.map((follow) =>
    createNotification({
      userId: follow.followerId,
      type: 'store_new_workflow',
      title: `Nouveau workflow de ${storeName} 🆕`,
      message: `"${workflowTitle}" vient d'être publié`,
      link: `/workflow/${workflowSlug}`,
      metadata: {
        sellerId,
        storeName,
        storeSlug,
        workflowId,
        workflowTitle,
        workflowSlug,
      },
    })
  )

  return Promise.all(notifications)
}

/**
 * Create a notification when an order is refunded
 */
export async function notifyBuyerOrderRefunded({
  buyerId,
  workflowTitle,
  orderId,
  amount,
}: {
  buyerId: string
  workflowTitle: string
  orderId: string
  amount: number
}) {
  return createNotification({
    userId: buyerId,
    type: 'order_refunded',
    title: 'Remboursement effectué 💸',
    message: `Votre achat de "${workflowTitle}" a été remboursé (${amount.toFixed(2)}€)`,
    link: `/orders`,
    metadata: { orderId, workflowTitle, amount },
  })
}

/**
 * Create a notification when a seller responds to a review
 */
export async function notifyBuyerReviewResponse({
  buyerId,
  sellerName,
  workflowTitle,
  reviewId,
}: {
  buyerId: string
  sellerName: string
  workflowTitle: string
  reviewId: string
}) {
  return createNotification({
    userId: buyerId,
    type: 'review_response',
    title: 'Réponse à votre avis 💬',
    message: `${sellerName} a répondu à votre avis sur "${workflowTitle}"`,
    link: `/workflow/${reviewId}`,
    metadata: { reviewId, sellerName, workflowTitle },
  })
}

/**
 * Create a notification when a workflow is approved by admin
 */
export async function notifySellerWorkflowApproved({
  sellerId,
  workflowTitle,
  workflowSlug,
}: {
  sellerId: string
  workflowTitle: string
  workflowSlug: string
}) {
  return createNotification({
    userId: sellerId,
    type: 'workflow_approved',
    title: 'Workflow approuvé ✅',
    message: `"${workflowTitle}" a été approuvé et est maintenant visible sur le marketplace`,
    link: `/workflow/${workflowSlug}`,
    metadata: { workflowTitle, workflowSlug },
  })
}

/**
 * Create a notification when a workflow is rejected by admin
 */
export async function notifySellerWorkflowRejected({
  sellerId,
  workflowTitle,
  reason,
}: {
  sellerId: string
  workflowTitle: string
  reason?: string
}) {
  return createNotification({
    userId: sellerId,
    type: 'workflow_rejected',
    title: 'Workflow refusé ❌',
    message: reason 
      ? `"${workflowTitle}" n'a pas été approuvé : ${reason}` 
      : `"${workflowTitle}" n'a pas été approuvé. Vérifiez les guidelines.`,
    link: `/dashboard/seller`,
    metadata: { workflowTitle, reason },
  })
}

/**
 * Create a welcome notification for new users
 */
export async function notifyWelcome({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  return createNotification({
    userId,
    type: 'welcome',
    title: `Bienvenue ${userName} ! 🎉`,
    message: 'Découvrez les meilleurs workflows d\'automatisation sur Neaply',
    link: '/marketplace',
    metadata: { userName },
  })
}
