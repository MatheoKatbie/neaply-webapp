import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if pack exists
        const pack = await prisma.workflowPack.findUnique({
            where: { id }
        })

        if (!pack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        // Check if already favorited
        const existingFavorite = await prisma.packFavorite.findUnique({
            where: {
                userId_packId: {
                    userId: user.id,
                    packId: id
                }
            }
        })

        if (existingFavorite) {
            return NextResponse.json({ error: 'Pack already favorited' }, { status: 400 })
        }

        // Add to favorites
        await prisma.packFavorite.create({
            data: {
                userId: user.id,
                packId: id
            }
        })

        return NextResponse.json({ message: 'Pack added to favorites' })
    } catch (error) {
        console.error('Error adding pack to favorites:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Remove from favorites
        await prisma.packFavorite.delete({
            where: {
                userId_packId: {
                    userId: user.id,
                    packId: id
                }
            }
        })

        return NextResponse.json({ message: 'Pack removed from favorites' })
    } catch (error) {
        console.error('Error removing pack from favorites:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
