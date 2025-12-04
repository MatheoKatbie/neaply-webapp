'use client'

import { Button } from '@/components/ui/button'
import { Rocket, Mail, Twitter, Linkedin, Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      const res = fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(() => {
        setSubscribed(true)
        setEmail('')
      })
    }
  }

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
          {!subscribed ? (
            <>
              <p className="text-white/50 text-sm">Be the first to know when we launch:</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
                <Button
                  type="submit"
                  size={"lg"}
                  className="bg-white text-black hover:bg-white/90 rounded-lg px-6 py-3"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
              </form>
            </>
          ) : (
            <div className="px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
              ✓ Thanks! We&apos;ll notify you when we launch.
            </div>
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
