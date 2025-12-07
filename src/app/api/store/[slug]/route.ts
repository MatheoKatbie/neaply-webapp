import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    // Validate slug parameter
    const slugSchema = z.string().min(1).max(100)
    const validatedSlug = slugSchema.parse(slug)

    // Fetch seller profile with their workflows (allow all statuses for now)
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: {
        slug: validatedSlug,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    })

    if (!sellerProfile) {
      console.log(`Store not found for slug: ${validatedSlug}`)
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    console.log(`Found store: ${sellerProfile.storeName} with status: ${sellerProfile.status}`)

    // Fetch published workflows for this seller
    const workflows = await prisma.workflow.findMany({
      where: {
        sellerId: sellerProfile.userId,
        status: 'published',
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        versions: {
          where: { isLatest: true },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Format workflows for response
    const formattedWorkflows = workflows.map((workflow) => ({
      id: workflow.id.toString(),
      title: workflow.title,
      slug: workflow.slug,
      shortDesc: workflow.shortDesc,
      heroImage: workflow.heroImageUrl,
      price: workflow.basePriceCents,
      currency: workflow.currency,
      rating: parseFloat(workflow.ratingAvg.toString()),
      ratingCount: workflow.ratingCount,
      salesCount: workflow.salesCount,
      categories: workflow.categories.map((c) => c.category.name),
      tags: workflow.tags.map((t) => t.tag.name),
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
      version: workflow.versions[0]
        ? {
            semver: workflow.versions[0].semver,
            n8nMinVersion: workflow.versions[0].n8nMinVersion,
            n8nMaxVersion: workflow.versions[0].n8nMaxVersion,
          }
        : null,
    }))

    // Calculate store stats
    const totalSales = workflows.reduce((sum, w) => sum + w.salesCount, 0)
    const avgRating =
      workflows.length > 0
        ? workflows.reduce((sum, w) => sum + parseFloat(w.ratingAvg.toString()), 0) / workflows.length
        : 0
    const totalReviews = workflows.reduce((sum, w) => sum + w.ratingCount, 0)

    const storeData = {
      id: sellerProfile.userId,
      storeName: sellerProfile.storeName,
      slug: sellerProfile.slug,
      bio: sellerProfile.bio,
      logoUrl: sellerProfile.logoUrl,
      bannerUrl: sellerProfile.bannerUrl,
      websiteUrl: sellerProfile.websiteUrl,
      supportEmail: sellerProfile.supportEmail,
      phoneNumber: sellerProfile.phoneNumber,
      countryCode: sellerProfile.countryCode,
      user: sellerProfile.user,
      stats: {
        totalWorkflows: workflows.length,
        totalSales,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        memberSince: sellerProfile.user.createdAt.toISOString(),
      },
      workflows: formattedWorkflows,
    }

    return NextResponse.json({
      success: true,
      data: storeData,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid slug parameter',
          details: error.message,
        },
        { status: 400 }
      )
    }

    console.error('Error fetching store:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
