import { useState, useMemo } from 'react'

interface UsePaginationProps<T> {
    items: T[]
    itemsPerPage: number
    initialPage?: number
}

interface UsePaginationReturn<T> {
    currentItems: T[]
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    goToPage: (page: number) => void
    goToNextPage: () => void
    goToPreviousPage: () => void
    goToFirstPage: () => void
    goToLastPage: () => void
    pageNumbers: number[]
    startIndex: number
    endIndex: number
}

export function usePagination<T>({
    items,
    itemsPerPage,
    initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(initialPage)

    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Ensure current page is within valid range
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))

    const startIndex = (validCurrentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

    const currentItems = useMemo(() => {
        return items.slice(startIndex, endIndex)
    }, [items, startIndex, endIndex])

    const hasNextPage = validCurrentPage < totalPages
    const hasPreviousPage = validCurrentPage > 1

    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(validPage)
    }

    const goToNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(validCurrentPage + 1)
        }
    }

    const goToPreviousPage = () => {
        if (hasPreviousPage) {
            setCurrentPage(validCurrentPage - 1)
        }
    }

    const goToFirstPage = () => {
        setCurrentPage(1)
    }

    const goToLastPage = () => {
        setCurrentPage(totalPages)
    }

    // Generate page numbers for pagination component
    const pageNumbers = useMemo(() => {
        const pages: number[] = []
        const maxVisiblePages = 5 // Show max 5 page numbers

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show pages around current page
            const start = Math.max(1, validCurrentPage - 2)
            const end = Math.min(totalPages, validCurrentPage + 2)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
        }

        return pages
    }, [totalPages, validCurrentPage])

    return {
        currentItems,
        currentPage: validCurrentPage,
        totalPages,
        totalItems,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        pageNumbers,
        startIndex,
        endIndex,
    }
}
