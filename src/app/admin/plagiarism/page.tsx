'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertTriangle,
    ShieldAlert,
    Info,
    MoreHorizontal,
    ExternalLink,
    CheckCircle,
    XCircle,
    RefreshCw,
    User,
    Calendar,
    DollarSign,
    Download,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface SimilarityMatch {
    workflowId: string
    workflowTitle: string
    workflowSlug: string
    similarityScore: number
}

interface FlaggedWorkflow {
    id: string
    title: string
    slug: string
    status: string
    similarityScore: number | null
    similaritySeverity: string | null
    similarityMatches: SimilarityMatch[] | null
    basePriceCents: number
    currency: string
    createdAt: string
    updatedAt: string
    seller: {
        id: string
        displayName: string
        email: string
        storeName: string | null
        storeSlug: string | null
    }
    categories: Array<{
        id: string
        name: string
    }>
}

interface PlagiarismSummary {
    total: number
    info: number
    warning: number
    critical: number
}

export default function AdminPlagiarismPage() {
    const [workflows, setWorkflows] = useState<FlaggedWorkflow[]>([])
    const [summary, setSummary] = useState<PlagiarismSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filter, setFilter] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
            })
            if (filter) {
                params.set('severity', filter)
            }

            const response = await fetch(`/api/admin/plagiarism?${params}`)
            if (!response.ok) throw new Error('Failed to fetch plagiarism data')
            
            const data = await response.json()
            setWorkflows(data.data)
            setSummary(data.summary)
            setTotalPages(data.pagination.totalPages)
        } catch (error) {
            console.error('Error fetching plagiarism data:', error)
            toast.error('Failed to load plagiarism data')
        } finally {
            setLoading(false)
        }
    }, [currentPage, filter])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleAction = async (workflowId: string, action: 'dismiss' | 'disable' | 'unpublish') => {
        setActionLoading(workflowId)
        try {
            const response = await fetch(`/api/admin/plagiarism/${workflowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })

            if (!response.ok) throw new Error('Failed to update workflow')

            const data = await response.json()
            toast.success(data.message)
            
            // Refresh the list
            fetchData()
        } catch (error) {
            console.error('Error updating workflow:', error)
            toast.error('Failed to update workflow')
        } finally {
            setActionLoading(null)
        }
    }

    // Download workflow JSON from the admin API
    const handleDownloadWorkflow = async (workflowId: string, workflowTitle: string) => {
        try {
            const response = await fetch(`/api/admin/plagiarism/${workflowId}/download`)
            if (!response.ok) {
                throw new Error('Failed to download workflow')
            }
            
            const data = await response.json()
            const jsonContent = data.jsonContent || data
            
            // Create and download file
            const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${workflowTitle.replace(/[^a-zA-Z0-9]/g, '_')}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            toast.success(`Downloaded: ${workflowTitle}`)
        } catch (error) {
            console.error('Error downloading workflow:', error)
            toast.error('Failed to download workflow')
        }
    }

    const getSeverityConfig = (severity: string | null) => {
        const configs = {
            critical: { 
                color: 'bg-red-500/20 text-red-400 border-red-500/50', 
                icon: XCircle,
                label: 'Critical',
                borderColor: 'border-red-500/50'
            },
            warning: { 
                color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', 
                icon: AlertTriangle,
                label: 'Warning',
                borderColor: 'border-yellow-500/50'
            },
            info: { 
                color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', 
                icon: Info,
                label: 'Info',
                borderColor: 'border-blue-500/50'
            },
        }
        return configs[severity as keyof typeof configs] || configs.info
    }

    const formatPrice = (cents: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(cents / 100)
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString))
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">
                    Plagiarism Detection
                </h1>
                <p className="text-[#9DA2B3] text-lg">
                    Review workflows flagged for similarity issues
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#1E1E24] border-[#9DA2B3]/25">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-[#9DA2B3]">Total Flagged</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-2xl font-bold text-[#EDEFF7]">{summary?.total || 0}</p>
                        )}
                    </CardContent>
                </Card>

                <Card 
                    className={`bg-[#1E1E24] border-[#9DA2B3]/25 cursor-pointer transition-colors ${filter === 'critical' ? 'border-red-500' : 'hover:border-red-500/50'}`}
                    onClick={() => setFilter(filter === 'critical' ? null : 'critical')}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Critical
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-2xl font-bold text-red-400">{summary?.critical || 0}</p>
                        )}
                    </CardContent>
                </Card>

                <Card 
                    className={`bg-[#1E1E24] border-[#9DA2B3]/25 cursor-pointer transition-colors ${filter === 'warning' ? 'border-yellow-500' : 'hover:border-yellow-500/50'}`}
                    onClick={() => setFilter(filter === 'warning' ? null : 'warning')}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Warning
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-2xl font-bold text-yellow-400">{summary?.warning || 0}</p>
                        )}
                    </CardContent>
                </Card>

                <Card 
                    className={`bg-[#1E1E24] border-[#9DA2B3]/25 cursor-pointer transition-colors ${filter === 'info' ? 'border-blue-500' : 'hover:border-blue-500/50'}`}
                    onClick={() => setFilter(filter === 'info' ? null : 'info')}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-2xl font-bold text-blue-400">{summary?.info || 0}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {filter && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilter(null)}
                            className="text-[#9DA2B3]"
                        >
                            Clear filter
                        </Button>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    disabled={loading}
                    className="text-[#9DA2B3]"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Workflow Cards */}
            <div className="space-y-4">
                {loading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-[#1E1E24] border-[#9DA2B3]/25">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <Skeleton className="h-6 w-64" />
                                        <Skeleton className="h-4 w-40" />
                                        <div className="flex gap-4">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : workflows.length === 0 ? (
                    // Empty state
                    <Card className="bg-[#1E1E24] border-[#9DA2B3]/25">
                        <CardContent className="py-16 text-center">
                            <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-[#9DA2B3] opacity-50" />
                            <h3 className="text-xl font-semibold text-[#EDEFF7] mb-2">No Flagged Workflows</h3>
                            <p className="text-[#9DA2B3]">
                                {filter 
                                    ? `No workflows with ${filter} severity found.`
                                    : 'No workflows have been flagged for similarity issues.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    // Workflow list
                    workflows.map((workflow) => {
                        const severityConfig = getSeverityConfig(workflow.similaritySeverity)
                        const SeverityIcon = severityConfig.icon

                        return (
                            <Card 
                                key={workflow.id} 
                                className={`bg-[#1E1E24] border-[#9DA2B3]/25 hover:border-[#9DA2B3]/40 transition-colors ${severityConfig.borderColor}`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Title and link */}
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <Link 
                                                    href={`/workflow/${workflow.id}`}
                                                    className="text-lg font-semibold text-[#EDEFF7] hover:text-blue-400 flex items-center gap-2"
                                                    target="_blank"
                                                >
                                                    {workflow.title}
                                                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                                </Link>
                                                <Badge className={`${severityConfig.color} border flex-shrink-0`}>
                                                    <SeverityIcon className="h-3 w-3 mr-1" />
                                                    {severityConfig.label}
                                                    {workflow.similarityScore !== null && (
                                                        <span className="ml-1">({workflow.similarityScore}%)</span>
                                                    )}
                                                </Badge>
                                                <Badge 
                                                    variant="outline" 
                                                    className={
                                                        workflow.status === 'published' 
                                                            ? 'border-green-500/50 text-green-400'
                                                            : workflow.status === 'admin_disabled'
                                                            ? 'border-red-500/50 text-red-400'
                                                            : 'border-[#9DA2B3]/50 text-[#9DA2B3]'
                                                    }
                                                >
                                                    {workflow.status}
                                                </Badge>
                                            </div>

                                            {/* Categories */}
                                            <p className="text-sm text-[#9DA2B3] mb-3">
                                                {workflow.categories.map(c => c.name).join(', ') || 'No categories'}
                                            </p>

                                            {/* Meta info */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-[#9DA2B3]">
                                                    <User className="h-4 w-4" />
                                                    <span>{workflow.seller.displayName}</span>
                                                    <span className="text-[#9DA2B3]/60">({workflow.seller.email})</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#9DA2B3]">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>{formatPrice(workflow.basePriceCents, workflow.currency)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#9DA2B3]">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(workflow.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Similar workflows section */}
                                            {workflow.similarityMatches && workflow.similarityMatches.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-[#9DA2B3]/25">
                                                    <h4 className="text-sm font-medium text-[#EDEFF7] mb-3 flex items-center gap-2">
                                                        <ShieldAlert className="h-4 w-4 text-orange-400" />
                                                        Similar to these workflows:
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {workflow.similarityMatches.map((match, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#16161A] border border-[#9DA2B3]/20"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <Link
                                                                        href={`/workflow/${match.workflowId}`}
                                                                        target="_blank"
                                                                        className="text-sm text-[#EDEFF7] hover:text-blue-400 truncate flex items-center gap-1"
                                                                    >
                                                                        {match.workflowTitle}
                                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                                    </Link>
                                                                    <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-400 flex-shrink-0">
                                                                        {match.similarityScore}% similar
                                                                    </Badge>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadWorkflow(match.workflowId, match.workflowTitle)}
                                                                    className="text-[#9DA2B3] flex-shrink-0"
                                                                >
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Download both button */}
                                                    <div className="mt-3 flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadWorkflow(workflow.id, workflow.title)}
                                                            className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10"
                                                        >
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Download flagged workflow
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    disabled={actionLoading === workflow.id}
                                                    className="flex-shrink-0"
                                                >
                                                    {actionLoading === workflow.id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1E1E24] border-[#9DA2B3]/25">
                                                <DropdownMenuItem 
                                                    onClick={() => handleAction(workflow.id, 'dismiss')}
                                                    className="text-green-400 focus:text-green-400 focus:bg-green-500/10"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Dismiss Flag
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleAction(workflow.id, 'unpublish')}
                                                    className="text-yellow-400 focus:text-yellow-400 focus:bg-yellow-500/10"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Unpublish
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleAction(workflow.id, 'disable')}
                                                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Disable Workflow
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="text-[#9DA2B3]"
                    >
                        Previous
                    </Button>
                    <span className="text-[#9DA2B3] py-2 px-4">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="text-[#9DA2B3]"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
