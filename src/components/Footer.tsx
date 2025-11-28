'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BugReportButton } from '@/components/BugReportButton'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto font-aeonikpro bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#D3D6E0]/5 border border-[#3E4E55] rounded-[14px]">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-8">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Image src="/images/neaply/logo-light.png" alt="Neaply" width={120} height={40} />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center space-x-10 mb-4 md:mb-0 font-aeonikpro text-[#EDEFF7]">
            <Link href="/marketplace" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/help" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
              FAQs
            </Link>
            <Link href="/how-it-works" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
              How it works
            </Link>
            <Link href="/get-started" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
              Get started
            </Link>
            <Link href="/create-workflow" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
              Create workflow
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-4 text-[#EDEFF7]">
            <Link
              href="https://discord.gg/neaply"
              className="text-[#EDEFF7] hover:text-primary-foreground transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
              </svg>
            </Link>
            <Link href="https://t.me/neaply" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </Link>
            <Link
              href="https://instagram.com/neaply"
              className="text-[#EDEFF7] hover:text-primary-foreground transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link
              href="https://twitter.com/neaply"
              className="text-[#EDEFF7] hover:text-primary-foreground transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#3E4E55] py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-[#EDEFF7] text-sm mb-2 md:mb-0">© {currentYear} Neaply, All rights reserved.</div>
            <div className="flex items-center space-x-4 text-[#EDEFF7] text-sm">
              <Link href="/privacy" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="text-[#EDEFF7] hover:text-primary-foreground transition-colors">
                Terms & Conditions
              </Link>
              <span>•</span>
              <BugReportButton />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
