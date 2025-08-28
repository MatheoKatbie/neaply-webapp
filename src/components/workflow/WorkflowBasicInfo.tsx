'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlatformSelect } from '@/components/ui/platform-select'

interface WorkflowBasicInfoProps {
  title: string
  shortDesc: string
  longDescMd: string
  basePriceCents: number
  currency: string
  platform: string
  onUpdate: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  onBlur: (field: string) => void
  showErrors?: boolean
}

export function WorkflowBasicInfo({
  title,
  shortDesc,
  longDescMd,
  basePriceCents,
  currency,
  platform,
  onUpdate,
  errors,
  touched,
  onBlur,
  showErrors = false,
}: WorkflowBasicInfoProps) {
  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  const parsePrice = (price: string) => {
    const parsed = parseFloat(price)
    return isNaN(parsed) ? 0 : Math.round(parsed * 100)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className={showErrors && errors.title ? 'text-red-500' : ''}>
          Workflow Title *
        </Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => onUpdate('title', e.target.value)}
          onBlur={() => onBlur('title')}
          placeholder="Enter a descriptive title for your workflow..."
          className={showErrors && errors.title ? 'border-red-500' : ''}
          required
        />
        {showErrors && errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
        <p className="text-xs text-muted-foreground">3-100 characters • Be descriptive and clear</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="basePriceCents" className={showErrors && errors.basePriceCents ? 'text-red-500' : ''}>
            Price (USD) *
          </Label>
          <Input
            id="basePriceCents"
            name="basePriceCents"
            type="number"
            step="0.01"
            min="0"
            max="10000"
            value={formatPrice(basePriceCents)}
            onChange={(e) => onUpdate('basePriceCents', parsePrice(e.target.value))}
            onBlur={() => onBlur('basePriceCents')}
            placeholder="0.00"
            className={showErrors && errors.basePriceCents ? 'border-red-500' : ''}
            required
          />
          {showErrors && errors.basePriceCents && <p className="text-xs text-red-500">{errors.basePriceCents}</p>}
          <p className="text-xs text-muted-foreground">$0.00 - $10,000.00 • Set to 0 for free workflows</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform" className={showErrors && errors.platform ? 'text-red-500' : ''}>
            Platform *
          </Label>
          <PlatformSelect
            value={platform}
            onValueChange={(selectedPlatform) => {
              onUpdate('platform', selectedPlatform)
              if (!touched.platform) {
                onBlur('platform')
              }
            }}
            placeholder="Select the platform for your workflow..."
            error={showErrors ? errors.platform : undefined}
            required={true}
          />
          <p className="text-xs text-muted-foreground">Choose the platform this workflow is designed for</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc" className={showErrors && errors.shortDesc ? 'text-red-500' : ''}>
          Short Description *
        </Label>
        <Textarea
          id="shortDesc"
          name="shortDesc"
          value={shortDesc}
          onChange={(e) => onUpdate('shortDesc', e.target.value)}
          onBlur={() => onBlur('shortDesc')}
          placeholder="Brief description of what this workflow does..."
          className={showErrors && errors.shortDesc ? 'border-red-500' : ''}
          rows={3}
          required
        />
        {showErrors && errors.shortDesc && <p className="text-xs text-red-500">{errors.shortDesc}</p>}
        <p className="text-xs text-muted-foreground">10-200 characters • This appears in search results and cards</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDescMd" className={showErrors && errors.longDescMd ? 'text-red-500' : ''}>
          Detailed Description (Optional)
        </Label>
        <Textarea
          id="longDescMd"
          name="longDescMd"
          value={longDescMd}
          onChange={(e) => onUpdate('longDescMd', e.target.value)}
          onBlur={() => onBlur('longDescMd')}
          placeholder="Detailed explanation of how the workflow works, setup instructions, requirements..."
          className={showErrors && errors.longDescMd ? 'border-red-500' : ''}
          rows={6}
        />
        {showErrors && errors.longDescMd && <p className="text-xs text-red-500">{errors.longDescMd}</p>}
        <p className="text-xs text-muted-foreground">
          50-5000 characters • Markdown supported • Include setup instructions and requirements
        </p>
      </div>
    </div>
  )
}
