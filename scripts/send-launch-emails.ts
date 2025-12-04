/**
 * Script to send launch emails to all waitlist subscribers
 * 
 * Usage: npx tsx scripts/send-launch-emails.ts
 * 
 * Options:
 *   --dry-run    Preview what would be sent without actually sending
 *   --limit=N    Only send to first N subscribers
 */

import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import * as React from 'react'

const prisma = new PrismaClient()

// Check for required environment variable
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is required')
  process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || 'Neaply <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neaply.fr'

// Import the email component dynamically to avoid JSX issues
async function getEmailHtml(email: string): Promise<string> {
  const { WaitlistLaunchEmail } = await import('../src/emails/WaitlistLaunchEmail')
  const element = React.createElement(WaitlistLaunchEmail, { email })
  return await render(element)
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined

async function main() {
  console.log('🚀 Waitlist Launch Email Sender')
  console.log('================================')
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No emails will be sent\n')
  }

  // Get all waitlist entries that haven't received launch email
  const entries = await prisma.waitlistEntry.findMany({
    where: {
      launchEmailSent: false,
    },
    orderBy: {
      position: 'asc',
    },
    take: limit,
  })

  console.log(`📋 Found ${entries.length} subscribers to email`)
  
  if (limit) {
    console.log(`📊 Limited to first ${limit} subscribers`)
  }
  
  console.log('')

  if (entries.length === 0) {
    console.log('✅ No pending launch emails to send')
    return
  }

  let sent = 0
  let failed = 0
  const errors: string[] = []

  // Process in batches of 10
  const batchSize = 10
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    
    console.log(`📤 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}`)

    for (const entry of batch) {
      try {
        if (dryRun) {
          console.log(`  📧 Would send to: ${entry.email} (position #${entry.position})`)
          sent++
        } else {
          // Generate HTML using the React Email component
          const html = await getEmailHtml(entry.email)
          
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: entry.email,
            subject: '🚀 Neaply is Live! Start exploring now',
            html,
          })

          if (error) {
            throw new Error(error.message)
          }

          // Mark as sent
          await prisma.waitlistEntry.update({
            where: { id: entry.id },
            data: { launchEmailSent: true },
          })

          console.log(`  ✅ Sent to: ${entry.email}`)
          sent++
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.log(`  ❌ Failed: ${entry.email} - ${errorMsg}`)
        errors.push(`${entry.email}: ${errorMsg}`)
        failed++
      }
    }

    // Small delay between batches to respect rate limits
    if (i + batchSize < entries.length && !dryRun) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('')
  console.log('================================')
  console.log('📊 Summary:')
  console.log(`  ✅ Sent: ${sent}`)
  console.log(`  ❌ Failed: ${failed}`)
  
  if (errors.length > 0) {
    console.log('')
    console.log('❌ Errors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
