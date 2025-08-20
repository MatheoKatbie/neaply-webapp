import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Récupérer l'utilisateur authentifié avec le client normal
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        // Récupérer les données utilisateur depuis Prisma
        let dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser) {
            // Créer l'utilisateur s'il n'existe pas
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
                    avatarUrl: user.user_metadata?.avatar_url,
                    passwordHash: null,
                    isSeller: false,
                    isAdmin: false
                }
            })
        }

        return NextResponse.json({
            id: dbUser.id,
            email: dbUser.email,
            displayName: dbUser.displayName,
            avatarUrl: dbUser.avatarUrl,
            isSeller: dbUser.isSeller,
            isAdmin: dbUser.isAdmin,
            createdAt: dbUser.createdAt,
            updatedAt: dbUser.updatedAt
        })
    } catch (error) {
        console.error('Erreur API user:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Récupérer l'utilisateur authentifié avec le client normal
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const updates = await request.json()

        // Mettre à jour l'utilisateur avec Prisma
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updates
        })

        return NextResponse.json({
            id: updatedUser.id,
            email: updatedUser.email,
            displayName: updatedUser.displayName,
            avatarUrl: updatedUser.avatarUrl,
            isSeller: updatedUser.isSeller,
            isAdmin: updatedUser.isAdmin,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        })
    } catch (error) {
        console.error('Erreur API user PATCH:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}