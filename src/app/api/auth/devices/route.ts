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

    const rememberedDevices = user.user_metadata?.remembered_devices || []

    return NextResponse.json({
      devices: rememberedDevices.sort(
        (a: any, b: any) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      ),
    })
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deviceId } = await request.json()

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 })
    }

    // Get current remembered devices and filter out the one to delete
    const rememberedDevices = user.user_metadata?.remembered_devices || []
    const updatedDevices = rememberedDevices.filter((device: any) => device.id !== deviceId)

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        remembered_devices: updatedDevices,
      },
    })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Device removed successfully',
    })
  } catch (error) {
    console.error('Error removing device:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
