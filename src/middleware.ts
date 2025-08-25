import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Rafraîchir la session si expirée
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/reset-password',
    '/',
    '/checkout/success', // Allow checkout success page without auth
    '/checkout/cancelled', // Allow checkout cancelled page without auth
  ]

  // Routes admin qui nécessitent des privilèges admin
  const adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/workflows',
    '/admin/orders',
    '/admin/reports',
    '/admin/settings',
  ]

  const { pathname } = req.nextUrl

  // Permettre l'accès aux routes publiques
  if (publicRoutes.includes(pathname) || pathname.startsWith('/checkout/')) {
    // Si l'utilisateur est connecté et essaie d'accéder aux pages auth, rediriger vers la page d'accueil
    if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return response
  }

  // Webhook routes should never require authentication
  if (pathname.startsWith('/api/webhooks/')) {
    return response
  }

  // Public API routes for order access
  if (pathname.startsWith('/api/orders/public/')) {
    return response
  }

  // Vérifier si l'utilisateur est authentifié pour les routes protégées
  if (!session) {
    // Rediriger vers la page de connexion avec l'URL de retour
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Vérifier les privilèges admin pour les routes admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Récupérer les données utilisateur depuis Supabase Auth
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Vérifier le statut admin dans les métadonnées utilisateur
      const isAdmin = user.user_metadata?.isAdmin === true

      if (!isAdmin) {
        // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
        return NextResponse.redirect(new URL('/', req.url))
      }
    } else {
      // Si pas d'utilisateur, rediriger vers la page d'accueil
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/webhooks (webhook endpoints should not be protected)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
