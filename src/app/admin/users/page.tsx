import { prisma } from '@/lib/prisma'
import AdminUsers from './AdminUsersClient'

async function getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    sellerStatus?: string,
    dateFrom?: string,
    dateTo?: string
) {
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
        where.OR = [
            { displayName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ]
    }

    if (role === 'admin') {
        where.isAdmin = true
    } else if (role === 'seller') {
        where.isSeller = true
    } else if (role === 'user') {
        where.isAdmin = false
        where.isSeller = false
    }

    if (sellerStatus && sellerStatus !== 'all') {
        where.AND = [
            { isSeller: true },
            { sellerProfile: { status: sellerStatus } }
        ]
    }

    if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                sellerProfile: {
                    select: {
                        storeName: true,
                        bio: true,
                        websiteUrl: true,
                        phoneNumber: true,
                        countryCode: true,
                        status: true
                    }
                },
                _count: {
                    select: {
                        workflows: true,
                        orders: true,
                        reviews: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ])

    return {
        users,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    }
}

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        search?: string
        role?: string
        sellerStatus?: string
        dateFrom?: string
        dateTo?: string
    }>
}) {
    // Await searchParams as required in Next.js 15
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const { users, totalCount, totalPages, currentPage } = await getUsers(
        page,
        10,
        params.search,
        params.role,
        params.sellerStatus,
        params.dateFrom,
        params.dateTo
    )

    // Transform users to match the expected type
    const transformedUsers = users.map(user => ({
        ...user,
        sellerProfile: user.sellerProfile ? {
            storeName: user.sellerProfile.storeName || undefined,
            bio: user.sellerProfile.bio || undefined,
            websiteUrl: user.sellerProfile.websiteUrl || undefined,
            phoneNumber: user.sellerProfile.phoneNumber || undefined,
            countryCode: user.sellerProfile.countryCode || undefined,
            status: user.sellerProfile.status || undefined
        } : null
    }))

    return (
        <AdminUsers
            users={transformedUsers}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    )
}
