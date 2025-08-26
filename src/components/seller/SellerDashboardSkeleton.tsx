'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function SellerDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background p-6 pt-24">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="bg-background rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-background rounded-lg border p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                                </div>
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs skeleton */}
                <div className="bg-background rounded-lg border">
                    <div className="border-b p-1">
                        <div className="flex space-x-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Content skeleton */}
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                            <div className="h-9 bg-gray-200 rounded w-36 animate-pulse"></div>
                        </div>

                        {/* Workflow cards skeleton */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-background border rounded-lg p-6">
                                    <div className="flex items-start space-x-4">
                                        {/* Image placeholder */}
                                        <div className="w-40 h-32 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                                                <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>

                                            {/* Tags skeleton */}
                                            <div className="flex space-x-2">
                                                {[1, 2, 3].map((j) => (
                                                    <div key={j} className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                                                ))}
                                            </div>

                                            {/* Stats skeleton */}
                                            <div className="flex space-x-6">
                                                {[1, 2, 3, 4].map((j) => (
                                                    <div key={j} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
