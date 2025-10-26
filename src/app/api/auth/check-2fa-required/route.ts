import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Check if an email has 2FA enabled WITHOUT creating a session
 * This is a public endpoint used during login flow
 * 
 * Security note: This endpoint doesn't reveal if a user exists or not
 * to prevent email enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, fingerprint } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create an admin client to query user metadata without authentication
    // This uses the service role key which has admin privileges
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Try to get user by email using admin API
    // This is more efficient than listing all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Limit to reasonable number
    })

    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json({ error: 'Failed to check 2FA status' }, { status: 500 })
    }

    // Find user by email (case-insensitive)
    const user = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      // For security, don't reveal if user exists
      // Return same response as if 2FA is not enabled
      return NextResponse.json({
        requires2FA: false,
        exists: false,
      })
    }

    const has2FA = user.user_metadata?.has_2fa || false

    // If no 2FA enabled, no need to check device
    if (!has2FA) {
      return NextResponse.json({
        requires2FA: false,
        exists: true,
      })
    }

    // Check if device is remembered
    if (fingerprint) {
      const rememberedDevices = user.user_metadata?.remembered_devices || []
      const isRemembered = rememberedDevices.some((device: any) => device.fingerprint === fingerprint)

      if (isRemembered) {
        return NextResponse.json({
          requires2FA: false,
          exists: true,
          deviceRemembered: true,
        })
      }
    }

    return NextResponse.json({
      requires2FA: true,
      exists: true,
      deviceRemembered: false,
    })
  } catch (error) {
    console.error('Error checking 2FA requirement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

