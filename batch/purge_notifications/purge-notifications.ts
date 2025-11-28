/**
 * Batch script to purge old notifications
 * 
 * This script deletes notifications older than a specified number of months.
 * Can be run manually or scheduled via cron job.
 * 
 * Usage:
 *   npx ts-node batch/purge-notifications.ts
 *   npx ts-node batch/purge-notifications.ts --months=6
 *   npx ts-node batch/purge-notifications.ts --dry-run
 * 
 * Options:
 *   --months=N    Delete notifications older than N months (default: 9)
 *   --dry-run     Preview what would be deleted without actually deleting
 *   --verbose     Show detailed output
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Parse command line arguments
function parseArgs(): { months: number; dryRun: boolean; verbose: boolean } {
  const args = process.argv.slice(2)
  let months = 9
  let dryRun = false
  let verbose = false

  for (const arg of args) {
    if (arg.startsWith('--months=')) {
      months = parseInt(arg.split('=')[1], 10)
      if (isNaN(months) || months < 1) {
        console.error('❌ Invalid months value. Must be a positive integer.')
        process.exit(1)
      }
    }
    if (arg === '--dry-run') {
      dryRun = true
    }
    if (arg === '--verbose') {
      verbose = true
    }
  }

  return { months, dryRun, verbose }
}

async function purgeOldNotifications() {
  const { months, dryRun, verbose } = parseArgs()
  
  console.log('🔔 Notification Purge Script')
  console.log('============================')
  console.log(`📅 Purging notifications older than ${months} months`)
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be deleted')
  }
  console.log('')

  try {
    // Calculate the cutoff date
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)

    console.log(`📆 Cutoff date: ${cutoffDate.toISOString()}`)
    console.log('')

    // Count notifications to be deleted
    const countToDelete = await prisma.notification.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    // Get total notifications count
    const totalCount = await prisma.notification.count()

    console.log(`📊 Statistics:`)
    console.log(`   Total notifications: ${totalCount}`)
    console.log(`   Notifications to purge: ${countToDelete}`)
    console.log(`   Notifications to keep: ${totalCount - countToDelete}`)
    console.log('')

    if (countToDelete === 0) {
      console.log('✅ No notifications to purge. Database is clean!')
      return
    }

    if (verbose) {
      // Show breakdown by type
      const breakdownByType = await prisma.notification.groupBy({
        by: ['type'],
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
        _count: true,
      })

      console.log('📋 Breakdown by type:')
      for (const item of breakdownByType) {
        console.log(`   ${item.type}: ${item._count}`)
      }
      console.log('')

      // Show breakdown by read status
      const breakdownByReadStatus = await prisma.notification.groupBy({
        by: ['isRead'],
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
        _count: true,
      })

      console.log('📋 Breakdown by read status:')
      for (const item of breakdownByReadStatus) {
        console.log(`   ${item.isRead ? 'Read' : 'Unread'}: ${item._count}`)
      }
      console.log('')
    }

    if (dryRun) {
      console.log('🔍 DRY RUN: Would have deleted', countToDelete, 'notifications')
      return
    }

    // Perform the deletion
    console.log('🗑️  Deleting old notifications...')
    
    const startTime = Date.now()
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    const endTime = Date.now()

    console.log('')
    console.log('✅ Purge completed successfully!')
    console.log(`   Deleted: ${result.count} notifications`)
    console.log(`   Duration: ${endTime - startTime}ms`)

  } catch (error) {
    console.error('❌ Error during purge:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
purgeOldNotifications()
  .then(() => {
    console.log('')
    console.log('🏁 Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
