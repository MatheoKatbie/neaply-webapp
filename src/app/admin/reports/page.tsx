import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flag, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'

async function getReports(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    reason?: string,
    dateFrom?: string,
    dateTo?: string
) {
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
        // Check if search looks like a UUID
        const isUuidSearch = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search)

        if (isUuidSearch) {
            // If it's a UUID search, search by report ID
            where.id = search
        } else {
            // If it's not a UUID, search by other fields
            where.OR = [
                { reporter: { displayName: { contains: search, mode: 'insensitive' } } },
                { reporter: { email: { contains: search, mode: 'insensitive' } } },
                { workflow: { title: { contains: search, mode: 'insensitive' } } },
                { workflow: { seller: { displayName: { contains: search, mode: 'insensitive' } } } }
            ]
        }
    }

    if (status && status !== 'all') {
        where.status = status
    }

    if (reason && reason !== 'all') {
        where.reason = reason
    }

    if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [reports, totalCount] = await Promise.all([
        prisma.report.findMany({
            where,
            include: {
                reporter: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                workflow: {
                    select: {
                        title: true,
                        seller: {
                            select: {
                                displayName: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.report.count({ where })
    ])

    return {
        reports,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    }
}

export default async function AdminReports({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        search?: string
        status?: string
        reason?: string
        dateFrom?: string
        dateTo?: string
    }>
}) {
    // Await searchParams as required in Next.js 15
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const { reports, totalCount, totalPages, currentPage } = await getReports(
        page,
        10,
        params.search,
        params.status,
        params.reason,
        params.dateFrom,
        params.dateTo
    )

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Open
                    </Badge>
                )
            case 'reviewing':
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Reviewing
                    </Badge>
                )
            case 'resolved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                    </Badge>
                )
            case 'dismissed':
                return (
                    <Badge variant="secondary">
                        Dismissed
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline">
                        {status}
                    </Badge>
                )
        }
    }

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'open', label: 'Open' },
                { value: 'reviewing', label: 'Reviewing' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'dismissed', label: 'Dismissed' }
            ]
        },
        {
            key: 'reason',
            label: 'Reason',
            options: [
                { value: 'inappropriate_content', label: 'Inappropriate Content' },
                { value: 'copyright_violation', label: 'Copyright Violation' },
                { value: 'spam', label: 'Spam' },
                { value: 'misleading', label: 'Misleading' },
                { value: 'other', label: 'Other' }
            ]
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
                <p className="text-muted-foreground">Review and handle user reports</p>
            </div>

            <AdminSearchFilters
                searchPlaceholder="Search reports by ID, reporter name, email, or workflow..."
                filters={filterOptions}
                dateRangeFilter={true}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Flag className="h-5 w-5" />
                        <span>All Reports ({totalCount})</span>
                    </CardTitle>
                    <CardDescription>
                        Review and take action on user-submitted reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-medium">Report #{report.id}</h3>
                                        {getStatusBadge(report.status)}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>Reporter: {report.reporter?.displayName}</span>
                                        <span>•</span>
                                        <span>{report.reporter?.email}</span>
                                        <span>•</span>
                                        <span className="font-medium">Type: {report.reason}</span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">Workflow: </span>
                                        <span>{report.workflow.title}</span>
                                        <span className="text-gray-400"> by {report.workflow.seller.displayName}</span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">Description: </span>
                                        <span>{report.reason}</span>
                                    </div>

                                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                                        <span>Reported: {formatDate(report.createdAt)}</span>
                                        {report.status === 'resolved' && (
                                            <>
                                                <span>•</span>
                                                <span>Resolved: {formatDate(report.createdAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button>
                                    {report.status === 'open' && (
                                        <>
                                            <Button variant="outline" size="sm">
                                                <Clock className="h-4 w-4 mr-1" />
                                                Start Review
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Resolve
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={10}
                baseUrl="/admin/reports"
            />
        </div>
    )
}
