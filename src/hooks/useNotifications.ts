'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link: string | null
  metadata: any
  isRead: boolean
  createdAt: string
}

// Map Supabase snake_case to camelCase
function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.userId || row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    metadata: row.metadata,
    isRead: row.isRead ?? row.is_read ?? false,
    createdAt: row.createdAt || row.created_at,
  }
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  fetchNotifications: (reset?: boolean) => Promise<void>
  markAsRead: (notificationIds: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  refetch: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const LIMIT = 20
  
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchNotifications = useCallback(async (reset = false) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset
      const response = await fetch(
        `/api/notifications?limit=${LIMIT}&offset=${currentOffset}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()

      if (reset) {
        setNotifications(data.notifications)
        setOffset(LIMIT)
      } else {
        setNotifications((prev) => [...prev, ...data.notifications])
        setOffset((prev) => prev + LIMIT)
      }

      setUnreadCount(data.unreadCount)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [user, offset])

  // Subscribe to Supabase Realtime for notifications
  useEffect(() => {
    if (!user?.id) return

    // Create a unique channel for this user's notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          // New notification received - add to the top of the list
          const newNotification = mapNotification(payload.new)
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          // Notification updated (e.g., marked as read)
          const updatedNotification = mapNotification(payload.new)
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )
          // Recalculate unread count
          setNotifications((current) => {
            const newUnreadCount = current.filter((n) => !n.isRead).length
            setUnreadCount(newUnreadCount)
            return current
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          // Notification deleted
          const deletedId = payload.old.id
          setNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== deletedId)
            setUnreadCount(updated.filter((n) => !n.isRead).length)
            return updated
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    // Cleanup on unmount or user change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user?.id])

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user || notificationIds.length === 0) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }

      const data = await response.json()

      // Update local state (Realtime will also update but this is faster)
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }, [user])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [user])

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find((n) => n.id === notificationId)
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [user, notifications])

  const deleteAllNotifications = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications?deleteAll=true', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete all notifications')
      }

      // Update local state
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Error deleting all notifications:', err)
    }
  }, [user])

  const refetch = useCallback(async () => {
    await fetchNotifications(true)
  }, [fetchNotifications])

  // Initial fetch only - Realtime handles updates
  useEffect(() => {
    if (user) {
      fetchNotifications(true)
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
  }
}
