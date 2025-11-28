'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ShoppingCart,
  Star,
  Package,
  CreditCard,
  AlertCircle,
  PartyPopper,
  Megaphone,
  X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const notificationIcons: Record<string, typeof Bell> = {
  order_confirmed: ShoppingCart,
  order_refunded: CreditCard,
  workflow_updated: Package,
  new_sale: CreditCard,
  new_review: Star,
  review_response: Star,
  payout_sent: CreditCard,
  workflow_approved: Check,
  workflow_rejected: AlertCircle,
  welcome: PartyPopper,
  system: Megaphone,
}

const notificationColors: Record<string, string> = {
  order_confirmed: 'text-green-400 bg-green-500/20',
  order_refunded: 'text-orange-400 bg-orange-500/20',
  workflow_updated: 'text-blue-400 bg-blue-500/20',
  new_sale: 'text-green-400 bg-green-500/20',
  new_review: 'text-yellow-400 bg-yellow-500/20',
  review_response: 'text-yellow-400 bg-yellow-500/20',
  payout_sent: 'text-green-400 bg-green-500/20',
  workflow_approved: 'text-green-400 bg-green-500/20',
  workflow_rejected: 'text-red-400 bg-red-500/20',
  welcome: 'text-purple-400 bg-purple-500/20',
  system: 'text-blue-400 bg-blue-500/20',
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: {
  notification: Notification
  onMarkAsRead: () => void
  onDelete: () => void
  onClick: () => void
}) {
  const Icon = notificationIcons[notification.type] || Bell
  const colorClass = notificationColors[notification.type] || 'text-gray-400 bg-gray-500/20'

  return (
    <div
      className={`group relative p-3 border-b border-[#9DA2B3]/10 last:border-0 hover:bg-[#40424D]/20 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-[#40424D]/10' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${!notification.isRead ? 'text-[#EDEFF7]' : 'text-[#9DA2B3]'}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-xs text-[#9DA2B3] mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-[#9DA2B3]/60 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions - show on hover */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead()
              }}
              className="p-1 rounded hover:bg-[#40424D]/50 text-[#9DA2B3] hover:text-[#EDEFF7]"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 rounded hover:bg-red-500/20 text-[#9DA2B3] hover:text-red-400"
            title="Delete"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead([notification.id])
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link)
      setIsOpen(false)
    }
  }

  const handleLoadMore = () => {
    fetchNotifications(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[#40424D]/30 transition-colors"
      >
        <Bell className="w-5 h-5 text-[#9DA2B3] hover:text-[#EDEFF7]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1E1E24] rounded-xl border border-[#9DA2B3]/25 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#9DA2B3]/25">
            <h3 className="text-sm font-semibold text-[#EDEFF7]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-[#9DA2B3] hover:text-[#EDEFF7] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <ScrollArea className="max-h-[400px]">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EDEFF7]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-10 h-10 text-[#9DA2B3]/30 mb-3" />
                <p className="text-sm text-[#9DA2B3]">No notifications yet</p>
                <p className="text-xs text-[#9DA2B3]/60 mt-1">We&apos;ll notify you when something happens</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead([notification.id])}
                    onDelete={() => deleteNotification(notification.id)}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="p-3 border-t border-[#9DA2B3]/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#9DA2B3] hover:text-[#EDEFF7]"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load more'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-[#9DA2B3]/25 bg-[#1E1E24]">
              <button
                onClick={() => {
                  router.push('/notifications')
                  setIsOpen(false)
                }}
                className="text-xs text-[#9DA2B3] hover:text-[#EDEFF7] transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
