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
    '/search',
    '/marketplace',
    '/robots.txt',
    '/sitemap.xml',
    '/checkout/success', // Allow checkout success page without auth
    '/checkout/cancelled', // Allow checkout cancelled page without auth
  ]

  // Routes dynamiques publiques (patterns)
  const publicRoutePatterns = [
    '/workflow/', // Allow workflow detail pages
    '/store/', // Allow store pages
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
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/checkout/') ||
    publicRoutePatterns.some((pattern) => pathname.startsWith(pattern))

  if (isPublicRoute) {
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

  // Public API routes for marketplace and homepage
  if (
    pathname.startsWith('/api/marketplace/') ||
    pathname.startsWith('/api/packs') ||
    pathname.startsWith('/api/store/') ||
    pathname.startsWith('/api/search') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/tags')
  ) {
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
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // Récupérer les données utilisateur depuis Supabase Auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Si pas d'utilisateur, rediriger vers la page d'accueil
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Pour les routes admin, on laisse le layout admin gérer la vérification
    // Cela évite les appels API depuis le middleware
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
