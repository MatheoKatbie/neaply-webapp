import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (5MB max for hero images)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, GIF, and WebP files are allowed' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from('hero-images').upload(fileName, file, {
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
    } = supabase.storage.from('hero-images').getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    })
  } catch (error: any) {
    console.error('Hero image upload error:', error)
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

    // Get filename from query params
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    // Verify file ownership with strict prefix check
    // Files must start with "{userId}-" to prevent unauthorized deletion
    if (!fileName.startsWith(`${user.id}-`)) {
      console.warn(`[SECURITY] Unauthorized deletion attempt: user ${user.id} tried to delete ${fileName}`)
      return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 })
    }

    // Delete from Supabase storage
    const { error } = await supabase.storage.from('hero-images').remove([fileName])

    if (error) {
      console.error('Supabase storage delete error:', error)
      return NextResponse.json({ error: `Delete error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error: any) {
    console.error('Hero image delete error:', error)
    return NextResponse.json({ error: 'Failed to delete image. Please try again.' }, { status: 500 })
  }
}
