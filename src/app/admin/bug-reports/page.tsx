'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Bug, ExternalLink, Clock, User, Monitor, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BugReport {
    id: string
    category: string
    title: string
    description: string
    pageUrl: string | null
    userAgent: string | null
    status: string
    priority: string | null
    createdAt: string
    reporter: {
        id: string
        displayName: string
        email: string
    } | null
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    ui: { label: 'UI/Design', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    functional: { label: 'Functional', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    performance: { label: 'Performance', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    security: { label: 'Security', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    other: { label: 'Other', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof Bug }> = {
    open: { label: 'Open', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle },
    reviewing: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
    resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
    dismissed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
}

const priorityLabels: Record<string, { label: string; color: string }> = {
    low: { label: 'Low', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    high: { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

export default function AdminBugReportsPage() {
    const [reports, setReports] = useState<BugReport[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')

    const fetchReports = async () => {
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.set('status', statusFilter)
            if (categoryFilter !== 'all') params.set('category', categoryFilter)

            const response = await fetch(`/api/bug-reports?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch bug reports')

            const data = await response.json()
            setReports(data.bugReports || [])
        } catch (error) {
            console.error('Error fetching bug reports:', error)
            toast.error('Failed to load bug reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [statusFilter, categoryFilter])

    const updateStatus = async (reportId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/bug-reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) throw new Error('Failed to update status')

            toast.success('Status updated')
            fetchReports()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const updatePriority = async (reportId: string, newPriority: string) => {
        try {
            const response = await fetch(`/api/bug-reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority }),
            })

            if (!response.ok) throw new Error('Failed to update priority')

            toast.success('Priority updated')
            fetchReports()
        } catch (error) {
            console.error('Error updating priority:', error)
            toast.error('Failed to update priority')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const stats = {
        total: reports.length,
        open: reports.filter(r => r.status === 'open').length,
        inProgress: reports.filter(r => r.status === 'reviewing').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">Bug Reports</h1>
                <p className="text-[#9DA2B3] text-lg">Manage and track bug reports from users</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-[#9DA2B3]/25">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#9DA2B3]">Total Reports</CardTitle>
                        <Bug className="h-4 w-4 text-[#9DA2B3]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#EDEFF7]">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-orange-500/25">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#9DA2B3]">Open</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">{stats.open}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-blue-500/25">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#9DA2B3]">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-green-500/25">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#9DA2B3]">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-[#1E1E24] border-[#9DA2B3]/25">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E24] border-[#9DA2B3]/25">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="reviewing">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Closed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] bg-[#1E1E24] border-[#9DA2B3]/25">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E24] border-[#9DA2B3]/25">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ui">UI/Design</SelectItem>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bug Reports List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EDEFF7]"></div>
                </div>
            ) : reports.length === 0 ? (
                <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bug className="h-12 w-12 text-[#9DA2B3]/50 mb-4" />
                        <p className="text-[#9DA2B3]">No bug reports found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => {
                        const category = categoryLabels[report.category] || categoryLabels.other
                        const status = statusLabels[report.status] || statusLabels.open
                        const StatusIcon = status.icon

                        return (
                            <Card key={report.id} className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 hover:border-[#9DA2B3]/50 transition-colors">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <Badge className={`${category.color} border`}>
                                                    {category.label}
                                                </Badge>
                                                <Badge className={`${status.color} border flex items-center gap-1`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </Badge>
                                                {report.priority && priorityLabels[report.priority] && (
                                                    <Badge className={`${priorityLabels[report.priority].color} border`}>
                                                        {priorityLabels[report.priority].label}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg text-[#EDEFF7]">{report.title}</CardTitle>
                                            <CardDescription className="mt-2 text-[#9DA2B3] line-clamp-2">
                                                {report.description}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Select
                                                value={report.status}
                                                onValueChange={(value) => updateStatus(report.id, value)}
                                            >
                                                <SelectTrigger className="w-[130px] bg-[#1E1E24] border-[#9DA2B3]/25 h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1E1E24] border-[#9DA2B3]/25">
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="reviewing">In Progress</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="dismissed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={report.priority || 'none'}
                                                onValueChange={(value) => updatePriority(report.id, value === 'none' ? '' : value)}
                                            >
                                                <SelectTrigger className="w-[100px] bg-[#1E1E24] border-[#9DA2B3]/25 h-8 text-xs">
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1E1E24] border-[#9DA2B3]/25">
                                                    <SelectItem value="none">No Priority</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6 text-xs text-[#9DA2B3]">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(report.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {report.reporter?.displayName || 'Anonymous'}
                                        </div>
                                        {report.pageUrl && (
                                            <a
                                                href={report.pageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-[#EDEFF7] transition-colors"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View Page
                                            </a>
                                        )}
                                        {report.userAgent && (
                                            <div className="flex items-center gap-1" title={report.userAgent}>
                                                <Monitor className="h-3 w-3" />
                                                Browser Info
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
