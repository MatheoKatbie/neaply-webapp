import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog'
import { revalidatePath } from 'next/cache'

async function getOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    provider?: string,
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
            // If it's a UUID search, search by order ID
            where.id = search
        } else {
            // If it's not a UUID, search by other fields
            where.OR = [
                { user: { displayName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { items: { some: { workflow: { title: { contains: search, mode: 'insensitive' } } } } }
            ]
        }
    }

    if (status && status !== 'all') {
        where.status = status
    }

    if (provider && provider !== 'all') {
        where.provider = provider
    }

    if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                items: {
                    include: {
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
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.order.count({ where })
    ])

    return {
        orders,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    }
}

export default async function AdminOrders({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        search?: string
        status?: string
        provider?: string
        dateFrom?: string
        dateTo?: string
    }>
}) {
    async function markPaidAction(formData: FormData) {
        'use server'
        const orderId = formData.get('orderId') as string
        if (!orderId) return
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'paid', paidAt: new Date() },
        })
        revalidatePath('/admin/orders')
    }
    // Await searchParams as required in Next.js 15
    const params = await searchParams
    const page = parseInt(params.page || '1')

    const { orders, totalCount, totalPages, currentPage } = await getOrders(
        page,
        10,
        params.search,
        params.status,
        params.provider,
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                )
            case 'refunded':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Refunded
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Cancelled
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
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'cancelled', label: 'Cancelled' }
            ]
        },
        {
            key: 'provider',
            label: 'Payment Provider',
            options: [
                { value: 'stripe', label: 'Stripe' },
                { value: 'paypal', label: 'PayPal' }
            ]
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
                <p className="text-muted-foreground">View and manage all orders</p>
            </div>

            <AdminSearchFilters
                searchPlaceholder="Search orders by ID, customer name, email, or workflow..."
                filters={filterOptions}
                dateRangeFilter={true}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5" />
                        <span>All Orders ({totalCount})</span>
                    </CardTitle>
                    <CardDescription>
                        Monitor order status and payment information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-medium">Order #{order.id}</h3>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>Customer: {order.user.displayName}</span>
                                        <span>•</span>
                                        <span>{order.user.email}</span>
                                        <span>•</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(order.totalCents)}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="text-sm text-muted-foreground">
                                                <span className="font-medium">{item.workflow.title}</span>
                                                <span className="text-gray-400"> by {item.workflow.seller.displayName}</span>
                                                <span className="text-gray-400"> • {formatCurrency(item.unitPriceCents)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                                        <span>Created: {formatDate(order.createdAt)}</span>
                                        {order.paidAt && (
                                            <>
                                                <span>•</span>
                                                <span>Paid: {formatDate(order.paidAt)}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>Provider: {order.provider}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <OrderDetailsDialog
                                        order={{
                                            id: order.id,
                                            status: order.status,
                                            totalCents: order.totalCents,
                                            provider: order.provider,
                                            createdAt: order.createdAt,
                                            paidAt: order.paidAt,
                                            user: { displayName: order.user.displayName, email: order.user.email },
                                            items: order.items.map((i) => ({ id: i.id, unitPriceCents: i.unitPriceCents, workflow: { title: i.workflow.title, seller: { displayName: i.workflow.seller.displayName } } })),
                                        }}
                                        trigger={
                                            <Button variant="outline" size="sm">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                        }
                                    />
                                    {order.status === 'pending' && (
                                        <form action={markPaidAction}>
                                            <input type="hidden" name="orderId" value={order.id} />
                                            <Button variant="outline" size="sm">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Mark Paid
                                            </Button>
                                        </form>
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
                baseUrl="/admin/orders"
            />
        </div>
    )
}
