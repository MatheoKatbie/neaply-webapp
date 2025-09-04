'use client'

import type { Workflow } from '@/types/workflow'
import {
  Bot,
  Clock,
  Database,
  Globe,
  Shield,
  TrendingUp,
  Workflow as WorkflowIcon,
  Zap,
  Mail,
  ShoppingCart,
  Calendar,
  Users,
  FileText,
  Image as ImageIcon,
  Code,
  BarChart3,
  Settings,
  Smartphone,
  Cloud,
  Lock,
  Search,
  MessageSquare,
  Video,
  Music,
  MapPin,
  Layers,
  GitBranch,
  Puzzle,
  User,
} from 'lucide-react'
import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AutoThumbnailProps {
  workflow: Pick<Workflow, 'id' | 'title' | 'shortDesc' | 'categories' | 'tags'> & {
    longDescMd?: string
    platform?: string
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
  authorAvatarUrl?: string
}

const ICONS = {
  // Core workflow types
  default: Zap,
  workflow: WorkflowIcon,
  automation: Clock,

  // Data & Analytics
  database: Database,
  analytics: BarChart3,
  data: Database,
  reporting: BarChart3,

  // AI & ML
  ai: Bot,
  ml: Bot,
  gpt: Bot,
  chatbot: MessageSquare,

  // Communication
  email: Mail,
  notification: MessageSquare,
  sms: Smartphone,
  slack: MessageSquare,
  teams: Users,

  // E-commerce & Business
  ecommerce: ShoppingCart,
  payment: ShoppingCart,
  crm: Users,
  invoice: FileText,
  sales: TrendingUp,

  // Integration & API
  webhook: Globe,
  api: Code,
  integration: Puzzle,
  sync: GitBranch,

  // Content & Media
  content: FileText,
  image: ImageIcon,
  video: Video,
  social: Users,
  blog: FileText,

  // Security & Auth
  security: Shield,
  auth: Lock,
  backup: Shield,

  // Productivity
  calendar: Calendar,
  task: FileText,
  project: Layers,
  form: FileText,
  document: FileText,

  // Technical
  monitoring: BarChart3,
  deployment: Settings,
  testing: Settings,
  ci: GitBranch,

  // Location & Search
  location: MapPin,
  search: Search,

  // Cloud & Infrastructure
  cloud: Cloud,
  storage: Database,
  server: Settings,
}

// Platform color schemes
const PLATFORM_COLOR_SCHEMES: Record<string, { primary: string; secondary: string; accent: string; light: string }> = {
  n8n: {
    primary: '#FF6D00',
    secondary: '#F4511E',
    accent: '#FF8A50',
    light: '#FFE0B2',
  },
  zapier: {
    primary: '#FF4A00',
    secondary: '#CC3B00',
    accent: '#FF7A33',
    light: '#FFD6C7',
  },
  make: {
    primary: '#3F20BA',
    secondary: '#2A157D',
    accent: '#6B4CF5',
    light: '#E6E1FF',
  },
  airtable_script: {
    primary: '#0EA5E9',
    secondary: '#0369A1',
    accent: '#38BDF8',
    light: '#E0F2FE',
  },
}

// Professional fallback color schemes that work well with the dark theme
const COLOR_SCHEMES = [
  // Blue spectrum - professional and trustworthy
  {
    primary: '#3B82F6', // blue-500
    secondary: '#1D4ED8', // blue-700
    accent: '#60A5FA', // blue-400
    light: '#DBEAFE', // blue-100
  },
  // Purple spectrum - creative and modern
  {
    primary: '#8B5CF6', // purple-500
    secondary: '#7C3AED', // purple-600
    accent: '#A78BFA', // purple-400
    light: '#EDE9FE', // purple-100
  },
  // Green spectrum - growth and success
  {
    primary: '#10B981', // emerald-500
    secondary: '#059669', // emerald-600
    accent: '#34D399', // emerald-400
    light: '#D1FAE5', // emerald-100
  },
  // Orange spectrum - energy and enthusiasm
  {
    primary: '#F59E0B', // amber-500
    secondary: '#D97706', // amber-600
    accent: '#FCD34D', // amber-300
    light: '#FEF3C7', // amber-100
  },
  // Teal spectrum - balance and stability
  {
    primary: '#14B8A6', // teal-500
    secondary: '#0D9488', // teal-600
    accent: '#5EEAD4', // teal-300
    light: '#CCFBF1', // teal-100
  },
  // Rose spectrum - warm and approachable
  {
    primary: '#F43F5E', // rose-500
    secondary: '#E11D48', // rose-600
    accent: '#FB7185', // rose-400
    light: '#FFE4E6', // rose-100
  },
  // Indigo spectrum - deep and sophisticated
  {
    primary: '#6366F1', // indigo-500
    secondary: '#4F46E5', // indigo-600
    accent: '#818CF8', // indigo-400
    light: '#E0E7FF', // indigo-100
  },
  // Cyan spectrum - fresh and modern
  {
    primary: '#06B6D4', // cyan-500
    secondary: '#0891B2', // cyan-600
    accent: '#67E8F9', // cyan-300
    light: '#CFFAFE', // cyan-100
  },
]

export function AutoThumbnail({ workflow, className = '', size = 'md', authorAvatarUrl }: AutoThumbnailProps) {
  // Generate deterministic values based on workflow data
  const { colorScheme, icon, pattern, displayData } = useMemo(() => {
    const hash = workflow.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const titleHash = workflow.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)

    // Select color scheme based on platform first, then fallback to deterministic
    const platformKey = (workflow.platform || '').toLowerCase()
    const colorScheme = PLATFORM_COLOR_SCHEMES[platformKey] || COLOR_SCHEMES[hash % COLOR_SCHEMES.length]

    // Enhanced icon detection based on content
    let iconKey = 'default'
    const content = `${workflow.title} ${workflow.shortDesc} ${workflow.platform || ''} ${
      workflow.categories?.map((cat) => (typeof cat === 'string' ? cat : cat.category?.name || '')).join(' ') || ''
    }`.toLowerCase()

    // AI & ML keywords
    if (
      content.includes('ai') ||
      content.includes('ml') ||
      content.includes('gpt') ||
      content.includes('openai') ||
      content.includes('chatbot') ||
      content.includes('machine learning')
    ) {
      iconKey = 'ai'
    }
    // Database & Data keywords
    else if (
      content.includes('database') ||
      content.includes('sql') ||
      content.includes('postgres') ||
      content.includes('mysql') ||
      content.includes('mongodb') ||
      content.includes('data')
    ) {
      iconKey = 'database'
    }
    // Communication keywords
    else if (
      content.includes('email') ||
      content.includes('mail') ||
      content.includes('notification') ||
      content.includes('alert')
    ) {
      iconKey = 'email'
    } else if (
      content.includes('slack') ||
      content.includes('discord') ||
      content.includes('teams') ||
      content.includes('chat')
    ) {
      iconKey = 'slack'
    }
    // E-commerce keywords
    else if (
      content.includes('ecommerce') ||
      content.includes('shop') ||
      content.includes('payment') ||
      content.includes('stripe') ||
      content.includes('paypal') ||
      content.includes('order')
    ) {
      iconKey = 'ecommerce'
    }
    // CRM & Sales keywords
    else if (
      content.includes('crm') ||
      content.includes('sales') ||
      content.includes('lead') ||
      content.includes('customer') ||
      content.includes('hubspot') ||
      content.includes('salesforce')
    ) {
      iconKey = 'crm'
    }
    // API & Integration keywords
    else if (
      content.includes('webhook') ||
      content.includes('api') ||
      content.includes('integration') ||
      content.includes('sync') ||
      content.includes('connect')
    ) {
      iconKey = 'webhook'
    }
    // Security keywords
    else if (
      content.includes('security') ||
      content.includes('auth') ||
      content.includes('login') ||
      content.includes('password') ||
      content.includes('backup')
    ) {
      iconKey = 'security'
    }
    // Analytics & Reporting keywords
    else if (
      content.includes('analytics') ||
      content.includes('report') ||
      content.includes('dashboard') ||
      content.includes('metric') ||
      content.includes('tracking')
    ) {
      iconKey = 'analytics'
    }
    // Content & Social keywords
    else if (
      content.includes('social') ||
      content.includes('twitter') ||
      content.includes('facebook') ||
      content.includes('instagram') ||
      content.includes('linkedin')
    ) {
      iconKey = 'social'
    } else if (
      content.includes('content') ||
      content.includes('blog') ||
      content.includes('post') ||
      content.includes('article') ||
      content.includes('publish')
    ) {
      iconKey = 'content'
    }
    // Calendar & Scheduling keywords
    else if (
      content.includes('calendar') ||
      content.includes('schedule') ||
      content.includes('appointment') ||
      content.includes('meeting') ||
      content.includes('booking')
    ) {
      iconKey = 'calendar'
    }
    // Form & Document keywords
    else if (
      content.includes('form') ||
      content.includes('document') ||
      content.includes('pdf') ||
      content.includes('invoice') ||
      content.includes('contract')
    ) {
      iconKey = 'form'
    }
    // Automation keywords
    else if (
      content.includes('automation') ||
      content.includes('automate') ||
      content.includes('workflow') ||
      content.includes('process')
    ) {
      iconKey = 'automation'
    }

    // Pattern selection based on category/content
    let pattern = 'grid' // default - always show a pattern
    if (content.includes('ai') || content.includes('ml') || content.includes('tech')) {
      pattern = 'circuit'
    } else if (content.includes('data') || content.includes('analytics')) {
      pattern = 'grid'
    } else if (content.includes('social') || content.includes('creative')) {
      pattern = 'organic'
    }

    // Display data for text overlay
    const categoryText =
      workflow.categories && workflow.categories.length > 0
        ? typeof workflow.categories[0] === 'string'
          ? workflow.categories[0]
          : workflow.categories[0]?.category?.name || 'Workflow'
        : 'Workflow'

    const displayData = {
      title: workflow.title,
      category: categoryText,
      platform: workflow.platform,
    }

    return {
      colorScheme,
      icon: ICONS[iconKey as keyof typeof ICONS],
      pattern,
      displayData,
    }
  }, [workflow])

  // Background patterns as SVG components
  const renderPattern = () => {
    switch (pattern) {
      case 'grid':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )
      case 'circuit':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-8" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M10 10h20M30 10v20M30 30H10M10 30V10"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.6" />
                <circle cx="30" cy="30" r="2" fill="white" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        )
      case 'organic':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-6" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="organic" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
                <circle cx="45" cy="45" r="6" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
                <circle cx="30" cy="30" r="4" fill="white" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#organic)" />
          </svg>
        )
      default:
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-default" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-default)" />
          </svg>
        )
    }
  }

  const sizeClasses = {
    sm: 'h-24 w-full',
    md: 'h-48 w-full',
    lg: 'h-64 w-full',
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: { title: 'text-sm', category: 'text-xs', platform: 'text-xs' },
    md: { title: 'text-lg', category: 'text-sm', platform: 'text-xs' },
    lg: { title: 'text-xl', category: 'text-base', platform: 'text-sm' },
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', sizeClasses[size], className)}>
      {/* Author avatar (creator) */}
      {authorAvatarUrl ? (
        <div className="absolute top-3 left-3 z-10">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/40 shadow-md">
            <Image src={authorAvatarUrl} alt="Creator avatar" width={32} height={32} className="w-8 h-8 object-cover" />
          </div>
        </div>
      ) : (
        <div className="absolute top-3 left-3 z-10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 ring-2 ring-white/40 shadow-md"
            style={{ color: colorScheme.primary }}
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
      {/* Gradient Background */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`,
        }}
      />

      {/* Background Pattern */}
      {renderPattern()}

      {/* Overlay for better contrast with overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />

      {/* Centered Platform Logo - positioned to not interfere with top/corner overlays */}
      {displayData.platform && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full p-4 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 opacity-90"
            style={{ backgroundColor: `${colorScheme.accent}20` }}
          >
            {displayData.platform === 'n8n' && (
              <Image
                src="/images/company-logo/n8n-logo.png"
                alt="n8n"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            )}
            {displayData.platform === 'zapier' && (
              <Image
                src="/images/company-logo/zapier-logo.png"
                alt="Zapier"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            )}
            {displayData.platform === 'make' && (
              <Image
                src="/images/company-logo/make-logo.png"
                alt="Make"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            )}
            {displayData.platform === 'airtable_script' && (
              <Image
                src="/images/company-logo/airtable-logo.png"
                alt="Airtable"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            )}
            {!['n8n', 'zapier', 'make', 'airtable_script'].includes(displayData.platform) && (
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">{displayData.platform.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback centered icon when no platform is defined */}
      {!displayData.platform && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full p-3 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 opacity-80"
            style={{ backgroundColor: `${colorScheme.accent}20` }}
          >
            {React.createElement(icon, {
              className: cn(iconSizes[size], 'text-white drop-shadow-lg'),
            })}
          </div>
        </div>
      )}
    </div>
  )
}
