import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminReportsClient } from '@/components/admin/AdminReportsClient'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import { prisma } from '@/lib/prisma'

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
        { workflow: { seller: { displayName: { contains: search, mode: 'insensitive' } } } },
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
            email: true,
          },
        },
        workflow: {
          select: {
            title: true,
            seller: {
              select: {
                displayName: true,
              },
            },
          },
        },
        store: {
          select: {
            storeName: true,
            status: true,
            user: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ])

  return {
    reports,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
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

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'reviewing', label: 'Reviewing' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' },
      ],
    },
    {
      key: 'reason',
      label: 'Reason',
      options: [
        { value: 'inappropriate_content', label: 'Inappropriate Content' },
        { value: 'copyright_violation', label: 'Copyright Violation' },
        { value: 'spam', label: 'Spam' },
        { value: 'misleading', label: 'Misleading' },
        { value: 'other', label: 'Other' },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">Reports Management</h1>
        <p className="text-[#9DA2B3] text-lg">Review and handle user reports and violations</p>
      </div>

      <AdminSearchFilters
        searchPlaceholder="Search reports by ID, reporter name, email, or workflow..."
        filters={filterOptions}
        dateRangeFilter={true}
      />

      <AdminReportsClient initialReports={reports} totalCount={totalCount} />

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
