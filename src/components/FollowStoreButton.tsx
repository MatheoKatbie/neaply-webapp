'use client'

import { useStoreFollow } from '@/hooks/useStoreFollow'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { UserPlus, UserMinus, Loader2, Users } from 'lucide-react'

interface FollowStoreButtonProps {
  sellerId: string
  sellerSlug?: string
  variant?: 'default' | 'compact' | 'icon-only'
  showCount?: boolean
  className?: string
}

export function FollowStoreButton({
  sellerId,
  sellerSlug,
  variant = 'default',
  showCount = true,
  className = '',
}: FollowStoreButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const {
    isFollowing,
    followersCount,
    isLoading,
    isUpdating,
    toggle,
  } = useStoreFollow(sellerId)

  const handleClick = async () => {
    if (!user) {
      // Redirect to login with return URL
      const returnUrl = sellerSlug ? `/store/${sellerSlug}` : window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    await toggle()
  }

  // Format followers count
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (isLoading) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#40424D]/50 text-[#9DA2B3] ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {variant !== 'icon-only' && <span>Loading...</span>}
      </button>
    )
  }

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={`relative p-2 rounded-lg transition-all ${
          isFollowing
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-[#40424D] text-[#EDEFF7] hover:bg-[#50525D]'
        } disabled:opacity-50 ${className}`}
        title={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isUpdating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isFollowing ? (
          <UserMinus className="w-5 h-5" />
        ) : (
          <UserPlus className="w-5 h-5" />
        )}
        {showCount && followersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#1A1A1D] text-[#EDEFF7] text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center border border-[#40424D]">
            {formatCount(followersCount)}
          </span>
        )}
      </button>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
          isFollowing
            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30'
            : 'bg-[#40424D]/50 text-[#EDEFF7] border border-[#40424D] hover:bg-[#40424D]'
        } disabled:opacity-50 ${className}`}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isFollowing ? (
          <UserMinus className="w-3.5 h-3.5" />
        ) : (
          <UserPlus className="w-3.5 h-3.5" />
        )}
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
        {showCount && followersCount > 0 && (
          <span className="text-[#9DA2B3]">• {formatCount(followersCount)}</span>
        )}
      </button>
    )
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      className={`inline-flex items-center gap-2 px-4 py-1 rounded-lg font-medium transition-all ${
        isFollowing
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-[#EDEFF7] text-[#08080A] hover:bg-[#D3D6E0]'
      } disabled:opacity-50 ${className}`}
    >
      {isUpdating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      <span>{isFollowing ? 'Following' : 'Follow Store'}</span>
      {showCount && followersCount > 0 && (
        <span className="flex items-center gap-1 text-sm opacity-80">
          <Users className="w-3.5 h-3.5" />
          {formatCount(followersCount)}
        </span>
      )}
    </button>
  )
}
