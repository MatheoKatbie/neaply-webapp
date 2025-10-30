import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { CheckCircle, Clock, DollarSign, Eye, ShoppingCart, XCircle } from 'lucide-react'
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
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                )
            case 'refunded':
                return (
                    <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        Refunded
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge className="bg-[#40424D]/30 text-[#9DA2B3] border border-[#9DA2B3]/30">
                        Cancelled
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-[#40424D]/30 text-[#9DA2B3]">
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
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">Orders Management</h1>
                <p className="text-[#9DA2B3] text-lg">View and manage all customer orders</p>
            </div>

            <AdminSearchFilters
                searchPlaceholder="Search orders by ID, customer name, email, or workflow..."
                filters={filterOptions}
                dateRangeFilter={true}
            />

            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                        <ShoppingCart className="h-6 w-6 text-blue-400" />
                        <span>All Orders ({totalCount})</span>
                    </CardTitle>
                    <CardDescription className="text-[#9DA2B3]/70 text-base">
                        Monitor order status and payment information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border border-[#9DA2B3]/20 rounded-lg hover:border-[#9DA2B3]/40 hover:bg-[#40424D]/20 transition-all duration-200"
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-base font-semibold text-[#EDEFF7] font-aeonikpro">Order #{order.id.slice(0, 8)}</h3>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-[#9DA2B3] flex-wrap">
                                        <span>Customer: <span className="text-[#EDEFF7]">{order.user.displayName}</span></span>
                                        <span>•</span>
                                        <span className="text-[#9DA2B3]/70">{order.user.email}</span>
                                        <span>•</span>
                                        <span className="font-medium text-green-400">
                                            {formatCurrency(order.totalCents)}
                                        </span>
                                    </div>

                                    <div className="space-y-1 pt-1">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="text-xs text-[#9DA2B3]">
                                                <span className="text-[#EDEFF7]">{item.workflow.title}</span>
                                                <span className="text-[#9DA2B3]"> by {item.workflow.seller.displayName}</span>
                                                <span className="text-[#9DA2B3]"> • {formatCurrency(item.unitPriceCents)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center space-x-4 text-xs text-[#9DA2B3]/60 pt-1">
                                        <span>Created: {formatDate(order.createdAt)}</span>
                                        {order.paidAt && (
                                            <>
                                                <span>•</span>
                                                <span>Paid: {formatDate(order.paidAt)}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>Provider: <span className="capitalize">{order.provider}</span></span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
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
                                            <Button variant="outline" size="sm" className="text-xs">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Details
                                            </Button>
                                        }
                                    />
                                    {order.status === 'pending' && (
                                        <form action={markPaidAction}>
                                            <input type="hidden" name="orderId" value={order.id} />
                                            <Button variant="outline" size="sm" className="text-xs bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-300">
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
