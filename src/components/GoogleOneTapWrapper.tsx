'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import GoogleOneTap from './GoogleOneTap'

export default function GoogleOneTapWrapper() {
    const pathname = usePathname()
    const { user, loading } = useAuth()

    // Afficher Google One Tap uniquement sur la page d'accueil et si l'utilisateur n'est pas connecté
    const shouldShowOneTap = pathname === '/' && !user && !loading

    // Vérifier que l'ID client Google est configuré
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    // En mode développement, afficher un message si le client ID n'est pas configuré
    if (!googleClientId) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured')
        }
        return null
    }

    if (!shouldShowOneTap) {
        return null
    }

    return (
        <GoogleOneTap
            clientId={googleClientId}
            autoSelect={false}
            cancelOnTapOutside={true}
            context="signin"
            uxMode="popup"
            itpSupport={true}
            useFedCM={true} // Désactiver FedCM en développement
        />
    )
}
