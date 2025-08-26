import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { WorkflowStatusForm } from '@/components/admin/WorkflowStatusForm'

async function getWorkflows(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    platform?: string,
    dateFrom?: string,
    dateTo?: string
) {
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { shortDesc: { contains: search, mode: 'insensitive' } },
            { seller: { displayName: { contains: search, mode: 'insensitive' } } }
        ]
    }

    if (status && status !== 'all') {
        where.status = status
    }

    if (platform && platform !== 'all') {
        where.platform = platform
    }

    if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [workflows, totalCount] = await Promise.all([
        prisma.workflow.findMany({
            where,
            include: {
                seller: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                categories: {
                    include: {
                        category: true
                    }
                },
                _count: {
                    select: {
                        reviews: true,
                        favorites: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.workflow.count({ where })
    ])

    return {
        workflows,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    }
}

export default async function AdminWorkflows({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        search?: string
        status?: string
        platform?: string
        dateFrom?: string
        dateTo?: string
    }>
}) {
    async function disableWorkflowAction(formData: FormData) {
        'use server'
        const workflowId = formData.get('workflowId') as string
        if (!workflowId) return
        await prisma.workflow.update({
            where: { id: workflowId },
            data: { status: 'disabled' },
        })
        revalidatePath('/admin/workflows')
    }

    async function updateWorkflowStatusAction(formData: FormData) {
        'use server'
        const workflowId = formData.get('workflowId') as string
        const status = formData.get('status') as string
        if (!workflowId || !status) return
        const allowed = new Set(['draft', 'published', 'unlisted', 'disabled'])
        if (!allowed.has(status)) return
        await prisma.workflow.update({
            where: { id: workflowId },
            data: { status: status as any },
        })
        revalidatePath('/admin/workflows')
    }

    // Await searchParams as required in Next.js 15
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const { workflows, totalCount, totalPages, currentPage } = await getWorkflows(
        page,
        10,
        params.search,
        params.status,
        params.platform,
        params.dateFrom,
        params.dateTo
    )

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(cents / 100)
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Published
                    </Badge>
                )
            case 'draft':
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Draft
                    </Badge>
                )
            case 'disabled':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Disabled
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
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'disabled', label: 'Disabled' },
                { value: 'unlisted', label: 'Unlisted' }
            ]
        },
        {
            key: 'platform',
            label: 'Platform',
            options: [
                { value: 'n8n', label: 'n8n' },
                { value: 'zapier', label: 'Zapier' },
                { value: 'make', label: 'Make' },
                { value: 'airtable_script', label: 'Airtable Script' }
            ]
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground font-space-grotesk">Workflows Management</h1>
                <p className="text-muted-foreground">Review and manage workflow submissions</p>
            </div>

            <AdminSearchFilters
                searchPlaceholder="Search workflows by title, description, or creator..."
                filters={filterOptions}
                dateRangeFilter={true}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>All Workflows ({totalCount})</span>
                    </CardTitle>
                    <CardDescription>
                        Review, approve, or reject workflow submissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-medium">{workflow.title}</h3>
                                        {getStatusBadge(workflow.status)}
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {workflow.shortDesc}
                                    </p>

                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>By {workflow.seller.displayName}</span>
                                        <span>•</span>
                                        <span>{formatCurrency(workflow.basePriceCents)}</span>
                                        <span>•</span>
                                        <span>{workflow.salesCount} sales</span>
                                        <span>•</span>
                                        <span>{workflow._count.reviews} reviews</span>
                                        <span>•</span>
                                        <span>{workflow._count.favorites} favorites</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {workflow.categories.slice(0, 3).map((cat) => (
                                            <Badge key={cat.category.id} variant="outline" className="text-xs">
                                                {cat.category.name}
                                            </Badge>
                                        ))}
                                        {workflow.categories.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{workflow.categories.length - 3} more
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-400">
                                        Created {formatDate(workflow.createdAt)}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/workflow/${workflow.id}`}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Link>
                                    </Button>
                                    <WorkflowStatusForm
                                        workflowId={workflow.id}
                                        defaultStatus={workflow.status}
                                        action={updateWorkflowStatusAction}
                                    />
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
                baseUrl="/admin/workflows"
            />
        </div>
    )
}
