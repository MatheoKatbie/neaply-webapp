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
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">Dashboard</h1>
                <p className="text-[#9DA2B3] text-lg">Welcome back to the Neaply admin panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-[#9DA2B3]/25 hover:border-[#9DA2B3]/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium font-aeonikpro text-[#9DA2B3]">Total Users</CardTitle>
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#EDEFF7]">{stats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-[#9DA2B3]/70 mt-1">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-[#9DA2B3]/25 hover:border-[#9DA2B3]/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium font-aeonikpro text-[#9DA2B3]">Total Workflows</CardTitle>
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Package className="h-4 w-4 text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#EDEFF7]">{stats.totalWorkflows.toLocaleString()}</div>
                        <p className="text-xs text-[#9DA2B3]/70 mt-1">
                            Published workflows
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-[#9DA2B3]/25 hover:border-[#9DA2B3]/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium font-aeonikpro text-[#9DA2B3]">Total Orders</CardTitle>
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ShoppingCart className="h-4 w-4 text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#EDEFF7]">{stats.totalOrders.toLocaleString()}</div>
                        <p className="text-xs text-[#9DA2B3]/70 mt-1">
                            Completed orders
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[rgba(64,66,77,0.35)] to-[rgba(64,66,77,0.15)] border border-[#9DA2B3]/25 hover:border-[#9DA2B3]/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium font-aeonikpro text-[#9DA2B3]">Total Revenue</CardTitle>
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <DollarSign className="h-4 w-4 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#EDEFF7]">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-[#9DA2B3]/70 mt-1">
                            Total earnings
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                            Latest completed orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#40424D]/30 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium font-aeonikpro leading-none">
                                            {order.user.displayName}
                                        </p>
                                        <p className="text-sm text-[#9DA2B3]">
                                            {order.items[0]?.workflow.title || 'Unknown workflow'}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium font-aeonikpro text-green-400">
                                        {formatCurrency(order.totalCents)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common admin tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-4 border border-[#9DA2B3]/20 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent hover:border-blue-500/50 hover:bg-blue-500/15 cursor-pointer transition-all duration-200 group">
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                    <Users className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium font-aeonikpro text-[#EDEFF7]">Manage Users</p>
                                    <p className="text-xs text-[#9DA2B3]/70">View and edit user accounts</p>
                                </div>
                                <TrendingUp className="h-4 w-4 text-[#9DA2B3]/40 group-hover:text-blue-400 transition-colors" />
                            </div>

                            <div className="flex items-center space-x-3 p-4 border border-[#9DA2B3]/20 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent hover:border-green-500/50 hover:bg-green-500/15 cursor-pointer transition-all duration-200 group">
                                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                                    <Package className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium font-aeonikpro text-[#EDEFF7]">Review Workflows</p>
                                    <p className="text-xs text-[#9DA2B3]/70">Moderate workflow submissions</p>
                                </div>
                                <TrendingUp className="h-4 w-4 text-[#9DA2B3]/40 group-hover:text-green-400 transition-colors" />
                            </div>

                            <div className="flex items-center space-x-3 p-4 border border-[#9DA2B3]/20 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent hover:border-red-500/50 hover:bg-red-500/15 cursor-pointer transition-all duration-200 group">
                                <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                                    <Flag className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium font-aeonikpro text-[#EDEFF7]">Handle Reports</p>
                                    <p className="text-xs text-[#9DA2B3]/70">Review user reports and take action</p>
                                </div>
                                <TrendingUp className="h-4 w-4 text-[#9DA2B3]/40 group-hover:text-red-400 transition-colors" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
