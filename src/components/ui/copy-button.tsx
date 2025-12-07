'use client'

import { Button } from '@/components/ui/button'
import { copyWorkflowToClipboard } from '@/lib/download-utils'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface CopyButtonProps {
  workflowId: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showText?: boolean
}

export function CopyButton({ workflowId, size = 'default', className = '', showText = true }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopy = async () => {
    if (loading || copied) return
    
    setLoading(true)
    const success = await copyWorkflowToClipboard(workflowId)
    setLoading(false)
    
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    }
  }

  return (
    <Button
      size={size}
      onClick={handleCopy}
      disabled={loading}
      className={`${className}`}
    >
      {copied ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <Copy className="w-4 h-4 mr-2" />
      )}
      {showText && (copied ? 'Copied!' : loading ? 'Copying...' : 'Copy JSON')}
    </Button>
  )
}
