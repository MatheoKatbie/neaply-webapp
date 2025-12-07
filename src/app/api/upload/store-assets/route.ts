import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { ratelimit, checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { fileTypeFromBuffer } from 'file-type'

type AssetType = 'logo' | 'banner'

const ASSET_CONFIG = {
  logo: {
    maxSize: 2 * 1024 * 1024, // 2MB
    folder: 'logos',
    maxSizeLabel: '2MB',
  },
  banner: {
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'banners',
    maxSizeLabel: '5MB',
  },
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const assetType = formData.get('type') as AssetType

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!assetType || !['logo', 'banner'].includes(assetType)) {
      return NextResponse.json({ error: 'Invalid asset type. Must be "logo" or "banner"' }, { status: 400 })
    }

    const config = ASSET_CONFIG[assetType]

    // Apply rate limiting (10 uploads per hour)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const identifier = getRateLimitIdentifier(user.id, ip)
    const rateLimitResult = await checkRateLimit(ratelimit.upload, identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many upload attempts. Please try again later.',
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      )
    }

    // Validate file size
    if (file.size > config.maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${config.maxSizeLabel}` },
        { status: 400 }
      )
    }

    // Step 1: Validate MIME type (first line of defense)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed' },
        { status: 400 }
      )
    }

    // Step 2: Validate file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
    }

    // Step 3: Validate magic bytes (file signature) - most secure check
    const buffer = await file.arrayBuffer()
    const fileType = await fileTypeFromBuffer(Buffer.from(buffer))

    if (!fileType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType.mime)) {
      console.warn(
        `[SECURITY] Store asset upload rejected: declared type ${file.type}, actual type ${fileType?.mime || 'unknown'}`
      )
      return NextResponse.json(
        { error: 'File content does not match declared type. Upload rejected for security reasons.' },
        { status: 400 }
      )
    }

    // Generate unique filename: {folder}/{userId}-{timestamp}.{ext}
    const fileName = `${config.folder}/${user.id}-${Date.now()}${fileExt}`

    // Convert buffer back to Blob for upload
    const validatedFile = new Blob([buffer], { type: fileType.mime })

    // Delete old file if exists
    const oldUrl = assetType === 'logo' ? sellerProfile.logoUrl : sellerProfile.bannerUrl
    if (oldUrl) {
      try {
        // Extract filename from URL
        const urlParts = oldUrl.split('/store-assets/')
        if (urlParts.length > 1) {
          const oldFileName = urlParts[1]
          await supabase.storage.from('store-assets').remove([oldFileName])
        }
      } catch (deleteError) {
        console.error('Error deleting old asset:', deleteError)
        // Continue with upload even if delete fails
      }
    }

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from('store-assets').upload(fileName, validatedFile, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('store-assets').getPublicUrl(fileName)

    // Update SellerProfile with new URL
    const updateData = assetType === 'logo' ? { logoUrl: publicUrl } : { bannerUrl: publicUrl }

    await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      type: assetType,
    })
  } catch (error: any) {
    console.error('Store asset upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 403 })
    }

    // Get asset type from query params
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get('type') as AssetType

    if (!assetType || !['logo', 'banner'].includes(assetType)) {
      return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
    }

    const currentUrl = assetType === 'logo' ? sellerProfile.logoUrl : sellerProfile.bannerUrl

    if (!currentUrl) {
      return NextResponse.json({ error: 'No asset to delete' }, { status: 404 })
    }

    // Extract filename from URL and verify ownership
    const urlParts = currentUrl.split('/store-assets/')
    if (urlParts.length < 2) {
      return NextResponse.json({ error: 'Invalid asset URL' }, { status: 400 })
    }

    const fileName = urlParts[1]

    // Verify file ownership with strict prefix check
    if (!fileName.includes(`${user.id}-`)) {
      console.warn(`[SECURITY] Unauthorized deletion attempt: user ${user.id} tried to delete ${fileName}`)
      return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 })
    }

    // Delete from Supabase storage
    const { error } = await supabase.storage.from('store-assets').remove([fileName])

    if (error) {
      console.error('Supabase storage delete error:', error)
      return NextResponse.json({ error: `Delete error: ${error.message}` }, { status: 500 })
    }

    // Update SellerProfile to remove URL
    const updateData = assetType === 'logo' ? { logoUrl: null } : { bannerUrl: null }

    await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: `${assetType} deleted successfully`,
    })
  } catch (error: any) {
    console.error('Store asset delete error:', error)
    return NextResponse.json({ error: 'Failed to delete image. Please try again.' }, { status: 500 })
  }
}
