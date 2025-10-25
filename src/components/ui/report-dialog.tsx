'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Flag, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReportDialogProps {
  entityType: 'workflow' | 'store'
  entityId: string
  entityName: string
  trigger?: React.ReactNode
  className?: string
}

const REPORT_REASONS = {
  workflow: [
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Contains offensive or inappropriate material' },
    { value: 'copyright_violation', label: 'Copyright Violation', description: 'Uses copyrighted material without permission' },
    { value: 'misleading_description', label: 'Misleading Description', description: 'Description doesn\'t match the actual workflow' },
    { value: 'malicious_code', label: 'Malicious Code', description: 'Contains harmful or malicious code' },
    { value: 'spam', label: 'Spam', description: 'Low quality or repetitive content' },
    { value: 'broken_workflow', label: 'Broken Workflow', description: 'Workflow doesn\'t work as described' },
    { value: 'other', label: 'Other', description: 'Other reason not listed above' },
  ],
  store: [
    { value: 'fake_store', label: 'Fake Store', description: 'Store appears to be fake or fraudulent' },
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Store contains offensive material' },
    { value: 'copyright_violation', label: 'Copyright Violation', description: 'Store violates copyright laws' },
    { value: 'poor_quality', label: 'Poor Quality', description: 'Consistently low-quality workflows' },
    { value: 'misleading_information', label: 'Misleading Information', description: 'Store provides false or misleading information' },
    { value: 'spam', label: 'Spam', description: 'Store engages in spam activities' },
    { value: 'other', label: 'Other', description: 'Other reason not listed above' },
  ],
}

export function ReportDialog({ entityType, entityId, entityName, trigger, className }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reasons = REPORT_REASONS[entityType]

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          reason: selectedReason,
          description: description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit report')
      }

      toast.success('Report submitted successfully. Thank you for helping keep our platform safe.')
      setIsOpen(false)
      setSelectedReason('')
      setDescription('')
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultTrigger = (
    <Button variant="destructive" size="sm" className={className}>
      <Flag className="w-4 h-4 mr-2" />
      Report
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1E1E24] border-[#9DA2B3]/25 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#EDEFF7]">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Report {entityType === 'workflow' ? 'Workflow' : 'Store'}
          </DialogTitle>
          <DialogDescription className="text-[#9DA2B3]">
            You're reporting "{entityName}". Please select the reason that best describes the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#EDEFF7]">Reason for reporting</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {reasons.map((reason) => (
                <div key={reason.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={reason.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-[#EDEFF7]"
                    >
                      {reason.label}
                    </Label>
                    <p className="text-xs text-[#9DA2B3]">{reason.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-[#EDEFF7]">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help us understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50"
            />
            <p className="text-xs text-[#9DA2B3]">
              {description.length}/500 characters
            </p>
          </div>

          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-200">
                <p className="font-medium">Important</p>
                <p className="text-xs mt-1">
                  False reports may result in restrictions on your account. Only report content that genuinely violates our community guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedReason || isSubmitting} className="">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
