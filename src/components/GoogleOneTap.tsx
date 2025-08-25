'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
          disableAutoSelect: () => void
          cancel: () => void
        }
      }
    }
  }
}

interface GoogleOneTapProps {
  clientId: string
  autoSelect?: boolean
  cancelOnTapOutside?: boolean
  promptParentId?: string
  stateCookieDomain?: string
  context?: 'signin' | 'signup' | 'use'
  loginUri?: string
  nativeCallback?: string
  uxMode?: 'popup' | 'redirect'
  itpSupport?: boolean
  useFedCM?: boolean
}

export default function GoogleOneTap({
  clientId,
  autoSelect = true,
  cancelOnTapOutside = true,
  promptParentId,
  stateCookieDomain,
  context = 'signin',
  loginUri,
  nativeCallback,
  uxMode = 'popup',
  itpSupport = true,
  useFedCM = true,
}: GoogleOneTapProps) {
  const { user, loading } = useAuth()
  const oneTapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Ne pas afficher si l'utilisateur est déjà connecté ou en cours de chargement
    if (user || loading) {
      return
    }

    // Charger le script Google Identity Services
    const loadGoogleScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
        document.head.appendChild(script)
      })
    }

    const initializeGoogleOneTap = async () => {
      try {
        await loadGoogleScript()

        if (!window.google?.accounts?.id) {
          console.error('Google Identity Services not available')
          return
        }

        // Configuration pour Google One Tap avec support FedCM
        const config: any = {
          client_id: clientId,
          auto_select: autoSelect,
          cancel_on_tap_outside: cancelOnTapOutside,
          context: context,
          ux_mode: uxMode,
          itp_support: itpSupport,
          use_fedcm_for_prompt: useFedCM, // Activer FedCM
          callback: async (response: any) => {
            try {
              console.log('Google One Tap response:', response)

              // Google One Tap retourne un JWT token
              if (response.credential) {
                // Utiliser le token JWT pour l'authentification avec Supabase
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: response.credential,
                })

                if (error) {
                  console.error('Google One Tap sign in failed:', error)
                  // Annuler le prompt en cas d'erreur
                  window.google?.accounts?.id?.cancel()
                } else {
                  console.log('Google One Tap sign in successful:', data)
                  // L'utilisateur est maintenant connecté, le composant se démontera automatiquement
                }
              }
            } catch (error) {
              console.error('Error handling Google One Tap callback:', error)
              // Annuler le prompt en cas d'erreur
              window.google?.accounts?.id?.cancel()
            }
          },
        }

        // Ajouter des options conditionnelles
        if (promptParentId) {
          config.promptParentId = promptParentId
        }
        if (stateCookieDomain) {
          config.stateCookieDomain = stateCookieDomain
        }
        if (loginUri) {
          config.loginUri = loginUri
        }
        if (nativeCallback) {
          config.nativeCallback = nativeCallback
        }

        // Initialiser Google One Tap
        window.google.accounts.id.initialize(config)

        // Réinitialiser les préférences pour forcer l'affichage (en développement)
        if (process.env.NODE_ENV === 'development') {
          // Supprimer les cookies de préférence Google One Tap
          document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }

        // Afficher le prompt One Tap avec gestion détaillée des erreurs
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason()
            console.log('Google One Tap not displayed:', reason)

            // Gérer les raisons spécifiques
            switch (reason) {
              case 'browser_not_supported':
                console.warn('Browser does not support Google One Tap')
                break
              case 'invalid_client':
                console.error('Invalid Google client ID configuration')
                break
              case 'opt_out_or_no_session':
                console.log('User opted out or no session available')
                break
              case 'secure_http_required':
                console.error('HTTPS required for Google One Tap')
                break
              case 'suppressed_by_user':
                console.log('User suppressed the prompt')
                break
              case 'unregistered_origin':
                console.error('Origin not registered in Google Cloud Console')
                break
              case 'unknown_reason':
                console.error('Unknown reason for not displaying')
                break
              default:
                console.log('One Tap not displayed:', reason)
            }
          } else if (notification.isSkippedMoment()) {
            const reason = notification.getSkippedReason()
            console.log('Google One Tap skipped:', reason)
          } else if (notification.isDismissedMoment()) {
            const reason = notification.getDismissedReason()
            console.log('Google One Tap dismissed:', reason)
          }
        })

      } catch (error) {
        console.error('Error initializing Google One Tap:', error)
      }
    }

    // Délai pour s'assurer que la page est complètement chargée
    const timer = setTimeout(initializeGoogleOneTap, 1000)

    return () => {
      clearTimeout(timer)
      // Désactiver One Tap lors du démontage
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect()
      }
    }
  }, [user, loading, clientId, autoSelect, cancelOnTapOutside, promptParentId, stateCookieDomain, context, loginUri, nativeCallback, uxMode, itpSupport])

  // Le composant ne rend rien visible, il gère juste l'affichage du popup Google
  return null
}
