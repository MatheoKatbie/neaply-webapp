'use client'

import { useStoreFollow } from '@/hooks/useStoreFollow'
import { useAuth } from '@/hooks/useAuth'
import { UserCheck } from 'lucide-react'

interface FollowingBadgeProps {
  sellerId: string
  className?: string
}

/**
 * Small badge to display on store cards when the user follows the store
 * Shows nothing if user is not following or not logged in
 */
export function FollowingBadge({ sellerId, className = '' }: FollowingBadgeProps) {
  const { user } = useAuth()
  const { isFollowing, isLoading } = useStoreFollow(sellerId)

  // Don't show anything if not logged in, loading, or not following
  if (!user || isLoading || !isFollowing) {
    return null
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/90 text-white text-xs font-medium backdrop-blur-sm ${className}`}
    >
      <UserCheck className="w-3 h-3" />
      <span>Following</span>
    </div>
  )
}

/**
 * Minimal version - just an icon with tooltip
 */
export function FollowingIcon({ sellerId, className = '' }: FollowingBadgeProps) {
  const { user } = useAuth()
  const { isFollowing, isLoading } = useStoreFollow(sellerId)

  if (!user || isLoading || !isFollowing) {
    return null
  }

  return (
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white ${className}`}
      title="You follow this store"
    >
      <UserCheck className="w-3.5 h-3.5" />
    </div>
  )
}
