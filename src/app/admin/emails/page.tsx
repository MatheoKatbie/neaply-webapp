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

export default function AdminEmailsPage() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [testEmail, setTestEmail] = useState('')
  
  const [audienceStats, setAudienceStats] = useState<AudienceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

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
      <div>
        <h1 className="text-2xl font-semibold text-[#EDEFF7]">Email Broadcast</h1>
        <p className="text-[#9DA2B3] mt-1">Send emails to your users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#EDEFF7]">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="bg-[#1E1E24] border-[#9DA2B3]/20 text-[#EDEFF7] placeholder:text-[#9DA2B3]/50"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#EDEFF7]">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
