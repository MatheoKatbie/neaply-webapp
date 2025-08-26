'use client'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { X, Search } from 'lucide-react'
import * as React from 'react'

export interface WorkflowOption {
    id: string
    title: string
    shortDesc: string
    heroImageUrl?: string
    basePriceCents: number
    currency: string
    salesCount: number
    ratingAvg: number
    ratingCount: number
}

interface WorkflowMultiSelectProps {
    workflows: WorkflowOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    maxHeight?: string
    disabled?: boolean
    className?: string
    label?: string
    maxSelection?: number
}

export function WorkflowMultiSelect({
    workflows,
    selected,
    onChange,
    placeholder = 'Select workflows...',
    maxHeight = 'max-h-60',
    disabled = false,
    className,
    label,
    maxSelection = 10,
}: WorkflowMultiSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Filter workflows based on search term
    const filteredWorkflows = React.useMemo(() => {
        if (!searchTerm) return workflows
        return workflows.filter(
            (workflow) =>
                workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workflow.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [workflows, searchTerm])

    // Handle selection toggle
    const toggleSelection = React.useCallback(
        (workflowId: string) => {
            if (disabled) return

            const newSelected = selected.includes(workflowId)
                ? selected.filter((id) => id !== workflowId)
                : selected.length < maxSelection
                    ? [...selected, workflowId]
                    : selected

            onChange(newSelected)
        },
        [selected, onChange, disabled, maxSelection]
    )

    // Remove selected workflow
    const removeSelected = React.useCallback(
        (workflowId: string, e: React.MouseEvent) => {
            e.stopPropagation()
            if (disabled) return
            onChange(selected.filter((id) => id !== workflowId))
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

    // Get selected workflows for display
    const selectedWorkflows = React.useMemo(() => {
        return selected.map((id) => workflows.find((workflow) => workflow.id === id)).filter(Boolean) as WorkflowOption[]
    }, [selected, workflows])

    // Format price helper
    const formatPrice = (cents: number, currency: string) => {
        const amount = cents / 100
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

    return (
        <div className={cn('relative', className)}>
            {label && <Label className="text-sm font-medium text-muted-foreground mb-2 block">{label}</Label>}

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
                        {selectedWorkflows.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            selectedWorkflows.map((workflow) => (
                                <Badge key={workflow.id} variant="secondary" className="h-6 px-2 py-0 text-xs">
                                    {workflow.title}
                                    {!disabled && (
                                        <span
                                            onClick={(e) => removeSelected(workflow.id, e)}
                                            className="ml-1 hover:bg-muted rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    removeSelected(workflow.id, e as any)
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
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search workflows..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>
                        </div>

                        {/* Workflows List */}
                        <div className="overflow-y-auto max-h-48">
                            {filteredWorkflows.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">No workflows found</div>
                            ) : (
                                filteredWorkflows.map((workflow) => {
                                    const isSelected = selected.includes(workflow.id)
                                    const isDisabled = !isSelected && selected.length >= maxSelection

                                    return (
                                        <div
                                            key={workflow.id}
                                            className={cn(
                                                "flex items-start space-x-3 p-3 hover:bg-muted cursor-pointer transition-colors",
                                                isDisabled && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={() => !isDisabled && toggleSelection(workflow.id)}
                                        >
                                            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary mt-0.5">
                                                {isSelected && (
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
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium truncate">{workflow.title}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {formatPrice(workflow.basePriceCents, workflow.currency)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {workflow.shortDesc}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                                    <span>{workflow.salesCount} sales</span>
                                                    <span>★ {Number(workflow.ratingAvg).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Selection counter */}
                        <div className="p-2 border-t border-input bg-muted/50">
                            <div className="text-xs text-muted-foreground text-center">
                                {selected.length}/{maxSelection} workflows selected
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
