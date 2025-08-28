'use client'

import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface Platform {
  value: string
  label: string
  logo: string
  description: string
}

const platforms: Platform[] = [
  {
    value: 'n8n',
    label: 'n8n',
    logo: '/images/company-logo/n8n-logo.png',
    description: 'Open-source workflow automation platform',
  },
  {
    value: 'zapier',
    label: 'Zapier',
    logo: '/images/company-logo/zapier-logo.png',
    description: 'Connect your apps and automate workflows',
  },
  {
    value: 'make',
    label: 'Make',
    logo: '/images/company-logo/make-logo.png',
    description: 'Visual platform for creating automated workflows',
  },
  {
    value: 'airtable_script',
    label: 'Airtable Script',
    logo: '/images/company-logo/airtable-logo.png',
    description: 'Custom automation scripts for Airtable',
  },
]

interface PlatformBadgeProps {
  platform: string
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  showLogo?: boolean
  className?: string
}

export function PlatformBadge({
  platform,
  variant = 'default',
  size = 'default',
  showLogo = true,
  className,
}: PlatformBadgeProps) {
  const platformData = platforms.find((p) => p.value === platform)

  if (!platformData) {
    return null
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-sm border border-white/20',
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
    >
      {showLogo && (
        <Image
          src={platformData.logo}
          alt={platformData.label}
          width={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
          height={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
          className="object-contain"
        />
      )}
    </Badge>
  )
}
