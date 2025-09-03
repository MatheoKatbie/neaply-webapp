import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { Secret, TOTP } from 'otpauth'

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

    // Parse the request body to get the TOTP code
    const { totpCode } = await request.json()

    if (!totpCode || totpCode.length !== 6) {
      return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 400 })
    }

    // Check if 2FA is enabled
    const has2FA = user.user_metadata?.has_2fa || false
    if (!has2FA) {
      return NextResponse.json({ error: '2FA is not enabled for this user' }, { status: 400 })
    }

    // Get the permanent TOTP secret from user metadata
    const totpSecret = user.user_metadata?.totp_secret
    if (!totpSecret) {
      return NextResponse.json({ error: '2FA secret not found' }, { status: 400 })
    }

    // Verify the TOTP code using the same logic as enable
    const secret = Secret.fromBase32(totpSecret)
    const totp = new TOTP({
      issuer: 'Neaply',
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
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Update user metadata in Supabase Auth to disable 2FA
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        has_2fa: false,
        backup_codes: [],
        totp_secret: null,
        totp_secret_temp: null,
        totp_setup_timestamp: null,
        totp_enabled_at: null,
        totp_disabled_at: new Date().toISOString(),
      },
    })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
