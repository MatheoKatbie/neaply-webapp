import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { Secret, TOTP } from 'otpauth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { totpCode } = await request.json()

    if (!totpCode) {
      return NextResponse.json({ error: 'TOTP code is required' }, { status: 400 })
    }

    // Check if user has a temporary secret from setup
    const tempSecret = user.user_metadata?.totp_secret_temp
    if (!tempSecret) {
      return NextResponse.json({ error: 'No 2FA setup found. Please start setup first.' }, { status: 400 })
    }

    // Verify the TOTP code
    const secret = Secret.fromBase32(tempSecret)
    const totp = new TOTP({
      issuer: 'FlowMarket',
      label: user.email || 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    })

    const currentToken = totp.generate()
    const isValid = totpCode === currentToken

    // Also check the previous and next tokens for clock skew tolerance
    const previousToken = totp.generate({ timestamp: Date.now() - 30000 })
    const nextToken = totp.generate({ timestamp: Date.now() + 30000 })

    const isValidWithSkew = isValid || totpCode === previousToken || totpCode === nextToken

    if (!isValidWithSkew) {
      return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 400 })
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase())

    // Enable 2FA and move temp secret to permanent
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        has_2fa: true,
        totp_secret: tempSecret,
        totp_secret_temp: null,
        totp_setup_timestamp: null,
        backup_codes: backupCodes,
        totp_enabled_at: new Date().toISOString(),
      },
    })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: backupCodes,
    })
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
