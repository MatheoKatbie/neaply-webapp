import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    const { totpCode, backupCodes } = await request.json()

    if (!totpCode) {
      return NextResponse.json({ error: 'TOTP code is required' }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Verify the TOTP code against the user's secret
    // 2. Enable 2FA for the user
    // 3. Store backup codes securely

    // For now, we'll simulate enabling 2FA by updating user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        has_2fa: true,
        backup_codes: backupCodes || [],
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
