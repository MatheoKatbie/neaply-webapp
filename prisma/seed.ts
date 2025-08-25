/**
 * Database Seeding Script
 *
 * This script can run in two modes:
 *
 * 1. PRODUCTION MODE (categories and tags only):
 *    - Run: NODE_ENV=production npx prisma db seed
 *    - Or: SEED_MOCK_DATA=false npx prisma db seed
 *    - Creates only essential categories and tags
 *
 * 2. DEVELOPMENT MODE (full mock data):
 *    - Run: npx prisma db seed
 *    - Or: SEED_MOCK_DATA=true npx prisma db seed
 *    - Creates categories, tags, users, workflows, orders, reviews, etc.
 */

import { PrismaClient, Platform } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Configuration - Set to false for production
const INCLUDE_MOCK_DATA = process.env.NODE_ENV !== 'production'

console.log(
  `🔧 Seeding mode: ${INCLUDE_MOCK_DATA ? 'Development (with mock data)' : 'Production (categories and tags only)'}`
)

// Predefined categories for n8n workflows
const categories = [
  { name: 'Automation', slug: 'automation' },
  { name: 'Data Processing', slug: 'data-processing' },
  { name: 'Email Marketing', slug: 'email-marketing' },
  { name: 'Social Media', slug: 'social-media' },
  { name: 'E-commerce', slug: 'e-commerce' },
  { name: 'CRM', slug: 'crm' },
  { name: 'Analytics', slug: 'analytics' },
  { name: 'Webhooks', slug: 'webhooks' },
  { name: 'API Integration', slug: 'api-integration' },
  { name: 'File Management', slug: 'file-management' },
  { name: 'Notifications', slug: 'notifications' },
  { name: 'Database', slug: 'database' },
  { name: 'Monitoring', slug: 'monitoring' },
  { name: 'Security', slug: 'security' },
  { name: 'Content Management', slug: 'content-management' },
  { name: 'Lead Generation', slug: 'lead-generation' },
  { name: 'Project Management', slug: 'project-management' },
  { name: 'Reporting', slug: 'reporting' },
  { name: 'Backup & Sync', slug: 'backup-sync' },
  { name: 'Communication', slug: 'communication' },
]

// Predefined tags for n8n workflows
const tags = [
  { name: 'Beginner', slug: 'beginner' },
  { name: 'Advanced', slug: 'advanced' },
  { name: 'Expert', slug: 'expert' },
  { name: 'Free', slug: 'free' },
  { name: 'Premium', slug: 'premium' },
  { name: 'Popular', slug: 'popular' },
  { name: 'New', slug: 'new' },
  { name: 'Updated', slug: 'updated' },
  { name: 'Hot', slug: 'hot' },
  { name: 'Trending', slug: 'trending' },
  { name: 'Gmail', slug: 'gmail' },
  { name: 'Slack', slug: 'slack' },
  { name: 'Discord', slug: 'discord' },
  { name: 'Telegram', slug: 'telegram' },
  { name: 'WhatsApp', slug: 'whatsapp' },
  { name: 'Google Sheets', slug: 'google-sheets' },
  { name: 'Excel', slug: 'excel' },
  { name: 'Airtable', slug: 'airtable' },
  { name: 'Notion', slug: 'notion' },
  { name: 'Trello', slug: 'trello' },
  { name: 'Asana', slug: 'asana' },
  { name: 'Monday.com', slug: 'monday' },
  { name: 'Jira', slug: 'jira' },
  { name: 'GitHub', slug: 'github' },
  { name: 'GitLab', slug: 'gitlab' },
  { name: 'Shopify', slug: 'shopify' },
  { name: 'WooCommerce', slug: 'woocommerce' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'PayPal', slug: 'paypal' },
  { name: 'Facebook', slug: 'facebook' },
  { name: 'Instagram', slug: 'instagram' },
  { name: 'Twitter', slug: 'twitter' },
  { name: 'LinkedIn', slug: 'linkedin' },
  { name: 'YouTube', slug: 'youtube' },
  { name: 'TikTok', slug: 'tiktok' },
  { name: 'Salesforce', slug: 'salesforce' },
  { name: 'HubSpot', slug: 'hubspot' },
  { name: 'Mailchimp', slug: 'mailchimp' },
  { name: 'SendGrid', slug: 'sendgrid' },
  { name: 'Zapier', slug: 'zapier' },
  { name: 'IFTTT', slug: 'ifttt' },
  { name: 'AWS', slug: 'aws' },
  { name: 'Google Cloud', slug: 'google-cloud' },
  { name: 'Azure', slug: 'azure' },
  { name: 'Docker', slug: 'docker' },
  { name: 'Kubernetes', slug: 'kubernetes' },
  { name: 'MySQL', slug: 'mysql' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'Redis', slug: 'redis' },
  { name: 'REST API', slug: 'rest-api' },
  { name: 'GraphQL', slug: 'graphql' },
  { name: 'JSON', slug: 'json' },
  { name: 'XML', slug: 'xml' },
  { name: 'CSV', slug: 'csv' },
  { name: 'PDF', slug: 'pdf' },
  { name: 'Image Processing', slug: 'image-processing' },
  { name: 'Text Processing', slug: 'text-processing' },
  { name: 'AI/ML', slug: 'ai-ml' },
  { name: 'OpenAI', slug: 'openai' },
  { name: 'ChatGPT', slug: 'chatgpt' },
  { name: 'Scheduled', slug: 'scheduled' },
  { name: 'Real-time', slug: 'real-time' },
  { name: 'Batch Processing', slug: 'batch-processing' },
  { name: 'Error Handling', slug: 'error-handling' },
  { name: 'Testing', slug: 'testing' },
  { name: 'Debugging', slug: 'debugging' },
  { name: 'Performance', slug: 'performance' },
  { name: 'Scalable', slug: 'scalable' },
  { name: 'Low-code', slug: 'low-code' },
  { name: 'No-code', slug: 'no-code' },
  { name: 'Enterprise', slug: 'enterprise' },
  { name: 'Startup', slug: 'startup' },
  { name: 'SaaS', slug: 'saas' },
  { name: 'B2B', slug: 'b2b' },
  { name: 'B2C', slug: 'b2c' },
]

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    if (INCLUDE_MOCK_DATA) {
      // Clear existing data (only in development)
      console.log('🧹 Clearing existing data...')
      await prisma.workflowTag.deleteMany()
      await prisma.workflowCategory.deleteMany()
      await prisma.workflowCompatibility.deleteMany()
      await prisma.reviewHelpfulVote.deleteMany()
      await prisma.review.deleteMany()
      await prisma.favorite.deleteMany()
      await prisma.payment.deleteMany()
      await prisma.orderItem.deleteMany()
      await prisma.order.deleteMany()
      await prisma.pricingPlan.deleteMany()
      await prisma.workflowVersion.deleteMany()
      await prisma.workflow.deleteMany()
      await prisma.tag.deleteMany()
      await prisma.category.deleteMany()
      await prisma.auditLog.deleteMany()
      await prisma.report.deleteMany()
      await prisma.payout.deleteMany()
      await prisma.sellerProfile.deleteMany()
      await prisma.user.deleteMany()
    }

    // Create categories (always create these, even in production)
    console.log('📂 Creating categories...')
    const createdCategories = []
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
      createdCategories.push(created)
    }
    console.log(`✅ Created/updated ${categories.length} categories`)

    // Create tags (always create these, even in production)
    console.log('🏷️  Creating tags...')
    const createdTags = []
    for (const tag of tags) {
      const created = await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
      createdTags.push(created)
    }
    console.log(`✅ Created/updated ${tags.length} tags`)

    // Only create mock data in development
    if (!INCLUDE_MOCK_DATA) {
      console.log('🏁 Production seeding complete! Only categories and tags were created.')
      return
    }

    console.log('🎭 Creating mock data for development...')

    // Create users (including sellers and buyers)
    console.log('👥 Creating users...')
    const users = []

    // Create 5 sellers
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          passwordHash: faker.internet.password(),
          displayName: faker.person.fullName(),
          avatarUrl: faker.image.avatar(),
          isSeller: true,
          isAdmin: false,
        },
      })
      users.push(user)
    }

    // Create 10 regular users (buyers)
    for (let i = 0; i < 10; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          passwordHash: faker.internet.password(),
          displayName: faker.person.fullName(),
          avatarUrl: faker.image.avatar(),
          isSeller: false,
          isAdmin: false,
        },
      })
      users.push(user)
    }

    // Create seller profiles for sellers
    console.log('🏪 Creating seller profiles...')
    const sellers = users.filter((u) => u.isSeller)
    const sellerProfiles = []

    for (const seller of sellers) {
      const storeName = faker.company.name() + ' Automation'
      const profile = await prisma.sellerProfile.create({
        data: {
          userId: seller.id,
          storeName,
          slug: faker.helpers.slugify(storeName).toLowerCase(),
          bio: faker.lorem.paragraph(),
          websiteUrl: faker.internet.url(),
          supportEmail: faker.internet.email(),
          phoneNumber: faker.phone.number(),
          countryCode: faker.location.countryCode(),
          payoutMethod: {
            type: 'stripe',
            accountId: faker.string.alphanumeric(20),
          },
          status: 'active',
        },
      })
      sellerProfiles.push(profile)
    }
    console.log(`✅ Created ${sellerProfiles.length} seller profiles`)

    // Create workflows
    console.log('⚡ Creating workflows...')
    const workflows = []
    const workflowTitles = [
      'Customer Onboarding Automation',
      'E-commerce Order Processing',
      'Social Media Content Scheduler',
      'Lead Generation Pipeline',
      'Email Marketing Automation',
      'Data Backup & Sync',
      'Invoice Processing System',
      'CRM Contact Sync',
      'Slack Notification Hub',
      'Google Sheets Reporter',
      'Website Form Handler',
      'Product Inventory Tracker',
      'Customer Support Ticketing',
      'Sales Pipeline Automation',
      'Content Publishing Workflow',
    ]

    for (let i = 0; i < 15; i++) {
      const seller = faker.helpers.arrayElement(sellers)
      const title = workflowTitles[i] || faker.lorem.words(3)
      const salesCount = faker.number.int({ min: 0, max: 500 })
      const ratingCount = faker.number.int({ min: 0, max: Math.floor(salesCount * 0.3) })

      const workflow = await prisma.workflow.create({
        data: {
          sellerId: seller.id,
          title,
          slug: faker.helpers.slugify(title).toLowerCase(),
          shortDesc: faker.lorem.sentence(),
          longDescMd: faker.lorem.paragraphs(3),
          heroImageUrl: faker.image.url({ width: 800, height: 400 }),
          documentationUrl: faker.datatype.boolean() ? faker.internet.url() : null,
          platform: faker.helpers.arrayElement([
            Platform.n8n,
            Platform.zapier,
            Platform.make,
            Platform.airtable_script,
          ]),
          status: faker.helpers.arrayElement(['published', 'published', 'published', 'draft']), // 75% published
          basePriceCents: faker.number.int({ min: 999, max: 19999 }), // €9.99 to €199.99
          currency: 'EUR',
          salesCount,
          ratingAvg: ratingCount > 0 ? faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }) : 0,
          ratingCount,
        },
      })
      workflows.push(workflow)
    }
    console.log(`✅ Created ${workflows.length} workflows`)

    // Create workflow versions
    console.log('📦 Creating workflow versions...')
    for (const workflow of workflows) {
      await prisma.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          semver: '1.0.0',
          changelogMd: 'Initial release',
          n8nMinVersion: '0.200.0',
          n8nMaxVersion: null,
          jsonFileUrl: faker.internet.url(),
          jsonContent: {
            nodes: [
              {
                id: faker.string.uuid(),
                type: 'n8n-nodes-base.webhook',
                name: 'Webhook Trigger',
                position: [250, 300],
              },
            ],
            connections: {},
          },
          extraAssets: faker.datatype.boolean()
            ? {
              templates: ['template1.html', 'template2.html'],
              documentation: 'guide.pdf',
            }
            : undefined,
          isLatest: true,
        },
      })
    }

    // Create workflow categories (assign random categories to workflows)
    console.log('🔗 Creating workflow categories...')
    for (const workflow of workflows) {
      const numCategories = faker.number.int({ min: 1, max: 3 })
      const selectedCategories = faker.helpers.arrayElements(createdCategories, numCategories)

      for (const category of selectedCategories) {
        await prisma.workflowCategory.create({
          data: {
            workflowId: workflow.id,
            categoryId: category.id,
          },
        })
      }
    }

    // Create workflow tags
    console.log('🏷️  Creating workflow tags...')
    for (const workflow of workflows) {
      const numTags = faker.number.int({ min: 2, max: 5 })
      const selectedTags = faker.helpers.arrayElements(createdTags, numTags)

      for (const tag of selectedTags) {
        await prisma.workflowTag.create({
          data: {
            workflowId: workflow.id,
            tagId: tag.id,
          },
        })
      }
    }

    // Create pricing plans
    console.log('💰 Creating pricing plans...')
    for (const workflow of workflows) {
      await prisma.pricingPlan.create({
        data: {
          workflowId: workflow.id,
          name: 'Standard',
          priceCents: workflow.basePriceCents,
          currency: workflow.currency,
          features: ['Complete workflow file', 'Setup documentation', 'Email support', '30-day updates'],
          isActive: true,
          sortOrder: 0,
        },
      })
    }

    // Create orders and payments
    console.log('🛒 Creating orders...')
    const buyers = users.filter((u) => !u.isSeller && !u.isAdmin)
    const publishedWorkflows = workflows.filter((w) => w.status === 'published')

    for (let i = 0; i < 50; i++) {
      const buyer = faker.helpers.arrayElement(buyers)
      const workflow = faker.helpers.arrayElement(publishedWorkflows)
      const pricingPlan = await prisma.pricingPlan.findFirst({
        where: { workflowId: workflow.id },
      })

      if (pricingPlan) {
        const order = await prisma.order.create({
          data: {
            userId: buyer.id,
            status: faker.helpers.arrayElement(['paid', 'paid', 'paid', 'pending']), // 75% paid
            totalCents: pricingPlan.priceCents,
            currency: workflow.currency,
            provider: 'stripe',
            providerIntent: faker.string.alphanumeric(20),
            paidAt: faker.date.recent({ days: 30 }),
          },
        })

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            workflowId: workflow.id,
            pricingPlanId: pricingPlan.id,
            unitPriceCents: pricingPlan.priceCents,
            quantity: 1,
            subtotalCents: pricingPlan.priceCents,
          },
        })

        if (order.status === 'paid') {
          await prisma.payment.create({
            data: {
              orderId: order.id,
              provider: 'stripe',
              providerCharge: faker.string.alphanumeric(20),
              amountCents: order.totalCents,
              currency: order.currency,
              status: 'succeeded',
              processedAt: order.paidAt || new Date(),
              rawPayload: {
                id: faker.string.alphanumeric(20),
                amount: order.totalCents,
                currency: order.currency.toLowerCase(),
                status: 'succeeded',
              },
            },
          })
        }
      }
    }

    // Create reviews
    console.log('⭐ Creating reviews...')
    const paidOrders = await prisma.order.findMany({
      where: { status: 'paid' },
      include: { items: true, user: true },
    })

    // Track which user-workflow combinations have already been reviewed
    const reviewedCombinations = new Set<string>()

    for (const order of paidOrders.slice(0, 30)) {
      // Create reviews for first 30 orders
      if (faker.datatype.boolean(0.6)) {
        // 60% chance of review
        const orderItem = order.items[0]
        if (orderItem) {
          const combinationKey = `${order.userId}-${orderItem.workflowId}`

          // Skip if this user has already reviewed this workflow
          if (reviewedCombinations.has(combinationKey)) {
            continue
          }

          const rating = faker.number.int({ min: 3, max: 5 }) // Mostly positive reviews

          try {
            await prisma.review.create({
              data: {
                workflowId: orderItem.workflowId,
                userId: order.userId,
                rating,
                title: faker.lorem.sentence(),
                bodyMd: faker.lorem.paragraph(),
                status: 'published',
                helpfulCount: faker.number.int({ min: 0, max: 10 }),
              },
            })

            // Mark this combination as reviewed
            reviewedCombinations.add(combinationKey)
          } catch (error) {
            // Skip if there's already a review for this combination
            console.log(`Skipping duplicate review for user ${order.userId} and workflow ${orderItem.workflowId}`)
          }
        }
      }
    }

    // Create favorites
    console.log('❤️  Creating favorites...')
    for (const buyer of buyers) {
      const numFavorites = faker.number.int({ min: 0, max: 5 })
      const favoriteWorkflows = faker.helpers.arrayElements(publishedWorkflows, numFavorites)

      for (const workflow of favoriteWorkflows) {
        await prisma.favorite.create({
          data: {
            userId: buyer.id,
            workflowId: workflow.id,
          },
        })
      }
    }

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
