'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WaitlistFormProps {
  source?: string
  className?: string
  variant?: 'default' | 'compact' | 'hero'
  showCount?: boolean
}

export function WaitlistForm({ 
  source = 'unknown', 
  className,
  variant = 'default',
  showCount = false,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [alreadyExists, setAlreadyExists] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source,
          referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSuccess(true)
      setPosition(data.position)
      setAlreadyExists(data.alreadyExists || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={cn('w-full', className)}>
        <div className={cn(
          'flex flex-col items-center gap-3 p-6 rounded-xl',
          'bg-gradient-to-br from-green-500/10 to-emerald-500/5',
          'border border-green-500/20'
        )}>
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#EDEFF7]">
              {alreadyExists ? "You're already on the list!" : "You're on the list!"}
            </h3>
            {position && (
              <p className="text-[#9DA2B3] mt-1">
                Your position: <span className="text-green-400 font-bold">#{position}</span>
              </p>
            )}
            <p className="text-sm text-[#9DA2B3] mt-2">
              We&apos;ll notify you as soon as we launch.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn('w-full', className)}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-[#0D0D0F] border-[#9DA2B3]/20"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-[#6366F1] hover:bg-[#5558DD]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Join'
            )}
          </Button>
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </form>
    )
  }

  // Hero variant (larger, more prominent)
  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={cn('w-full max-w-xl mx-auto', className)}>
        <div className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9DA2B3]" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  'pl-12 h-14 text-base',
                  'bg-[#0D0D0F] border-[#9DA2B3]/20',
                  'focus:border-[#6366F1] focus:ring-[#6366F1]/20'
                )}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              size="lg"
              className={cn(
                'h-14 px-8 text-base font-semibold',
                'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]',
                'hover:from-[#5558DD] hover:to-[#7C3AED]',
                'shadow-lg shadow-[#6366F1]/25'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join the Waitlist
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
          )}
          
          <p className="text-[#9DA2B3] text-sm mt-4 text-center">
            🔒 No spam. We&apos;ll only email you when we launch.
          </p>
        </div>
      </form>
    )
  }

  // Default variant
  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9DA2B3]" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-[#0D0D0F] border-[#9DA2B3]/20"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#6366F1] hover:bg-[#5558DD]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Join the Waitlist
        </Button>
        
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </form>
  )
}

export default WaitlistForm
