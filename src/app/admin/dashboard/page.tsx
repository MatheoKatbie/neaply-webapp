import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, ShoppingCart, TrendingUp, DollarSign, Star, Flag } from 'lucide-react'

async function getStats() {
    const [
        totalUsers,
        totalWorkflows,
        totalOrders,
        totalRevenue,
        totalReviews,
        recentOrders
    ] = await Promise.all([
        prisma.user.count(),
        prisma.workflow.count(),
        prisma.order.count({ where: { status: 'paid' } }),
        prisma.order.aggregate({
            where: { status: 'paid' },
            _sum: { totalCents: true }
        }),
        prisma.review.count(),
        prisma.order.findMany({
            where: { status: 'paid' },
            include: {
                user: { select: { displayName: true } },
                items: { include: { workflow: { select: { title: true } } } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ])

    return {
        totalUsers,
        totalWorkflows,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalCents || 0,
        totalReviews,
        recentOrders
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(cents / 100)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the FlowMarket admin panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkflows.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Published workflows
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total earnings
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                            Latest completed orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {order.user.displayName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items[0]?.workflow.title || 'Unknown workflow'}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {formatCurrency(order.totalCents)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common admin tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Manage Users</p>
                                    <p className="text-xs text-muted-foreground">View and edit user accounts</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <Package className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Review Workflows</p>
                                    <p className="text-xs text-muted-foreground">Moderate workflow submissions</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <Flag className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm font-medium">Handle Reports</p>
                                    <p className="text-xs text-muted-foreground">Review user reports</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
