const { PrismaClient } = require('@prisma/client')
const Stripe = require('stripe')

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function testMultiVendorPayment() {
  try {
    console.log('🧪 Testing Multi-Vendor Payment System...\n')

    // 1. Check if we have test data
    const users = await prisma.user.findMany({
      where: { isSeller: true },
      include: { sellerProfile: true },
      take: 2,
    })

    if (users.length < 2) {
      console.log('❌ Need at least 2 sellers with Stripe accounts for testing')
      return
    }

    console.log(
      '✅ Found sellers:',
      users.map((u) => ({
        id: u.id,
        name: u.displayName,
        stripeAccountId: u.sellerProfile?.stripeAccountId,
      }))
    )

    // 2. Check if sellers have Stripe accounts
    const sellersWithStripe = users.filter((u) => u.sellerProfile?.stripeAccountId)
    if (sellersWithStripe.length < 2) {
      console.log('❌ Need at least 2 sellers with Stripe Connect accounts')
      return
    }

    // 3. Get published workflows from different sellers
    const workflows = await prisma.workflow.findMany({
      where: {
        status: 'published',
        sellerId: { in: sellersWithStripe.map((s) => s.id) },
      },
      include: {
        seller: {
          include: { sellerProfile: true },
        },
      },
      take: 2,
    })

    if (workflows.length < 2) {
      console.log('❌ Need at least 2 published workflows from different sellers')
      return
    }

    console.log(
      '✅ Found workflows:',
      workflows.map((w) => ({
        id: w.id,
        title: w.title,
        seller: w.seller.displayName,
        price: w.basePriceCents,
      }))
    )

    // 4. Create a test user if needed
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-multi-vendor@example.com' },
    })

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-multi-vendor@example.com',
          displayName: 'Test Multi-Vendor User',
          passwordHash: 'test',
        },
      })
      console.log('✅ Created test user:', testUser.id)
    }

    // 5. Create a test cart with items from different sellers
    let cart = await prisma.cart.findFirst({
      where: { userId: testUser.id },
      include: { items: true },
    })

    if (cart) {
      // Clear existing cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    } else {
      cart = await prisma.cart.create({
        data: { userId: testUser.id },
      })
    }

    // Add items from different sellers
    for (const workflow of workflows) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          workflowId: workflow.id,
          quantity: 1,
        },
      })
    }

    console.log('✅ Created test cart with multi-vendor items')

    // 6. Test SetupIntent creation
    console.log('\n🔧 Testing SetupIntent creation...')

    const setupIntentResponse = await fetch('http://localhost:3000/api/checkout/setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sb-access-token=${testUser.id}`, // Mock auth
      },
    })

    if (setupIntentResponse.ok) {
      const setupData = await setupIntentResponse.json()
      console.log('✅ SetupIntent created:', setupData.clientSecret ? 'SUCCESS' : 'FAILED')
    } else {
      console.log('❌ SetupIntent creation failed')
    }

    // 7. Test database schema
    console.log('\n🗄️ Testing database schema...')

    const userWithStripe = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { stripeCustomerId: true },
    })

    console.log('✅ User stripeCustomerId field:', userWithStripe?.stripeCustomerId ? 'EXISTS' : 'MISSING')

    // 8. Test cart grouping logic
    console.log('\n🛒 Testing cart grouping logic...')

    const cartWithItems = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            workflow: {
              include: {
                seller: {
                  include: { sellerProfile: true },
                },
              },
            },
          },
        },
      },
    })

    const itemsBySeller = new Map()
    for (const item of cartWithItems.items) {
      const sellerId = item.workflow.sellerId
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, [])
      }
      itemsBySeller.get(sellerId).push(item)
    }

    console.log('✅ Cart grouped by sellers:', itemsBySeller.size, 'sellers')
    for (const [sellerId, items] of itemsBySeller.entries()) {
      const seller = items[0].workflow.seller
      console.log(`   - ${seller.displayName}: ${items.length} items`)
    }

    console.log('\n🎉 Multi-vendor payment system test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Test the UI by adding items from different sellers to cart')
    console.log('2. Use the new unified payment method in the cart page')
    console.log('3. Verify PaymentIntents are created for each seller')
    console.log('4. Check webhook handling for payment_intent.succeeded events')
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testMultiVendorPayment()
