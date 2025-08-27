import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Récupérer l'utilisateur authentifié
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ isAdmin: false }, { status: 401 })
        }

        // Vérifier le statut admin dans la base de données
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true }
        })

        return NextResponse.json({
            isAdmin: dbUser?.isAdmin || false
        })

    } catch (error) {
        console.error('Error checking admin status:', error)
        return NextResponse.json({ isAdmin: false }, { status: 500 })
    }
}
