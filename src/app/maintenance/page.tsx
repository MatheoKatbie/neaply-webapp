'use client'

import { Button } from '@/components/ui/button'
import { Wrench, Mail, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#08080A] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/neaply/logo-light.png"
            alt="Neaply"
            width={200}
            height={250}
            className=" w-auto"
          />
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            We&apos;ll be back soon!
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            We&apos;re performing scheduled maintenance to improve your experience.
          </p>
        </div>

        {/* Estimated Duration */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm">
          Estimated downtime: ~2 hours
        </div>

        {/* Contact */}
        <div className="space-y-4 pt-4">
          <p className="text-white/50 text-sm">Need urgent assistance?</p>
          <Button
            asChild
            className="bg-white text-black hover:bg-white/90 rounded-lg px-6"
          >
            <Link href="mailto:support@neaply.com" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@neaply.com
            </Link>
          </Button>
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
