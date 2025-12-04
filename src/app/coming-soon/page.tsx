'use client'

import { Button } from '@/components/ui/button'
import { Mail, Twitter, Linkedin, Bell, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'already-exists' | 'error' | 'rate-limited' | 'invalid-email'

const WAITLIST_STORAGE_KEY = 'neaply_waitlist'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface WaitlistData {
  email: string
  position: number
  subscribedAt: string
}

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [position, setPosition] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedEmail, setSavedEmail] = useState<string | null>(null)

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WAITLIST_STORAGE_KEY)
      if (stored) {
        const data: WaitlistData = JSON.parse(stored)
        setSavedEmail(data.email)
        setPosition(data.position)
        setStatus('success')
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Validate email format
    if (!isValidEmail(email)) {
      setStatus('invalid-email')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'coming-soon' }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setStatus('rate-limited')
        return
      }

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong')
        return
      }

      // Save to localStorage
      const waitlistData: WaitlistData = {
        email: email.toLowerCase(),
        position: data.position,
        subscribedAt: new Date().toISOString(),
      }
      try {
        localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(waitlistData))
      } catch {
        // Ignore localStorage errors
      }

      if (data.alreadyExists) {
        setStatus('already-exists')
        setPosition(data.position)
      } else {
        setStatus('success')
        setPosition(data.position)
        setEmail('')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Unable to connect. Please try again.')
    }
  }

  const isSubmitting = status === 'loading'

  return (
    <div className="min-h-screen bg-[#08080A] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/neaply/logo-light.png"
            alt="Neaply"
            width={250}
            height={40}
            className="w-auto"
          />
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Coming Soon
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            We&apos;re building something amazing. The first marketplace for automation workflows is almost ready.
          </p>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4 pt-4">
          {status === 'success' ? (
            <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80">
              <p className="font-medium">You&apos;re on the list</p>
              {position && (
                <p className="text-sm text-white/50 mt-1">Position #{position}</p>
              )}
              <p className="text-sm text-white/50 mt-1">We&apos;ll notify you when we launch.</p>
            </div>
          ) : status === 'already-exists' ? (
            <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80">
              <p className="font-medium">You&apos;re already on the list</p>
              {position && (
                <p className="text-sm text-white/50 mt-1">Position #{position}</p>
              )}
              <p className="text-sm text-white/50 mt-1">We&apos;ll notify you when we launch.</p>
            </div>
          ) : (
            <>
              <p className="text-white/50 text-sm">Be the first to know when we launch:</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size={"lg"}
                  className="bg-white text-black hover:bg-white/90 rounded-lg px-6 py-3 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Joining...' : 'Notify Me'}
                </Button>
              </form>
              
              {status === 'error' && (
                <p className="text-red-400/80 text-sm">{errorMessage}</p>
              )}
              
              {status === 'invalid-email' && (
                <p className="text-white/50 text-sm">Please enter a valid email address.</p>
              )}
              
              {status === 'rate-limited' && (
                <p className="text-white/50 text-sm">Too many attempts. Please wait a moment.</p>
              )}
            </>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-3 pt-4">
          <p className="text-white/50 text-sm">Questions?</p>
          <Link
            href="mailto:contact@neaply.com"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            contact@neaply.com
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Link
            href="https://twitter.com/neaply"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </Link>
          <Link
            href="https://linkedin.com/company/neaply"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs pt-8">
          © {new Date().getFullYear()} Neaply. All rights reserved.
        </p>
      </div>
    </div>
  )
}
