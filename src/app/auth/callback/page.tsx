'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Erreur lors de la récupération de la session:', error)
                    router.push('/auth/login?error=callback_error')
                    return
                }

                if (data.session) {
                    // Utilisateur connecté avec succès
                    router.push('/')
                } else {
                    // Pas de session trouvée
                    router.push('/auth/login')
                }
            } catch (error) {
                console.error('Erreur lors du callback d\'authentification:', error)
                router.push('/auth/login?error=callback_error')
            }
        }

        handleAuthCallback()
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Authentification en cours...</p>
            </div>
        </div>
    )
}
