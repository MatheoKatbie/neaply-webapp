'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, ThumbsUp, MessageSquare, Edit, Trash2, Flag } from 'lucide-react'
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
function StarRating({ rating, onRatingChange, readonly = false }: {
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
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
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
        setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1)
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
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.user.avatarUrl} />
              <AvatarFallback>
                {review.user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{review.user.displayName}</div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readonly />
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        {review.title && (
          <CardTitle className="text-lg mt-2">{review.title}</CardTitle>
        )}
      </CardHeader>
      {review.bodyMd && (
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{review.bodyMd}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpfulClick}
              className={isHelpful ? 'text-blue-600' : 'text-gray-600'}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Helpful ({helpfulCount})
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Review Form Component
function ReviewForm({ workflowId, onReviewSubmitted }: {
  workflowId: string
  onReviewSubmitted: () => void
}) {
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
        <Button className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this workflow to help other users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className='space-y-2'>
            <Label htmlFor="rating">Rating *</Label>
            <div className="mt-2">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData({ ...formData, rating })}
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your review..."
              maxLength={200}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor="bodyMd">Review Details (Optional)</Label>
            <Textarea
              id="bodyMd"
              value={formData.bodyMd}
              onChange={(e) => setFormData({ ...formData, bodyMd: e.target.value })}
              placeholder="Share your detailed experience with this workflow..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || formData.rating === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Reviews ({pagination.totalCount})</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
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
            <div className="pt-4">
              <ReviewForm workflowId={workflowId} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          )}
          {userHasReviewed && (
            <div className="pt-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                You have already reviewed this workflow
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">
                {userCanReview
                  ? 'Be the first to review this workflow!'
                  : 'Reviews will appear here once users start sharing their experiences.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
