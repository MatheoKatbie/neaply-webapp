#!/usr/bin/env node

/**
 * Debug script for Stripe webhooks
 * Usage: node scripts/debug-webhooks.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugWebhooks() {
  try {
    console.log('🔍 Debugging Stripe webhooks...\n')

    // Check recent orders
    console.log('📋 Recent Orders:')
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: true,
        items: {
          include: {
            workflow: {
              select: { title: true },
            },
          },
        },
      },
    })

    recentOrders.forEach((order) => {
      console.log(`  Order ${order.id}:`)
      console.log(`    Status: ${order.status}`)
      console.log(`    Total: ${order.totalCents} ${order.currency}`)
      console.log(`    Provider: ${order.provider || 'none'}`)
      console.log(`    Provider Intent: ${order.providerIntent || 'none'}`)
      console.log(`    Paid At: ${order.paidAt || 'not paid'}`)
      console.log(`    Payments: ${order.payments.length}`)
      order.payments.forEach((payment) => {
        console.log(`      - ${payment.provider}: ${payment.status} (${payment.amountCents} ${payment.currency})`)
      })
      console.log(`    Items: ${order.items.length}`)
      order.items.forEach((item) => {
        console.log(`      - ${item.workflow.title} (${item.quantity}x)`)
      })
      console.log('')
    })

    // Check recent payments
    console.log('💳 Recent Payments:')
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { processedAt: 'desc' },
      include: {
        order: {
          select: { id: true, status: true },
        },
      },
    })

    recentPayments.forEach((payment) => {
      console.log(`  Payment ${payment.id}:`)
      console.log(`    Order: ${payment.orderId} (${payment.order.status})`)
      console.log(`    Provider: ${payment.provider}`)
      console.log(`    Charge: ${payment.providerCharge}`)
      console.log(`    Status: ${payment.status}`)
      console.log(`    Amount: ${payment.amountCents} ${payment.currency}`)
      console.log(`    Processed: ${payment.processedAt}`)
      console.log('')
    })

    // Check for potential issues
    console.log('⚠️  Potential Issues:')

    // Orders without payments
    const ordersWithoutPayments = await prisma.order.findMany({
      where: {
        status: 'paid',
        payments: { none: {} },
      },
      select: { id: true, status: true, providerIntent: true },
    })

    if (ordersWithoutPayments.length > 0) {
      console.log(`  Orders marked as paid but no payment records: ${ordersWithoutPayments.length}`)
      ordersWithoutPayments.forEach((order) => {
        console.log(`    - ${order.id} (${order.providerIntent || 'no intent'})`)
      })
    } else {
      console.log('  ✅ All paid orders have payment records')
    }

    // Payments without orders
    const paymentsWithoutOrders = await prisma.payment.findMany({
      where: {
        order: null,
      },
      select: { id: true, orderId: true },
    })

    if (paymentsWithoutOrders.length > 0) {
      console.log(`  Orphaned payments: ${paymentsWithoutOrders.length}`)
      paymentsWithoutOrders.forEach((payment) => {
        console.log(`    - ${payment.id} (order: ${payment.orderId})`)
      })
    } else {
      console.log('  ✅ No orphaned payments')
    }

    console.log('\n✅ Debug complete!')
  } catch (error) {
    console.error('❌ Debug failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugWebhooks()
