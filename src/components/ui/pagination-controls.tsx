'use client'

import * as React from 'react'
import { usePagination } from '@/hooks/usePagination'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginationControlsProps<T> {
    items: T[]
    itemsPerPage: number
    currentPage?: number
    onPageChange?: (page: number) => void
    className?: string
    showInfo?: boolean
}

export function PaginationControls<T>({
    items,
    itemsPerPage,
    currentPage = 1,
    onPageChange,
    className,
    showInfo = true,
}: PaginationControlsProps<T>) {
    const {
        currentPage: paginationPage,
        totalPages,
        totalItems,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        pageNumbers,
        startIndex,
        endIndex,
    } = usePagination({
        items,
        itemsPerPage,
        initialPage: currentPage,
    })

    const handlePageChange = (page: number) => {
        goToPage(page)
        onPageChange?.(page)
    }

    const handleNextPage = () => {
        goToNextPage()
        onPageChange?.(paginationPage + 1)
    }

    const handlePreviousPage = () => {
        goToPreviousPage()
        onPageChange?.(paginationPage - 1)
    }

    // Don't render pagination if there's only one page or no items
    if (totalPages <= 1 || totalItems === 0) {
        return null
    }

    return (
        <div className={className}>
            {showInfo && totalItems > 0 && (
                <div className="text-sm text-muted-foreground mb-4 text-center">
                    Showing {startIndex + 1} to {endIndex} of {totalItems} items
                </div>
            )}

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (hasPreviousPage) {
                                    handlePreviousPage()
                                }
                            }}
                            className={!hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>

                    {pageNumbers.map((pageNumber, index) => {
                        // Show ellipsis if there's a gap
                        const showEllipsisBefore = index === 0 && pageNumber > 1
                        const showEllipsisAfter = index === pageNumbers.length - 1 && pageNumber < totalPages

                        return (
                            <React.Fragment key={pageNumber}>
                                {showEllipsisBefore && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(pageNumber)
                                        }}
                                        isActive={pageNumber === paginationPage}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>

                                {showEllipsisAfter && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                            </React.Fragment>
                        )
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (hasNextPage) {
                                    handleNextPage()
                                }
                            }}
                            className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

// Export the hook for direct use if needed
export { usePagination }
