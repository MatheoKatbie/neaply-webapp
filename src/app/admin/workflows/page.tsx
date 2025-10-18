import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import { WorkflowStatusForm } from '@/components/admin/WorkflowStatusForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { CheckCircle, Clock, Eye, Package, XCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

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
      { seller: { displayName: { contains: search, mode: 'insensitive' } } },
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
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.workflow.count({ where }),
  ])

  return {
    workflows,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
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
    const allowed = new Set(['draft', 'published', 'unlisted', 'disabled', 'admin_disabled', 'pack_only'])
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
      currency: 'EUR',
    }).format(cents / 100)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      case 'admin_disabled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Disabled by Admin
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
        { value: 'admin_disabled', label: 'Disabled by Admin' },
        { value: 'unlisted', label: 'Unlisted' },
        { value: 'pack_only', label: 'Pack Only' },
      ],
    },
    {
      key: 'platform',
      label: 'Platform',
      options: [
        { value: 'n8n', label: 'n8n' },
        { value: 'zapier', label: 'Zapier' },
        { value: 'make', label: 'Make' },
        { value: 'airtable_script', label: 'Airtable Script' },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">Workflows Management</h1>
        <p className="text-[#9DA2B3] text-lg">Review and manage workflow submissions from creators</p>
      </div>

      <AdminSearchFilters
        searchPlaceholder="Search workflows by title, description, or creator..."
        filters={filterOptions}
        dateRangeFilter={true}
      />

      <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Package className="h-6 w-6 text-green-400" />
            <span>All Workflows ({totalCount})</span>
          </CardTitle>
          <CardDescription className="text-[#9DA2B3]/70 text-base">Review, approve, or reject workflow submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border border-[#9DA2B3]/20 rounded-lg hover:border-[#9DA2B3]/40 hover:bg-[#40424D]/20 transition-all duration-200">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-[#EDEFF7] font-aeonikpro">{workflow.title}</h3>
                    {getStatusBadge(workflow.status)}
                  </div>

                  <p className="text-sm text-[#9DA2B3]/70 line-clamp-2">{workflow.shortDesc}</p>

                  <div className="flex items-center space-x-3 text-xs text-[#9DA2B3] flex-wrap pt-1">
                    <span>By <span className="text-[#EDEFF7]">{workflow.seller.displayName}</span></span>
                    <span>•</span>
                    <span className="text-green-400 font-medium">{formatCurrency(workflow.basePriceCents)}</span>
                    <span>•</span>
                    <span>{workflow.salesCount} sales</span>
                    <span>•</span>
                    <span>⭐ {workflow._count.reviews} reviews</span>
                    <span>•</span>
                    <span>❤️ {workflow._count.favorites} favorites</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {workflow.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat.category.id} variant="outline" className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/30">
                        {cat.category.name}
                      </Badge>
                    ))}
                    {workflow.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-[#40424D]/30 text-[#9DA2B3]/70">
                        +{workflow.categories.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-[#9DA2B3]/50 pt-1">Created {formatDate(workflow.createdAt)}</p>
                </div>

                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <Button asChild variant="outline" size="sm" className="text-xs">
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
