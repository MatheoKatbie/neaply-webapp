import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
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

    const { fingerprint } = await request.json()

    if (!fingerprint) {
      return NextResponse.json({ error: 'Device fingerprint is required' }, { status: 400 })
    }

    // Get remembered devices from user metadata
    const rememberedDevices = user.user_metadata?.remembered_devices || []

    // Check if this device fingerprint exists
    const isRemembered = rememberedDevices.some((device: any) => device.fingerprint === fingerprint)

    return NextResponse.json({
      isRemembered,
      requiresTwoFA: user.user_metadata?.has_2fa && !isRemembered,
    })
  } catch (error) {
    console.error('Error checking device:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
