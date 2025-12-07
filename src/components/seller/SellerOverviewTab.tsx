'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Workflow } from '@/types/workflow'
import { formatPrice, getStatusColor, STATUS_LABELS } from '@/types/workflow'

interface SellerOverviewTabProps {
    workflows: Workflow[]
    analyticsOverview: {
        totalWorkflows: number
        totalPacks: number
        totalFavorites: number
        totalRevenueCents: number
        totalSales: number
    } | null
    onResetTouchedState: () => void
    onSetShowCreateForm: (show: boolean) => void
    onSetActiveTab: (tab: string) => void
}

export function SellerOverviewTab({
    workflows,
    analyticsOverview,
    onResetTouchedState,
    onSetShowCreateForm,
    onSetActiveTab,
}: SellerOverviewTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{workflows.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{workflows.filter((w) => w.status === 'published').length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsOverview?.totalSales ?? 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(analyticsOverview?.totalRevenueCents ?? 0, 'EUR')}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest workflows and packs updates</CardDescription>
                </CardHeader>
                <CardContent>
                    {workflows.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-[#9DA2B3] mb-4 font-aeonikpro">No workflows yet</p>
                            <Button
                                onClick={() => {
                                    onResetTouchedState()
                                    onSetShowCreateForm(true)
                                    onSetActiveTab('workflows')
                                }}
                            >
                                Create Your First Workflow
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {workflows
                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                .slice(0, 5)
                                .map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-[#9DA2B3]/25 rounded-lg bg-[#40424D]/20">
                                        <div className="flex items-center space-x-4 flex-1">
                                            {/* Thumbnail Preview */}
                                            <div className="flex-shrink-0">
                                                {item.heroImageUrl ? (
                                                    <div className="w-24 h-16 rounded-md overflow-hidden bg-[#40424D]/30 border border-[#9DA2B3]/25">
                                                        <img
                                                            src={item.heroImageUrl}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                // Fallback to placeholder if image fails to load
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                                target.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-[#40424D]/30 text-[#9DA2B3]">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-16 rounded-md bg-[#40424D]/30 border border-[#9DA2B3]/25 flex items-center justify-center">
                                                        <svg
                                                            className="w-6 h-6 text-[#9DA2B3]"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            ></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div>
                                                <h3 className="font-medium text-[#EDEFF7] font-aeonikpro">{item.title}</h3>
                                                <p className="text-sm text-[#9DA2B3] font-aeonikpro">{item.shortDesc}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Badge className={getStatusColor(item.status)}>
                                                        {STATUS_LABELS[item.status] || item.status}
                                                    </Badge>
                                                    <span className="text-sm text-[#9DA2B3] font-aeonikpro">{item._count.orderItems} sales</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-[#EDEFF7] font-aeonikpro">{formatPrice(item.basePriceCents, item.currency)}</div>
                                            <div className="text-sm text-[#9DA2B3] font-aeonikpro">
                                                Updated {new Date(item.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
