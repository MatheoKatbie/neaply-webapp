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

    // In a real implementation, you might want to require additional verification
    // before disabling 2FA (like entering current password or 2FA code)

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
