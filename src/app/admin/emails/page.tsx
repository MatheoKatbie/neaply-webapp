'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Loader2, 
  Users, 
  Store, 
  ShoppingBag, 
  Clock,
  Mail,
  TestTube,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles,
  Gift,
  Megaphone,
  Wrench,
  Heart,
  TrendingUp,
  Calendar,
} from 'lucide-react'

type Audience = 'all' | 'sellers' | 'buyers' | 'waitlist'

interface AudienceStats {
  all: number
  sellers: number
  buyers: number
  waitlist: number
}

interface SendResult {
  success: boolean
  test?: boolean
  sent: number
  failed: number
  errors?: string[]
  audience?: string
  totalRecipients?: number
}

interface EmailTemplate {
  id: string
  name: string
  icon: React.ElementType
  subject: string
  content: string
  ctaText?: string
  ctaUrl?: string
  audience: Audience
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'new-feature',
    name: 'New Feature',
    icon: Sparkles,
    audience: 'all',
    subject: 'New on Neaply: [Feature Name]',
    content: `We're excited to announce a new feature on Neaply!

[Describe the feature here and how it benefits users]

This update is now available for all users. Log in to try it out.

If you have any questions or feedback, don't hesitate to reach out.`,
    ctaText: 'Try It Now',
    ctaUrl: 'https://neaply.com',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: Wrench,
    audience: 'all',
    subject: 'Scheduled Maintenance Notice',
    content: `We'll be performing scheduled maintenance on Neaply.

Date: [Date]
Time: [Time] (UTC)
Expected Duration: [Duration]

During this time, the platform may be temporarily unavailable. We apologize for any inconvenience.

Thank you for your patience.`,
  },
  {
    id: 'seller-tips',
    name: 'Seller Tips',
    icon: TrendingUp,
    audience: 'sellers',
    subject: 'Tips to Boost Your Sales on Neaply',
    content: `Want to increase your workflow sales? Here are some tips:

1. Write clear, detailed descriptions
2. Add high-quality screenshots and demos
3. Respond quickly to buyer questions
4. Keep your workflows updated
5. Price competitively based on value

The most successful sellers on Neaply follow these practices consistently.`,
    ctaText: 'View Your Dashboard',
    ctaUrl: 'https://neaply.com/dashboard',
  },
  {
    id: 'special-offer',
    name: 'Special Offer',
    icon: Gift,
    audience: 'all',
    subject: 'Special Offer Just for You',
    content: `We have a special offer for our valued users!

[Describe the offer, discount, or promotion]

This offer is valid until [date]. Don't miss out!`,
    ctaText: 'Claim Offer',
    ctaUrl: 'https://neaply.com/marketplace',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    icon: Megaphone,
    audience: 'all',
    subject: 'Neaply Newsletter - [Month Year]',
    content: `Here's what's new at Neaply this month:

New Features:
• [Feature 1]
• [Feature 2]

Top Workflows This Month:
• [Workflow 1]
• [Workflow 2]

Community Highlights:
[Share community news or achievements]

Thank you for being part of the Neaply community!`,
    ctaText: 'Explore Marketplace',
    ctaUrl: 'https://neaply.com/marketplace',
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    icon: Heart,
    audience: 'all',
    subject: 'Thank You for Being Part of Neaply',
    content: `We just wanted to take a moment to say thank you.

Your support means everything to us. Whether you're buying workflows, selling your creations, or just exploring what's possible with automation, you're helping build something special.

We're committed to making Neaply the best platform for automation workflows, and we couldn't do it without you.

Here's to building the future of automation together.`,
  },
  {
    id: 'event',
    name: 'Event',
    icon: Calendar,
    audience: 'all',
    subject: 'You\'re Invited: [Event Name]',
    content: `Join us for an upcoming event!

Event: [Event Name]
Date: [Date]
Time: [Time] (UTC)
Where: [Location / Online Platform]

[Describe what the event is about and why users should attend]

Space is limited, so register now to secure your spot.`,
    ctaText: 'Register Now',
    ctaUrl: 'https://neaply.com',
  },
  {
    id: 'feedback',
    name: 'Feedback Request',
    icon: FileText,
    audience: 'all',
    subject: 'We\'d Love Your Feedback',
    content: `Your opinion matters to us!

We're always looking to improve Neaply and would love to hear your thoughts. Whether it's a feature request, a bug report, or just general feedback, we want to know.

Take a few minutes to share your experience with us. Your input directly shapes the future of the platform.`,
    ctaText: 'Share Feedback',
    ctaUrl: 'https://neaply.com/help',
  },
]

export default function AdminEmailsPage() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [testEmail, setTestEmail] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  
  const [audienceStats, setAudienceStats] = useState<AudienceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  // Apply template
  const applyTemplate = (template: EmailTemplate) => {
    setSubject(template.subject)
    setContent(template.content)
    setCtaText(template.ctaText || '')
    setCtaUrl(template.ctaUrl || '')
    setAudience(template.audience)
    setSelectedTemplate(template.id)
    setResult(null)
  }

  // Clear form
  const clearForm = () => {
    setSubject('')
    setContent('')
    setCtaText('')
    setCtaUrl('')
    setSelectedTemplate(null)
    setResult(null)
  }

  // Fetch audience stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/emails/broadcast')
        if (res.ok) {
          const data = await res.json()
          setAudienceStats(data.audiences)
        }
      } catch (error) {
        console.error('Failed to fetch audience stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleSend = async (isTest: boolean) => {
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in subject and content')
      return
    }

    if (isTest && !testEmail.trim()) {
      alert('Please enter a test email address')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/emails/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          ctaText: ctaText.trim() || undefined,
          ctaUrl: ctaUrl.trim() || undefined,
          audience,
          testEmail: isTest ? testEmail : undefined,
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        setResult({ success: false, sent: 0, failed: 0, errors: [data.error] })
      } else {
        setResult(data)
      }
    } catch (error) {
      setResult({ 
        success: false, 
        sent: 0, 
        failed: 0, 
        errors: ['Failed to send. Please try again.'] 
      })
    } finally {
      setSending(false)
    }
  }

  const audienceOptions = [
    { value: 'all', label: 'All Users', icon: Users, count: audienceStats?.all },
    { value: 'sellers', label: 'Sellers', icon: Store, count: audienceStats?.sellers },
    { value: 'buyers', label: 'Buyers', icon: ShoppingBag, count: audienceStats?.buyers },
    { value: 'waitlist', label: 'Waitlist', icon: Clock, count: audienceStats?.waitlist },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#EDEFF7]">Email Broadcast</h1>
          <p className="text-[#9DA2B3] mt-1">Send emails to your users</p>
        </div>
        {(subject || content) && (
          <Button
            variant="ghost"
            onClick={clearForm}
            className="text-[#9DA2B3] hover:text-[#EDEFF7]"
          >
            Clear Form
          </Button>
        )}
      </div>

      {/* Templates */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#EDEFF7]">Quick Templates</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {EMAIL_TEMPLATES.map((template) => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id
            return (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#EDEFF7]/10 border-[#EDEFF7]/30'
                    : 'bg-[#1E1E24] border-[#9DA2B3]/10 hover:border-[#9DA2B3]/20'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-[#EDEFF7]' : 'text-[#9DA2B3]'}`} />
                <span className={`text-xs text-center ${isSelected ? 'text-[#EDEFF7]' : 'text-[#9DA2B3]'}`}>
                  {template.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#EDEFF7]">Subject</label>
            <Input
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setSelectedTemplate(null) }}
              placeholder="Enter email subject..."
              className="bg-[#1E1E24] border-[#9DA2B3]/20 text-[#EDEFF7] placeholder:text-[#9DA2B3]/50"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#EDEFF7]">Content</label>
            <Textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setSelectedTemplate(null) }}
              placeholder="Write your email content here...&#10;&#10;Use line breaks to create new paragraphs."
              rows={12}
              className="bg-[#1E1E24] border-[#9DA2B3]/20 text-[#EDEFF7] placeholder:text-[#9DA2B3]/50 resize-none"
            />
            <p className="text-xs text-[#9DA2B3]/60">
              Plain text only. Each line break creates a new paragraph.
            </p>
          </div>

          {/* CTA (Optional) */}
          <div className="space-y-4 p-4 rounded-lg border border-[#9DA2B3]/10 bg-[#1E1E24]/50">
            <p className="text-sm font-medium text-[#9DA2B3]">Call to Action (Optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#9DA2B3]">Button Text</label>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Visit Marketplace"
                  className="bg-[#1E1E24] border-[#9DA2B3]/20 text-[#EDEFF7] placeholder:text-[#9DA2B3]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#9DA2B3]">Button URL</label>
                <Input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://neaply.com/..."
                  className="bg-[#1E1E24] border-[#9DA2B3]/20 text-[#EDEFF7] placeholder:text-[#9DA2B3]/50"
                />
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success && result.failed === 0
                ? 'bg-green-500/10 border-green-500/20'
                : result.failed > 0
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {result.success && result.failed === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-[#EDEFF7]">
                    {result.test ? 'Test email sent' : 'Broadcast complete'}
                  </p>
                  <p className="text-sm text-[#9DA2B3] mt-1">
                    {result.sent} sent, {result.failed} failed
                    {result.totalRecipients && ` (${result.totalRecipients} recipients)`}
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-400/80">
                      {result.errors.slice(0, 3).map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                      {result.errors.length > 3 && (
                        <p>...and {result.errors.length - 3} more errors</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Audience Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#EDEFF7]">Audience</label>
            <div className="space-y-2">
              {audienceOptions.map((option) => {
                const Icon = option.icon
                const isSelected = audience === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setAudience(option.value as Audience)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#EDEFF7]/10 border-[#EDEFF7]/30'
                        : 'bg-[#1E1E24] border-[#9DA2B3]/10 hover:border-[#9DA2B3]/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#EDEFF7]' : 'text-[#9DA2B3]'}`} />
                      <span className={isSelected ? 'text-[#EDEFF7]' : 'text-[#9DA2B3]'}>
                        {option.label}
                      </span>
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-[#EDEFF7]' : 'text-[#9DA2B3]/60'}`}>
                      {loading ? '...' : option.count ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Test Send */}
          <div className="space-y-3 p-4 rounded-lg border border-[#9DA2B3]/10 bg-[#1E1E24]/50">
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4 text-[#9DA2B3]" />
              <label className="text-sm font-medium text-[#9DA2B3]">Test First</label>
            </div>
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
              className="bg-[#1E1E24] border-[#9DA2B3]/20 text-[#EDEFF7] placeholder:text-[#9DA2B3]/50"
            />
            <Button
              onClick={() => handleSend(true)}
              disabled={sending || !subject || !content || !testEmail}
              variant="outline"
              className="w-full "
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Test
            </Button>
          </div>

          {/* Send Button */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSend(false)}
              disabled={sending || !subject || !content}
              className="w-full bg-[#EDEFF7] text-[#0D0D0F] hover:bg-[#EDEFF7]/90"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send to {audienceStats?.[audience] ?? 0} {audience === 'all' ? 'users' : audience}
            </Button>
            <p className="text-xs text-center text-[#9DA2B3]/60">
              This action cannot be undone
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
