'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

interface AdminPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    baseUrl: string
}

export function AdminPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    baseUrl,
}: AdminPaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page.toString())
        return `${baseUrl}?${params.toString()}`
    }

    const handlePageChange = (page: number) => {
        router.push(createPageUrl(page))
    }

    // Calculate the range of items being displayed
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('ellipsis-start')
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i)
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end')
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (totalPages <= 1) {
        return null
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Items info */}
            <div className="text-sm text-[#9DA2B3] font-aeonikpro">
                Showing {startItem} to {endItem} of {totalItems} items
            </div>

            {/* Pagination */}
            <Pagination>
                <PaginationContent>
                    {/* Previous button */}
                    <PaginationItem>
                        <PaginationPrevious
                            href={createPageUrl(currentPage - 1)}
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) {
                                    handlePageChange(currentPage - 1)
                                }
                            }}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                            size="default"
                        />
                    </PaginationItem>

                    {/* Page numbers */}
                    {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href={createPageUrl(page as number)}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(page as number)
                                    }}
                                    isActive={currentPage === page}
                                    size="icon"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Next button */}
                    <PaginationItem>
                        <PaginationNext
                            href={createPageUrl(currentPage + 1)}
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage < totalPages) {
                                    handlePageChange(currentPage + 1)
                                }
                            }}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                            size="default"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
