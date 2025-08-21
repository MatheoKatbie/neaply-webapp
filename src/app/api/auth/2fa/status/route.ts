import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return a placeholder response since Supabase doesn't have built-in 2FA
    // In a real implementation, you would check the user's 2FA status from your database
    // or from a third-party service like Auth0, AWS Cognito, etc.

    const has2FA = user.user_metadata?.has_2fa || false
    const backupCodes = user.user_metadata?.backup_codes || []
    const hasSetupInProgress = !!user.user_metadata?.totp_secret_temp

    return NextResponse.json({
      enabled: has2FA,
      setupInProgress: hasSetupInProgress,
      backupCodes: has2FA ? backupCodes : undefined,
      methods: has2FA ? ['authenticator'] : [],
      enabledAt: user.user_metadata?.totp_enabled_at || null,
    })
  } catch (error) {
    console.error('Error fetching 2FA status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
