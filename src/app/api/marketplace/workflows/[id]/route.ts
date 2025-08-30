import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { safeDecrypt } from '@/lib/encryption'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get user for ownership check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { id } = await params
    const workflowId = id

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }

    // Check if user already owns this workflow and can review (if logged in)
    let userOwnsWorkflow = false
    let userCanReview = false
    let userHasReviewed = false
    if (user) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          status: {
            in: ['paid', 'pending'], // Count both paid and pending purchases
          },
          items: {
            some: {
              workflowId: workflowId,
            },
          },
        },
      })
      userOwnsWorkflow = !!existingOrder

      // Check if user can leave a review (owns workflow and hasn't reviewed yet)
      if (userOwnsWorkflow) {
        const existingReview = await prisma.review.findUnique({
          where: {
            workflowId_userId: {
              workflowId: workflowId,
              userId: user.id,
            },
          },
        })
        userHasReviewed = !!existingReview
        userCanReview = !userHasReviewed
      }
    }

    // Fetch published workflow by ID (public access)
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        status: 'published', // Only show published workflows in marketplace
        // Only show workflows from active sellers
        seller: {
          sellerProfile: {
            status: 'active'
          }
        }
      },
      include: {
        seller: {
          select: {
            displayName: true,
            avatarUrl: true,
            sellerProfile: {
              select: {
                storeName: true,
                slug: true,
                supportEmail: true,
                phoneNumber: true,
                countryCode: true,
                websiteUrl: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        versions: {
          where: { isLatest: true },
          take: 1,
          select: {
            id: true,
            semver: true,
            changelogMd: true,
            n8nMinVersion: true,
            n8nMaxVersion: true,
            jsonContent: true,
            createdAt: true,
          },
        },
        plans: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            priceCents: true,
            currency: true,
            features: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const latestVersion = workflow.versions[0]
    const isNew = latestVersion && new Date(latestVersion.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // New if created in last 7 days
    const isTrending = workflow.salesCount > 50 && workflow.ratingAvg.toNumber() > 4.0 // Trending if good sales and rating

    // Transform data for frontend
    const transformedWorkflow = {
      id: workflow.id,
      title: workflow.title,
      shortDesc: workflow.shortDesc,
      longDescMd: workflow.longDescMd,
      price: workflow.basePriceCents,
      currency: workflow.currency,
      platform: workflow.platform,
      seller: {
        displayName: workflow.seller.displayName,
        storeName: workflow.seller.sellerProfile?.storeName,
        slug: workflow.seller.sellerProfile?.slug,
        supportEmail: workflow.seller.sellerProfile?.supportEmail,
        phoneNumber: workflow.seller.sellerProfile?.phoneNumber,
        countryCode: workflow.seller.sellerProfile?.countryCode,
        websiteUrl: workflow.seller.sellerProfile?.websiteUrl,
        avatarUrl: workflow.seller.avatarUrl,
      },
      rating: parseFloat(workflow.ratingAvg.toString()),
      ratingCount: workflow.ratingCount,
      salesCount: workflow.salesCount,
      heroImage: workflow.heroImageUrl,
      categories: workflow.categories.map((cat) => cat.category.name),
      tags: workflow.tags.map((tag) => tag.tag.name),
      isNew,
      isTrending,
      slug: workflow.slug,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      userOwnsWorkflow, // Add ownership status
      userCanReview, // Add review eligibility
      userHasReviewed, // Add review status
      version: latestVersion
        ? {
            semver: latestVersion.semver,
            changelog: latestVersion.changelogMd,
            n8nMinVersion: latestVersion.n8nMinVersion,
            n8nMaxVersion: latestVersion.n8nMaxVersion,
            jsonContent: safeDecrypt(latestVersion.jsonContent),
          }
        : null,
      plans: workflow.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.priceCents,
        currency: plan.currency,
        features: plan.features,
      })),
    }

    return NextResponse.json({
      data: transformedWorkflow,
    })
  } catch (error) {
    console.error('Marketplace Workflow API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
