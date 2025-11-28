'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { 
  Bell, 
  ShoppingBag, 
  Star, 
  RefreshCw, 
  CreditCard, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Info,
  Trash2,
  Check,
  CheckCheck,
  ArrowLeft,
  Loader2,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

// Get icon based on notification type
function getNotificationIcon(type: string) {
  const iconProps = { className: 'w-5 h-5' }
  
  switch (type) {
    case 'new_sale':
      return <ShoppingBag {...iconProps} className="w-5 h-5 text-green-400" />
    case 'order_confirmed':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-400" />
    case 'order_refunded':
      return <XCircle {...iconProps} className="w-5 h-5 text-red-400" />
    case 'new_review':
      return <Star {...iconProps} className="w-5 h-5 text-yellow-400" />
    case 'review_response':
      return <MessageSquare {...iconProps} className="w-5 h-5 text-blue-400" />
    case 'workflow_updated':
      return <RefreshCw {...iconProps} className="w-5 h-5 text-purple-400" />
    case 'workflow_approved':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-400" />
    case 'workflow_rejected':
      return <XCircle {...iconProps} className="w-5 h-5 text-red-400" />
    case 'payout_sent':
      return <CreditCard {...iconProps} className="w-5 h-5 text-emerald-400" />
    case 'welcome':
      return <Bell {...iconProps} className="w-5 h-5 text-blue-400" />
    case 'system':
      return <Info {...iconProps} className="w-5 h-5 text-orange-400" />
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-[#9DA2B3]" />
  }
}

// Get background color based on notification type
function getNotificationBgColor(type: string): string {
  switch (type) {
    case 'new_sale':
    case 'order_confirmed':
    case 'workflow_approved':
      return 'bg-green-500/10'
    case 'order_refunded':
    case 'workflow_rejected':
      return 'bg-red-500/10'
    case 'new_review':
      return 'bg-yellow-500/10'
    case 'workflow_updated':
      return 'bg-purple-500/10'
    case 'payout_sent':
      return 'bg-emerald-500/10'
    case 'review_response':
    case 'welcome':
      return 'bg-blue-500/10'
    case 'system':
      return 'bg-orange-500/10'
    default:
      return 'bg-[#40424D]/50'
  }
}

type FilterType = 'all' | 'unread' | 'read'

export default function NotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications()

  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/notifications')
    }
  }, [user, authLoading, router])

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead([notification.id])
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  // Handle select/deselect notification
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Handle select all
  const selectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)))
    }
  }

  // Handle mark selected as read
  const markSelectedAsRead = async () => {
    const unreadSelected = Array.from(selectedIds).filter(
      (id) => !notifications.find((n) => n.id === id)?.isRead
    )
    if (unreadSelected.length > 0) {
      await markAsRead(unreadSelected)
    }
    setSelectedIds(new Set())
  }

  // Handle delete selected
  const deleteSelected = async () => {
    setIsDeleting(true)
    for (const id of selectedIds) {
      await deleteNotification(id)
    }
    setSelectedIds(new Set())
    setIsDeleting(false)
  }

  // Handle delete all
  const handleDeleteAll = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      setIsDeleting(true)
      await deleteAllNotifications()
      setIsDeleting(false)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08080A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#9DA2B3]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#08080A]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-[#40424D]/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#9DA2B3]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#EDEFF7]">Notifications</h1>
              <p className="text-sm text-[#9DA2B3]">
                {unreadCount > 0 
                  ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes les notifications sont lues'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#9DA2B3] hover:text-[#EDEFF7] hover:bg-[#40424D]/50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Tout marquer comme lu</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tout supprimer</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 bg-[#1A1A1D] rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-[#40424D] text-[#EDEFF7]'
                  : 'text-[#9DA2B3] hover:text-[#EDEFF7]'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === 'unread'
                  ? 'bg-[#40424D] text-[#EDEFF7]'
                  : 'text-[#9DA2B3] hover:text-[#EDEFF7]'
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === 'read'
                  ? 'bg-[#40424D] text-[#EDEFF7]'
                  : 'text-[#9DA2B3] hover:text-[#EDEFF7]'
              }`}
            >
              Lues ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-4 mb-4 bg-[#1A1A1D] border border-[#40424D] rounded-lg">
            <span className="text-sm text-[#9DA2B3]">
              {selectedIds.size} notification{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={markSelectedAsRead}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#EDEFF7] bg-[#40424D] hover:bg-[#50525D] rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Marquer comme lu
              </button>
              <button
                onClick={deleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Select all checkbox */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <button
              onClick={selectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectedIds.size === filteredNotifications.length && selectedIds.size > 0
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-[#40424D] hover:border-[#9DA2B3]'
              }`}
            >
              {selectedIds.size === filteredNotifications.length && selectedIds.size > 0 && (
                <Check className="w-3 h-3 text-white" />
              )}
            </button>
            <span className="text-sm text-[#9DA2B3]">Tout sélectionner</span>
          </div>
        )}

        {/* Notifications list */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#9DA2B3]" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#40424D]/50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#9DA2B3]" />
            </div>
            <h3 className="text-lg font-semibold text-[#EDEFF7] mb-2">
              {filter === 'all' 
                ? 'Aucune notification'
                : filter === 'unread'
                ? 'Aucune notification non lue'
                : 'Aucune notification lue'
              }
            </h3>
            <p className="text-sm text-[#9DA2B3] max-w-md">
              {filter === 'all'
                ? "Vous n'avez pas encore reçu de notifications. Elles apparaîtront ici."
                : 'Changez de filtre pour voir vos autres notifications.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.isRead
                    ? 'bg-[#1A1A1D] border-[#40424D]/50 hover:border-[#40424D]'
                    : 'bg-[#1E1E24] border-[#40424D] hover:border-[#9DA2B3]/50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => toggleSelect(notification.id, e)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedIds.has(notification.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-[#40424D] hover:border-[#9DA2B3]'
                  }`}
                >
                  {selectedIds.has(notification.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>

                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-medium ${notification.isRead ? 'text-[#9DA2B3]' : 'text-[#EDEFF7]'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${notification.isRead ? 'text-[#6B6F7B]' : 'text-[#9DA2B3]'}`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  
                  {/* Time */}
                  <p className="text-xs text-[#6B6F7B] mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 text-[#9DA2B3] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => fetchNotifications(false)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 text-sm text-[#EDEFF7] bg-[#40424D] hover:bg-[#50525D] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Charger plus'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
