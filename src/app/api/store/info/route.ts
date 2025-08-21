import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

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

    // Get seller profile information
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: {
        storeName: true,
        slug: true,
        bio: true,
        websiteUrl: true,
        supportEmail: true,
        status: true,
      },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({
      storeName: sellerProfile.storeName,
      slug: sellerProfile.slug,
      bio: sellerProfile.bio,
      websiteUrl: sellerProfile.websiteUrl,
      supportEmail: sellerProfile.supportEmail,
      status: sellerProfile.status,
    })
  } catch (error) {
    console.error('Error fetching store info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const { bio, websiteUrl, supportEmail } = updates

    // Update seller profile
    const updatedProfile = await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(supportEmail !== undefined && { supportEmail }),
      },
      select: {
        storeName: true,
        slug: true,
        bio: true,
        websiteUrl: true,
        supportEmail: true,
        status: true,
      },
    })

    return NextResponse.json({
      storeName: updatedProfile.storeName,
      slug: updatedProfile.slug,
      bio: updatedProfile.bio,
      websiteUrl: updatedProfile.websiteUrl,
      supportEmail: updatedProfile.supportEmail,
      status: updatedProfile.status,
    })
  } catch (error) {
    console.error('Error updating store info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
