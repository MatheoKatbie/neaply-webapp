import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const workflowId = id

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID format' }, { status: 400 })
    }

    // Get the current workflow to extract tags, categories, and seller info
    const currentWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        status: 'published',
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
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
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            sellerProfile: {
              select: {
                storeName: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!currentWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const categoryIds = currentWorkflow.categories.map((c) => c.category.id)
    const tagIds = currentWorkflow.tags.map((t) => t.tag.id)
    const sellerId = currentWorkflow.seller.id

    // Find similar workflows based on shared tags and categories
    // Using a scoring algorithm: 2 points for shared categories, 1 point for shared tags
    const similarWorkflows = await prisma.workflow.findMany({
      where: {
        id: { not: workflowId }, // Exclude current workflow
        status: 'published',
        OR: [
          {
            categories: {
              some: {
                categoryId: { in: categoryIds },
              },
            },
          },
          {
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          },
        ],
      },
      include: {
        seller: {
          select: {
            displayName: true,
            sellerProfile: {
              select: {
                storeName: true,
                slug: true,
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
          orderBy: { createdAt: 'desc' },
          select: {
            semver: true,
          },
          take: 1,
        },
      },
      take: 20, // Get more than needed for scoring
    })

    // Calculate similarity scores and sort
    const scoredWorkflows = similarWorkflows
      .map((workflow) => {
        let score = 0
        const workflowCategoryIds = workflow.categories.map((c: any) => c.category.id)
        const workflowTagIds = workflow.tags.map((t: any) => t.tag.id)

        // 2 points for each shared category
        const sharedCategories = categoryIds.filter((id) => workflowCategoryIds.includes(id))
        score += sharedCategories.length * 2

        // 1 point for each shared tag
        const sharedTags = tagIds.filter((id) => workflowTagIds.includes(id))
        score += sharedTags.length * 1

        return {
          ...workflow,
          similarityScore: score,
        }
      })
      .filter((workflow) => workflow.similarityScore > 0) // Only include workflows with some similarity
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by score descending
      .slice(0, 6) // Take top 6 recommendations

    // Get other workflows from the same store (excluding current workflow)
    const storeWorkflows = await prisma.workflow.findMany({
      where: {
        sellerId: sellerId,
        id: { not: workflowId }, // Exclude current workflow
        status: 'published',
      },
      include: {
        seller: {
          select: {
            displayName: true,
            sellerProfile: {
              select: {
                storeName: true,
                slug: true,
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
          orderBy: { createdAt: 'desc' },
          select: {
            semver: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { salesCount: 'desc' }, // Order by popularity first
        { createdAt: 'desc' }, // Then by newest
      ],
      take: 6,
    })

    // Format the response data
    const formatWorkflow = (workflow: any) => ({
      id: workflow.id,
      title: workflow.title,
      shortDesc: workflow.shortDesc,
      price: workflow.basePriceCents,
      currency: 'EUR',
      rating: workflow.avgRating || 0,
      ratingCount: workflow.ratingCount || 0,
      salesCount: workflow.salesCount || 0,
      heroImage: workflow.heroImageUrl,
      categories: workflow.categories.map((c: any) => c.category.name),
      tags: workflow.tags.map((t: any) => t.tag.name),
      slug: workflow.slug,
      seller: {
        displayName: workflow.seller.displayName,
        storeName: workflow.seller.sellerProfile?.storeName,
        slug: workflow.seller.sellerProfile?.slug,
      },
      version: workflow.versions[0]?.semver || '1.0.0',
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    })

    const response = {
      similarWorkflows: scoredWorkflows.map(formatWorkflow),
      storeWorkflows: storeWorkflows.map(formatWorkflow),
      storeName: currentWorkflow.seller.sellerProfile?.storeName || currentWorkflow.seller.sellerProfile?.storeName,
      storeSlug: currentWorkflow.seller.sellerProfile?.slug,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching workflow recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
