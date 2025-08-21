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

    const { fingerprint, deviceName, userAgent } = await request.json()

    if (!fingerprint || !deviceName) {
      return NextResponse.json({ error: 'Device fingerprint and name are required' }, { status: 400 })
    }

    // Get current remembered devices
    const rememberedDevices = user.user_metadata?.remembered_devices || []

    // Check if device already exists
    const existingDeviceIndex = rememberedDevices.findIndex((device: any) => device.fingerprint === fingerprint)

    const deviceData = {
      id: crypto.randomUUID(),
      name: deviceName,
      fingerprint,
      userAgent: userAgent || 'Unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    }

    let updatedDevices
    if (existingDeviceIndex >= 0) {
      // Update existing device
      updatedDevices = [...rememberedDevices]
      updatedDevices[existingDeviceIndex] = {
        ...updatedDevices[existingDeviceIndex],
        lastUsed: new Date().toISOString(),
        userAgent: userAgent || updatedDevices[existingDeviceIndex].userAgent,
      }
    } else {
      // Add new device (limit to 10 devices max)
      updatedDevices = [deviceData, ...rememberedDevices].slice(0, 10)
    }

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
      message: 'Device remembered successfully',
      device: deviceData,
    })
  } catch (error) {
    console.error('Error remembering device:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
