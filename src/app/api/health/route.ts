import { NextResponse } from 'next/server'
import { isMaintenanceModeActive } from '@/lib/maintenance'

export async function GET() {
  const isInMaintenance = isMaintenanceModeActive()

  return NextResponse.json({
    status: isInMaintenance ? 'maintenance' : 'healthy',
    timestamp: new Date().toISOString(),
    maintenance: {
      active: isInMaintenance,
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  })
}
