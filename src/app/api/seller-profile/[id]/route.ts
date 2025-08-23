import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch seller profile by user ID
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        userId: true,
        storeName: true,
        slug: true,
        bio: true,
        websiteUrl: true,
        supportEmail: true,
        phoneNumber: true,
        countryCode: true,
        status: true,
      },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: sellerProfile,
    })
  } catch (error) {
    console.error('Error fetching seller profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
