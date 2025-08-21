import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test storage bucket access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return NextResponse.json({
        error: 'Failed to access storage',
        details: bucketsError.message,
        supabaseConfigured: false,
      })
    }

    // Check if avatars bucket exists
    const avatarsBucket = buckets?.find((bucket) => bucket.name === 'avatars')

    if (!avatarsBucket) {
      return NextResponse.json({
        error: 'Avatars bucket not found',
        availableBuckets: buckets?.map((b) => b.name) || [],
        supabaseConfigured: true,
        bucketsAccessible: true,
        avatarsBucketExists: false,
      })
    }

    // Test file listing in avatars bucket
    const { data: files, error: filesError } = await supabase.storage.from('avatars').list('', { limit: 1 })

    return NextResponse.json({
      message: 'Storage test successful',
      supabaseConfigured: true,
      bucketsAccessible: true,
      avatarsBucketExists: true,
      canListFiles: !filesError,
      buckets: buckets?.map((b) => ({ name: b.name, public: b.public })),
      avatarsBucket: {
        name: avatarsBucket.name,
        public: avatarsBucket.public,
        createdAt: avatarsBucket.created_at,
      },
      filesError: filesError?.message || null,
    })
  } catch (error: any) {
    console.error('Storage test error:', error)
    return NextResponse.json(
      {
        error: 'Storage test failed',
        details: error.message,
        supabaseConfigured: false,
      },
      { status: 500 }
    )
  }
}
