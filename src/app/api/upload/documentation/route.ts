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

    // Validate file size (10MB max for documents)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'application/rtf',
    ]

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.rtf']

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: 'Only PDF, DOCX, DOC, TXT, MD, and RTF files are allowed',
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from('documents').upload(fileName, file, {
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
    } = supabase.storage.from('documents').getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    })
  } catch (error: any) {
    console.error('Documentation upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Parse request body
    const body = await request.json()
    const { fileName } = body

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }

    // Verify the file belongs to the user (filename starts with user ID)
    if (!fileName.startsWith(user.id + '-')) {
      return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 })
    }

    // Delete from Supabase storage
    const { error } = await supabase.storage.from('documents').remove([fileName])

    if (error) {
      console.error('Supabase storage delete error:', error)
      return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error: any) {
    console.error('Documentation delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
