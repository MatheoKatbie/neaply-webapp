'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter, Calendar } from 'lucide-react'

interface FilterOption {
    key: string
    label: string
    options: { value: string; label: string }[]
}

interface AdminSearchFiltersProps {
    searchPlaceholder?: string
    filters?: FilterOption[]
    dateRangeFilter?: boolean
}

export function AdminSearchFilters({
    searchPlaceholder = "Search...",
    filters = [],
    dateRangeFilter = false
}: AdminSearchFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // Initialize filters from URL params
    useEffect(() => {
        const newActiveFilters: Record<string, string> = {}

        // Get search query
        const search = searchParams.get('search')
        if (search) {
            setSearchQuery(search)
        }

        // Get filter values
        filters.forEach(filter => {
            const value = searchParams.get(filter.key)
            if (value) {
                newActiveFilters[filter.key] = value
            }
        })

        // Get date range
        const from = searchParams.get('dateFrom')
        const to = searchParams.get('dateTo')
        if (from) setDateFrom(from)
        if (to) setDateTo(to)

        setActiveFilters(newActiveFilters)
    }, [searchParams, filters])

    const updateURL = (newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        // Clear existing params
        params.delete('search')
        filters.forEach(filter => params.delete(filter.key))
        if (dateRangeFilter) {
            params.delete('dateFrom')
            params.delete('dateTo')
        }

        // Add new params
        Object.entries(newParams).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value)
            }
        })

        router.push(`?${params.toString()}`)
    }

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        const newParams = { ...activeFilters, search: value }
        updateURL(newParams)
    }

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...activeFilters }

        if (value && value !== 'all') {
            newFilters[key] = value
        } else {
            delete newFilters[key]
        }

        setActiveFilters(newFilters)
        updateURL({ ...newFilters, search: searchQuery })
    }

    const handleDateRangeChange = () => {
        const newParams: Record<string, string> = { ...activeFilters, search: searchQuery }
        if (dateFrom) newParams.dateFrom = dateFrom
        if (dateTo) newParams.dateTo = dateTo
        updateURL(newParams)
    }

    const clearFilter = (key: string) => {
        const newFilters = { ...activeFilters }
        delete newFilters[key]
        setActiveFilters(newFilters)
        updateURL({ ...newFilters, search: searchQuery })
    }

    const clearAllFilters = () => {
        setSearchQuery('')
        setActiveFilters({})
        setDateFrom('')
        setDateTo('')
        router.push(window.location.pathname)
    }

    const hasActiveFilters = searchQuery || Object.keys(activeFilters).length > 0 || dateFrom || dateTo

    return (
        <div className="space-y-4">
            {/* Search and Filters Row */}
            <div className="flex flex-wrap gap-3">
                {/* Search Input */}
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9DA2B3]" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 py-5"
                        />
                    </div>
                </div>

                {/* Filter Dropdowns */}
                {filters.map((filter) => (
                    <Select
                        key={filter.key}
                        value={activeFilters[filter.key] || 'all'}
                        onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder={`All ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All {filter.label}</SelectItem>
                            {filter.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}

                {/* Date Range Filters */}
                {dateRangeFilter && (
                    <div className="flex gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9DA2B3] pointer-events-none" />
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="pl-10 py-4 w-40 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                placeholder="From"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9DA2B3] pointer-events-none" />
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="pl-10 py-4 w-40 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                placeholder="To"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleDateRangeChange}
                        >
                            Apply
                        </Button>
                    </div>
                )}

                {/* Clear All Button */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={clearAllFilters}
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Search: {searchQuery}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleSearch('')}
                            />
                        </Badge>
                    )}

                    {Object.entries(activeFilters).map(([key, value]) => {
                        const filter = filters.find(f => f.key === key)
                        const option = filter?.options.find(o => o.value === value)
                        return (
                            <Badge key={key} variant="secondary" className="flex items-center gap-1">
                                {filter?.label}: {option?.label || value}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => clearFilter(key)}
                                />
                            </Badge>
                        )
                    })}

                    {dateFrom && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            From: {dateFrom}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setDateFrom('')
                                    handleDateRangeChange()
                                }}
                            />
                        </Badge>
                    )}

                    {dateTo && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            To: {dateTo}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setDateTo('')
                                    handleDateRangeChange()
                                }}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
