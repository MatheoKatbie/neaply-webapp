'use client'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import * as React from 'react'
import type { Category } from '@/types/workflow'

interface CategorySelectProps {
    value: string[]
    onValueChange: (selected: string[]) => void
    categories: Category[]
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export function CategorySelect({
    value,
    onValueChange,
    categories,
    placeholder = 'Select categories...',
    error,
    required = false,
    disabled = false,
    className,
}: CategorySelectProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Filter categories based on search term
    const filteredCategories = React.useMemo(() => {
        if (!searchTerm) return categories
        return categories.filter(
            (category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.slug.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [categories, searchTerm])

    // Handle selection toggle
    const toggleSelection = React.useCallback(
        (categoryId: string) => {
            if (disabled) return

            const newSelected = value.includes(categoryId)
                ? value.filter((id) => id !== categoryId)
                : [...value, categoryId]

            onValueChange(newSelected)
        },
        [value, onValueChange, disabled]
    )

    // Remove selected category
    const removeSelected = React.useCallback(
        (categoryId: string, e: React.MouseEvent) => {
            e.stopPropagation()
            if (disabled) return
            onValueChange(value.filter((id) => id !== categoryId))
        },
        [value, onValueChange, disabled]
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

    // Get selected category names for display
    const selectedCategories = React.useMemo(() => {
        return value.map((id) => categories.find((category) => category.id === id)).filter(Boolean) as Category[]
    }, [value, categories])

    return (
        <div className={cn('relative', className)}>
            <div ref={dropdownRef} className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={cn(
                        'flex min-h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error ? 'border-red-500' : 'border-input',
                        isOpen && 'ring-2 ring-ring ring-offset-2'
                    )}
                >
                    <div className="flex flex-1 flex-wrap gap-1">
                        {selectedCategories.length === 0 ? (
                            <span className="text-muted-foreground">
                                {placeholder} {required && '*'}
                            </span>
                        ) : (
                            selectedCategories.map((category) => (
                                <Badge key={category.id} variant="secondary" className="h-6 px-2 py-0 text-xs flex items-center gap-1">
                                    {category.name}
                                    {!disabled && (
                                        <span
                                            onClick={(e) => removeSelected(category.id, e)}
                                            className="ml-1 hover:bg-muted rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    removeSelected(category.id, e as any)
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

                {/* Error message */}
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

                {/* Dropdown Content */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b border-input">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                                autoFocus
                            />
                        </div>

                        {/* Categories List */}
                        <div className="overflow-y-auto max-h-48">
                            {filteredCategories.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">No categories found</div>
                            ) : (
                                filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                                        onClick={() => toggleSelection(category.id)}
                                    >
                                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary">
                                            {value.includes(category.id) && (
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
                                            <span className="text-sm font-medium">{category.name}</span>
                                            {category._count && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    ({category._count.workflows} workflows)
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
