'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface StripeSetupCardProps {
  className?: string
}

export function StripeSetupCard({ className }: StripeSetupCardProps) {
  return (
    <Card className={`max-w-md mx-auto text-center bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 ${className}`}>
      <CardContent className="pt-8 pb-8 px-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#EDEFF7] mb-3 font-aeonikpro">
          Set up your payouts
          <br />
          with Stripe
        </h2>

        {/* Description */}
        <p className="text-[#9DA2B3] mb-8 leading-relaxed font-aeonikpro">
          Neaply partners with Stripe to transfer
          <br />
          earnings to your bank account.
        </p>

        {/* Action Button */}
        <Link href="/dashboard/stripe/connect" className="block">
          <Button className="w-full bg-white text-black hover:bg-[#40424D]/30 font-medium py-3 px-6 rounded-lg mb-4 font-aeonikpro">
            <ExternalLink className="w-4 h-4 mr-2" />
            Set up payments
          </Button>
        </Link>

        {/* Info Text */}
        <p className="text-sm text-[#9DA2B3] font-aeonikpro">
          You'll be redirected to Stripe to complete the
          <br />
          onboarding process.
        </p>
      </CardContent>
    </Card>
  )
}
