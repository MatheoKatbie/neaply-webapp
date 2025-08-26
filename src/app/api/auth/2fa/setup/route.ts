import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { Secret, TOTP } from 'otpauth'
import QRCode from 'qrcode'

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

    // Check if 2FA is already enabled
    const has2FA = user.user_metadata?.has_2fa || false
    if (has2FA) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
    }

    // Generate a new secret for TOTP
    const secret = new Secret({ size: 32 })
    const totp = new TOTP({
      issuer: 'Neaply',
      label: user.email || 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    })

    // Generate QR code URL
    const otpUrl = totp.toString()

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpUrl)

    // Store the secret temporarily in user metadata (will be confirmed during verification)
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        totp_secret_temp: secret.base32,
        totp_setup_timestamp: new Date().toISOString(),
      },
    })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpUrl: otpUrl,
      backupCodes: [], // Will generate after verification
    })
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
