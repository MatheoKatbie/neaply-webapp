'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface WorkflowBasicInfoProps {
  title: string
  shortDesc: string
  longDescMd: string
  basePriceCents: number
  currency: string
  onUpdate: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  onBlur: (field: string) => void
}

export function WorkflowBasicInfo({
  title,
  shortDesc,
  longDescMd,
  basePriceCents,
  currency,
  onUpdate,
  errors,
  touched,
  onBlur,
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
        <Label htmlFor="title" className={touched.title && errors.title ? 'text-red-500' : ''}>
          Workflow Title *
        </Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => onUpdate('title', e.target.value)}
          onBlur={() => onBlur('title')}
          placeholder="Enter a descriptive title for your workflow..."
          className={touched.title && errors.title ? 'border-red-500' : ''}
          required
        />
        {touched.title && errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
        <p className="text-xs text-muted-foreground">3-100 characters • Be descriptive and clear</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc" className={touched.shortDesc && errors.shortDesc ? 'text-red-500' : ''}>
          Short Description *
        </Label>
        <Textarea
          id="shortDesc"
          name="shortDesc"
          value={shortDesc}
          onChange={(e) => onUpdate('shortDesc', e.target.value)}
          onBlur={() => onBlur('shortDesc')}
          placeholder="Brief description of what this workflow does..."
          className={touched.shortDesc && errors.shortDesc ? 'border-red-500' : ''}
          rows={3}
          required
        />
        {touched.shortDesc && errors.shortDesc && <p className="text-xs text-red-500">{errors.shortDesc}</p>}
        <p className="text-xs text-muted-foreground">10-200 characters • This appears in search results and cards</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDescMd" className={touched.longDescMd && errors.longDescMd ? 'text-red-500' : ''}>
          Detailed Description (Optional)
        </Label>
        <Textarea
          id="longDescMd"
          name="longDescMd"
          value={longDescMd}
          onChange={(e) => onUpdate('longDescMd', e.target.value)}
          onBlur={() => onBlur('longDescMd')}
          placeholder="Detailed explanation of how the workflow works, setup instructions, requirements..."
          className={touched.longDescMd && errors.longDescMd ? 'border-red-500' : ''}
          rows={6}
        />
        {touched.longDescMd && errors.longDescMd && <p className="text-xs text-red-500">{errors.longDescMd}</p>}
        <p className="text-xs text-muted-foreground">
          50-5000 characters • Markdown supported • Include setup instructions and requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="basePriceCents"
            className={touched.basePriceCents && errors.basePriceCents ? 'text-red-500' : ''}
          >
            Price (€) *
          </Label>
          <Input
            id="basePriceCents"
            name="basePriceCents"
            type="number"
            step="0.01"
            min="0"
            max="1000"
            value={formatPrice(basePriceCents)}
            onChange={(e) => onUpdate('basePriceCents', parsePrice(e.target.value))}
            onBlur={() => onBlur('basePriceCents')}
            placeholder="0.00"
            className={touched.basePriceCents && errors.basePriceCents ? 'border-red-500' : ''}
            required
          />
          {touched.basePriceCents && errors.basePriceCents && (
            <p className="text-xs text-red-500">{errors.basePriceCents}</p>
          )}
          <p className="text-xs text-muted-foreground">€0.00 - €1000.00 • Set to 0 for free workflows</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => onUpdate('currency', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          <p className="text-xs text-muted-foreground">Currency for pricing</p>
        </div>
      </div>
    </div>
  )
}
