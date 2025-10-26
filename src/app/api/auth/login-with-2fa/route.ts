import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Secret, TOTP } from 'otpauth'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'

/**
 * Secure login endpoint for users with 2FA enabled
 * This endpoint verifies credentials AND 2FA code before creating a session
 * 
 * Security flow:
 * 1. Verify 2FA code first (without creating session)
 * 2. Only create session if 2FA verification succeeds
 * 3. Handle device remembering if requested
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, totpCode, backupCode, rememberDevice, deviceInfo } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!totpCode && !backupCode) {
      return NextResponse.json({ error: 'TOTP code or backup code is required' }, { status: 400 })
    }

    // Create admin client to check user metadata without creating a session
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get user by email to check 2FA status
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listError) {
      console.error('Error fetching users:', listError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const user = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if user has 2FA enabled
    const has2FA = user.user_metadata?.has_2fa || false
    if (!has2FA) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
    }

    // Verify the 2FA code BEFORE creating a session
    let isValidCode = false
    let usedBackupCode: string | null = null

    if (backupCode) {
      // Verify backup code
      const backupCodes = user.user_metadata?.backup_codes || []
      isValidCode = backupCodes.includes(backupCode.toUpperCase())
      if (isValidCode) {
        usedBackupCode = backupCode.toUpperCase()
      }
    } else if (totpCode) {
      // Verify TOTP code
      const totpSecret = user.user_metadata?.totp_secret
      if (!totpSecret) {
        return NextResponse.json({ error: 'TOTP not configured' }, { status: 400 })
      }

      const secret = Secret.fromBase32(totpSecret)
      const totp = new TOTP({
        issuer: 'Neaply',
        label: user.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      })

      // Strict verification: only accept current token (no window for previous/next)
      const currentToken = totp.generate()
      isValidCode = totpCode === currentToken
    }

    if (!isValidCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 })
    }

    // 2FA verified! Now create the session
    const supabase = await createClient()
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.session) {
      console.error('Sign in error after 2FA verification:', signInError)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update user metadata (backup codes and/or remembered devices)
    const updatedMetadata: Record<string, any> = { ...user.user_metadata }

    // If using backup code, remove it from the list
    if (usedBackupCode) {
      const backupCodes = user.user_metadata?.backup_codes || []
      updatedMetadata.backup_codes = backupCodes.filter((code: string) => code !== usedBackupCode)
    }

    // If remember device is requested, save device info
    if (rememberDevice && deviceInfo) {
      const rememberedDevices = user.user_metadata?.remembered_devices || []

      const deviceData = {
        id: crypto.randomUUID(),
        name: deviceInfo.deviceName || 'Unknown Device',
        fingerprint: deviceInfo.fingerprint,
        userAgent: deviceInfo.userAgent || 'Unknown',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      }

      updatedMetadata.remembered_devices = [deviceData, ...rememberedDevices].slice(0, 10)
    }

    // Update user metadata if needed
    if (usedBackupCode || (rememberDevice && deviceInfo)) {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: updatedMetadata,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Error in login with 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

