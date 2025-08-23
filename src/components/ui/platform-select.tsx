'use client'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'

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

interface PlatformSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}

export function PlatformSelect({
  value,
  onValueChange,
  placeholder = 'Select a platform...',
  error,
  required = false,
}: PlatformSelectProps) {
  const selectedPlatform = platforms.find((platform) => platform.value === value)

  return (
    <div className="space-y-2 cursor-pointer">
      <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>Platform</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn('w-full', error && 'border-red-500 focus:border-red-500')}>
          <SelectValue placeholder={placeholder}>
            {selectedPlatform && (
              <div className="flex items-center gap-3 cursor-pointer">
                <Image
                  src={selectedPlatform.logo}
                  alt={selectedPlatform.label}
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span>{selectedPlatform.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.value} value={platform.value}>
              <div className="flex items-center gap-3 cursor-pointer">
                <Image src={platform.logo} alt={platform.label} width={20} height={20} className="object-contain" />
                <div className="flex flex-col">
                  <span className="font-medium">{platform.label}</span>
                  <span className="text-xs text-muted-foreground">{platform.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
