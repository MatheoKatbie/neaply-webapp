'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Star, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  title?: string
  bodyMd?: string
  createdAt: string
  updatedAt: string
  helpfulCount: number
  user: {
    displayName: string
    avatarUrl?: string
  }
}

interface ReviewSystemProps {
  workflowId: string
  userCanReview?: boolean
  userHasReviewed?: boolean
  className?: string
}

interface ReviewFormData {
  rating: number
  title: string
  bodyMd: string
}

// Star Rating Component
function StarRating({
  rating,
  onRatingChange,
  readonly = false,
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRatingChange?.(star)}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// Individual Review Component
function ReviewCard({ review }: { review: Review }) {
  const [isHelpful, setIsHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)

  const handleHelpfulClick = async () => {
    try {
      const method = isHelpful ? 'DELETE' : 'POST'
      const response = await fetch(`/api/reviews/${review.id}/helpful`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsHelpful(!isHelpful)
        setHelpfulCount((prev) => (isHelpful ? prev - 1 : prev + 1))
        toast.success(isHelpful ? 'Helpful vote removed' : 'Marked as helpful')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update helpful vote')
      }
    } catch (error) {
      toast.error('Failed to update helpful vote')
    }
  }

  return (
    <div
      className="mb-4 rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
      style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.user.avatarUrl} />
              <AvatarFallback style={{ backgroundColor: 'rgba(120, 153, 168, 0.2)', color: '#EDEFF7' }}>
                {review.user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-aeonikpro font-semibold" style={{ color: '#EDEFF7' }}>
                {review.user.displayName}
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readonly />
                <span className="font-aeonikpro text-sm" style={{ color: '#9DA2B3' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        {review.title && (
          <h4 className="font-aeonikpro text-lg font-semibold mb-3" style={{ color: '#EDEFF7' }}>
            {review.title}
          </h4>
        )}
        {review.bodyMd && (
          <div>
            <div className="prose prose-sm max-w-none mb-4">
              <p className="font-aeonikpro whitespace-pre-wrap leading-relaxed" style={{ color: '#D3D6E0' }}>
                {review.bodyMd}
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-[#9DA2B3]/25">
              <button
                onClick={handleHelpfulClick}
                className={`font-aeonikpro flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  isHelpful ? 'bg-[#7899A8]/20 text-[#7899A8]' : 'hover:bg-white/10'
                }`}
                style={{ color: isHelpful ? '#7899A8' : '#9DA2B3' }}
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({helpfulCount})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Review Form Component
function ReviewForm({ workflowId, onReviewSubmitted }: { workflowId: string; onReviewSubmitted: () => void }) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    bodyMd: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          rating: formData.rating,
          title: formData.title || undefined,
          bodyMd: formData.bodyMd || undefined,
        }),
      })

      if (response.ok) {
        toast.success('Review submitted successfully')
        setFormData({ rating: 0, title: '', bodyMd: '' })
        setIsOpen(false)
        onReviewSubmitted()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full py-3 px-6 rounded-full font-aeonikpro font-medium bg-white text-black hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-aeonikpro text-xl">Write a Review</DialogTitle>
          <DialogDescription className="font-aeonikpro">
            Share your experience with this workflow to help other users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="rating" className="font-aeonikpro">
              Rating *
            </Label>
            <div className="mt-2">
              <StarRating rating={formData.rating} onRatingChange={(rating) => setFormData({ ...formData, rating })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="font-aeonikpro">
              Review Title (Optional)
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your review..."
              maxLength={200}
              className="font-aeonikpro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bodyMd" className="font-aeonikpro">
              Review Details (Optional)
            </Label>
            <Textarea
              id="bodyMd"
              value={formData.bodyMd}
              onChange={(e) => setFormData({ ...formData, bodyMd: e.target.value })}
              placeholder="Share your detailed experience with this workflow..."
              rows={4}
              className="font-aeonikpro"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="py-2 px-4 rounded-full font-aeonikpro text-sm font-medium border border-[#9DA2B3]/25 hover:bg-white/10 transition-all duration-300"
              style={{ color: '#D3D6E0' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="py-2 px-4 rounded-full font-aeonikpro text-sm font-medium bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Main Review System Component
export function ReviewSystem({ workflowId, userCanReview, userHasReviewed, className }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
  })

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        workflowId,
        page: '1',
        limit: '10',
        sortBy,
      })

      const response = await fetch(`/api/reviews?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [workflowId, sortBy])

  const handleReviewSubmitted = () => {
    fetchReviews()
  }

  return (
    <div className={className}>
      <div
        className="rounded-xl border border-[#9DA2B3]/25 overflow-hidden"
        style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-aeonikpro text-2xl font-bold" style={{ color: '#EDEFF7' }}>
              Reviews ({pagination.totalCount})
            </h2>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-[#2A2D3A] border-[#9DA2B3]/25 text-white font-aeonikpro">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="rating-high">Highest Rated</SelectItem>
                  <SelectItem value="rating-low">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {userCanReview && (
            <div className="mb-6">
              <ReviewForm workflowId={workflowId} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          )}
          {userHasReviewed && (
            <div className="mb-6">
              <div
                className="px-4 py-2 rounded-full font-aeonikpro text-sm inline-flex items-center border border-green-600"
                style={{ color: '#22c55e' }}
              >
                You have already reviewed this workflow
              </div>
            </div>
          )}
          {loading ? (
            <div className="space-y-4 mt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-[#9DA2B3]/25 p-6"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}
                    ></div>
                    <div className="space-y-2">
                      <div className="h-4 rounded w-32" style={{ backgroundColor: 'rgba(157, 162, 179, 0.3)' }}></div>
                      <div className="h-3 rounded w-24" style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-4 rounded w-full" style={{ backgroundColor: 'rgba(157, 162, 179, 0.2)' }}></div>
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'rgba(157, 162, 179, 0.15)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 mt-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: '#9DA2B3' }} />
              <h3 className="font-aeonikpro text-lg font-semibold mb-2" style={{ color: '#EDEFF7' }}>
                No reviews yet
              </h3>
              <p className="font-aeonikpro" style={{ color: '#9DA2B3' }}>
                {userCanReview
                  ? 'Be the first to review this workflow!'
                  : 'Reviews will appear here once users start sharing their experiences.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
