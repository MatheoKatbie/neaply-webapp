'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  id: string
  name: string
  slug: string
  _count?: {
    workflows: number
  }
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  maxHeight?: string
  disabled?: boolean
  className?: string
  label?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  maxHeight = 'max-h-60',
  disabled = false,
  className,
  label,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Handle selection toggle
  const toggleSelection = React.useCallback(
    (optionId: string) => {
      if (disabled) return

      const newSelected = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId]

      onChange(newSelected)
    },
    [selected, onChange, disabled]
  )

  // Remove selected item
  const removeSelected = React.useCallback(
    (optionId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (disabled) return
      onChange(selected.filter((id) => id !== optionId))
    },
    [selected, onChange, disabled]
  )

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get selected option names for display
  const selectedOptions = React.useMemo(() => {
    return selected.map((id) => options.find((option) => option.id === id)).filter(Boolean) as MultiSelectOption[]
  }, [selected, options])

  return (
    <div className={cn('relative', className)}>
      {label && <Label className="text-sm font-medium text-gray-700 mb-2 block">{label}</Label>}

      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isOpen && 'ring-2 ring-ring ring-offset-2'
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <Badge key={option.id} variant="secondary" className="h-6 px-2 py-0 text-xs">
                  {option.name}
                  {!disabled && (
                    <span
                      onClick={(e) => removeSelected(option.id, e)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          removeSelected(option.id, e as any)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </Badge>
              ))
            )}
          </div>

          <div className="flex items-center">
            <svg
              className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg',
              maxHeight,
              'overflow-hidden'
            )}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-input">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                    onClick={() => toggleSelection(option.id)}
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary">
                      {selected.includes(option.id) && (
                        <div className="h-4 w-4 bg-primary rounded-sm flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{option.name}</span>
                      {option._count && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({option._count.workflows} workflows)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
