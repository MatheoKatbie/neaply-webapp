import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/store/list - public list of stores for sliders/landing
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || undefined
        const sort = (searchParams.get('sort') || 'recent') as 'recent' | 'top-sales'
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50)
        const skip = (page - 1) * limit

        const where: any = {}
        if (search) {
            where.OR = [
                { storeName: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ]
        }

        let storesRaw: { userId: string; storeName: string; slug: string; bio: string | null; user: { displayName: string; avatarUrl: string | null } }[]
        let total: number

        if (sort === 'top-sales') {
            const sales = await prisma.workflow.groupBy({
                by: ['sellerId'],
                where: { status: 'published' },
                _sum: { salesCount: true },
                orderBy: { _sum: { salesCount: 'desc' } },
                skip,
                take: limit,
            })
            const sellerIds = sales.map((s) => s.sellerId)
            const profiles = await prisma.sellerProfile.findMany({
                where: { userId: { in: sellerIds } },
                select: {
                    userId: true,
                    storeName: true,
                    slug: true,
                    bio: true,
                    user: { select: { displayName: true, avatarUrl: true } },
                },
            })
            const byId: Record<string, typeof profiles[number]> = {}
            profiles.forEach((p) => (byId[p.userId] = p))
            storesRaw = sellerIds.map((id) => byId[id]).filter(Boolean) as any
            total = sellerIds.length
        } else {
            const [rows, count] = await Promise.all([
                prisma.sellerProfile.findMany({
                    where,
                    select: {
                        userId: true,
                        storeName: true,
                        slug: true,
                        bio: true,
                        user: {
                            select: { displayName: true, avatarUrl: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.sellerProfile.count({ where }),
            ])
            storesRaw = rows
            total = count
        }

        // Fetch published workflow counts per seller in a single query
        const sellerIds = storesRaw.map((s) => s.userId)
        const counts = sellerIds.length
            ? await prisma.workflow.groupBy({
                by: ['sellerId'],
                where: { sellerId: { in: sellerIds }, status: 'published' },
                _count: { _all: true },
            })
            : []

        const countBySeller: Record<string, number> = {}
        counts.forEach((c) => {
            // @ts-ignore - Prisma infers sellerId in groupBy result
            countBySeller[c.sellerId as string] = c._count._all
        })

        const stores = storesRaw.map((s) => ({
            ...s,
            workflowsCount: countBySeller[s.userId] || 0,
        }))

        return NextResponse.json({ stores, page, total, hasNext: skip + stores.length < total })
    } catch (error) {
        console.error('Error fetching stores list:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


