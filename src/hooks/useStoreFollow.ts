'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface UseStoreFollowReturn {
  isFollowing: boolean
  followersCount: number
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  follow: () => Promise<void>
  unfollow: () => Promise<void>
  toggle: () => Promise<void>
}

export function useStoreFollow(sellerId: string): UseStoreFollowReturn {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!sellerId) return
      
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/stores/${sellerId}/follow`)
        if (!response.ok) throw new Error('Failed to fetch follow status')
        
        const data = await response.json()
        setIsFollowing(data.isFollowing)
        setFollowersCount(data.followersCount)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowStatus()
  }, [sellerId, user])

  const follow = useCallback(async () => {
    if (!user || isUpdating) return

    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/stores/${sellerId}/follow`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to follow store')
      }

      const data = await response.json()
      setIsFollowing(true)
      setFollowersCount(data.followersCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }, [sellerId, user, isUpdating])

  const unfollow = useCallback(async () => {
    if (!user || isUpdating) return

    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/stores/${sellerId}/follow`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unfollow store')
      }

      const data = await response.json()
      setIsFollowing(false)
      setFollowersCount(data.followersCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }, [sellerId, user, isUpdating])

  const toggle = useCallback(async () => {
    if (isFollowing) {
      await unfollow()
    } else {
      await follow()
    }
  }, [isFollowing, follow, unfollow])

  return {
    isFollowing,
    followersCount,
    isLoading,
    isUpdating,
    error,
    follow,
    unfollow,
    toggle,
  }
}
