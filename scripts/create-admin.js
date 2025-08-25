const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminUser() {
    const adminEmail = 'admin@flowmarket.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    try {
        console.log('🔧 Creating admin user in Supabase...')
        console.log(`   Email: ${adminEmail}`)
        console.log(`   Password: ${adminPassword}`)

        // Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
                displayName: 'Admin User',
                isAdmin: true
            },
            app_metadata: {
                isAdmin: true
            }
        })

        if (authError) {
            console.error('❌ Error creating user in Supabase Auth:', authError.message)
            return
        }

        console.log('✅ User created in Supabase Auth:', authData.user.id)

        // Créer l'utilisateur dans la base de données Prisma
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()

        try {
            const dbUser = await prisma.user.create({
                data: {
                    id: authData.user.id,
                    email: adminEmail,
                    displayName: 'Admin User',
                    avatarUrl: null,
                    isSeller: false,
                    isAdmin: true,
                    // Pas besoin de passwordHash car Supabase gère l'auth
                }
            })

            console.log('✅ User created in database:', dbUser.id)
            console.log('')
            console.log('🎉 Admin account created successfully!')
            console.log('')
            console.log('📋 Login credentials:')
            console.log(`   Email: ${adminEmail}`)
            console.log(`   Password: ${adminPassword}`)
            console.log('')
            console.log('🔗 Access the admin panel at: http://localhost:3000/admin')

        } catch (dbError) {
            console.error('❌ Error creating user in database:', dbError.message)

            // Si l'erreur est que l'utilisateur existe déjà, on peut continuer
            if (dbError.code === 'P2002') {
                console.log('ℹ️  User already exists in database, updating admin status...')

                try {
                    await prisma.user.update({
                        where: { email: adminEmail },
                        data: { isAdmin: true }
                    })
                    console.log('✅ Admin status updated successfully!')
                } catch (updateError) {
                    console.error('❌ Error updating admin status:', updateError.message)
                }
            }
        } finally {
            await prisma.$disconnect()
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

// Vérifier si l'utilisateur existe déjà
async function checkExistingUser() {
    const adminEmail = 'admin@flowmarket.com'

    try {
        const { data: users, error } = await supabase.auth.admin.listUsers()

        if (error) {
            console.error('❌ Error checking existing users:', error.message)
            return false
        }

        const existingUser = users.users.find(user => user.email === adminEmail)

        if (existingUser) {
            console.log('ℹ️  Admin user already exists in Supabase Auth')
            console.log(`   User ID: ${existingUser.id}`)
            console.log(`   Email: ${existingUser.email}`)
            console.log(`   Email confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`)

            // Demander confirmation pour continuer
            const readline = require('readline')
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })

            return new Promise((resolve) => {
                rl.question('Do you want to continue and update the database? (y/N): ', (answer) => {
                    rl.close()
                    resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
                })
            })
        }

        return true
    } catch (error) {
        console.error('❌ Error checking existing users:', error.message)
        return false
    }
}

async function main() {
    console.log('🚀 FlowMarket Admin Account Creator')
    console.log('=====================================')
    console.log('')

    const shouldContinue = await checkExistingUser()

    if (shouldContinue) {
        await createAdminUser()
    } else {
        console.log('❌ Operation cancelled')
    }
}

main().catch(console.error)
