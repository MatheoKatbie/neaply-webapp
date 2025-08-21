import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    // Create categories
    console.log('📂 Creating categories...')
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
    }
    console.log(`✅ Created ${categories.length} categories`)

    // Create tags
    console.log('🏷️  Creating tags...')
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
    }
    console.log(`✅ Created ${tags.length} tags`)
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
