'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Bug, Send } from 'lucide-react'
import { toast } from 'sonner'

const BUG_CATEGORIES = [
  { value: 'ui', label: 'UI/Design Issue', description: 'Visual bugs, layout problems, styling issues' },
  { value: 'functional', label: 'Functional Bug', description: "Something isn't working as expected" },
  { value: 'performance', label: 'Performance Issue', description: 'Slow loading, lag, or freezing' },
  { value: 'security', label: 'Security Concern', description: 'Potential security vulnerability' },
  { value: 'other', label: 'Other', description: 'Other issue not listed above' },
]

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!category) {
      toast.error('Please select a category')
      return
    }
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!description.trim()) {
      toast.error('Please describe the issue')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit bug report')
      }

      toast.success('Bug report submitted! Thank you for helping us improve.')
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting bug report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit bug report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCategory('')
    setTitle('')
    setDescription('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        <button
          className="text-[#EDEFF7] hover:text-primary-foreground transition-colors inline-flex items-center gap-1"
        >
          <Bug className="w-3.5 h-3.5" />
          Report Bug
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1E1E24] border-[#9DA2B3]/25 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#EDEFF7]">
            <Bug className="w-5 h-5 text-orange-500" />
            Report a Bug
          </DialogTitle>
          <DialogDescription className="text-[#9DA2B3]">
            Found something wrong? Let us know and we&apos;ll fix it as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#EDEFF7]">Category</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              {BUG_CATEGORIES.map((cat) => (
                <div key={cat.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={cat.value} id={cat.value} className="mt-1" />
                  <div className="grid gap-1 leading-none">
                    <Label
                      htmlFor={cat.value}
                      className="text-sm font-medium cursor-pointer text-[#EDEFF7]"
                    >
                      {cat.label}
                    </Label>
                    <p className="text-xs text-[#9DA2B3]">{cat.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="bug-title" className="text-sm font-medium text-[#EDEFF7]">
              Title
            </Label>
            <Input
              id="bug-title"
              placeholder="Brief summary of the issue..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50"
            />
            <p className="text-xs text-[#9DA2B3]">{title.length}/200</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="bug-description" className="text-sm font-medium text-[#EDEFF7]">
              Description
            </Label>
            <Textarea
              id="bug-description"
              placeholder="Please describe the issue in detail. What were you trying to do? What happened instead?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50"
            />
            <p className="text-xs text-[#9DA2B3]">{description.length}/2000</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-[#9DA2B3]/25 text-[#9DA2B3] hover:text-[#EDEFF7]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !category || !title.trim() || !description.trim()}
            className="bg-white text-black hover:bg-white/90"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
