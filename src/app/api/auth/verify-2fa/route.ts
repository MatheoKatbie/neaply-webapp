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

    const { totpCode, backupCode, rememberDevice, deviceInfo } = await request.json()

    if (!totpCode && !backupCode) {
      return NextResponse.json({ error: 'TOTP code or backup code is required' }, { status: 400 })
    }

    // Check if user has 2FA enabled
    const has2FA = user.user_metadata?.has_2fa || false
    if (!has2FA) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
    }

    let isValidCode = false

    if (backupCode) {
      // Verify backup code
      const backupCodes = user.user_metadata?.backup_codes || []
      isValidCode = backupCodes.includes(backupCode.toUpperCase())

      if (isValidCode) {
        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter((code: string) => code !== backupCode.toUpperCase())
        await supabase.auth.updateUser({
          data: {
            backup_codes: updatedBackupCodes,
          },
        })
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

      const currentToken = totp.generate()
      const previousToken = totp.generate({ timestamp: Date.now() - 30000 })
      const nextToken = totp.generate({ timestamp: Date.now() + 30000 })

      isValidCode = totpCode === currentToken || totpCode === previousToken || totpCode === nextToken
    }

    if (!isValidCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // If remember device is requested, save device info
    if (rememberDevice && deviceInfo) {
      const rememberedDevices = user.user_metadata?.remembered_devices || []

      const deviceData = {
        id: crypto.randomUUID(),
        name: deviceInfo.deviceName || 'Unknown Device',
        fingerprint: deviceInfo.fingerprint,
        userAgent: deviceInfo.userAgent || 'Unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      }

      const updatedDevices = [deviceData, ...rememberedDevices].slice(0, 10)

      await supabase.auth.updateUser({
        data: {
          remembered_devices: updatedDevices,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
    })
  } catch (error) {
    console.error('Error verifying 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
