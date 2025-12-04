import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  isMaintenanceModeActive,
  isComingSoonModeActive,
  isIPWhitelisted,
} from '@/lib/maintenance'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ============================================
  // SITE STATUS CHECK (Coming Soon / Maintenance)
  // ============================================
  
  // Skip status check for static files and Next.js internals
  const isStaticOrInternal = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/waitlist') ||
    pathname.startsWith('/api/health') ||
    pathname.includes('.') // Files with extensions (images, etc.)

  if (!isStaticOrInternal) {
    // Get client IP for whitelist check
    const clientIP =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null
    const isAllowedIP = isIPWhitelisted(clientIP)

    // COMING SOON MODE (takes priority over maintenance)
    if (isComingSoonModeActive()) {
      if (pathname === '/coming-soon') {
        return NextResponse.next()
      }
      if (!isAllowedIP) {
        return NextResponse.redirect(new URL('/coming-soon', req.url))
      }
    }
    // MAINTENANCE MODE
    else if (isMaintenanceModeActive()) {
      if (pathname === '/maintenance') {
        return NextResponse.next()
      }
      if (!isAllowedIP) {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }
    // Redirect away from status pages if modes are OFF
    else {
      if (pathname === '/maintenance' || pathname === '/coming-soon') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  }
  
  // Pour les routes API, on veut toujours retourner du JSON, jamais des redirects HTML
  const isApiRoute = pathname.startsWith('/api/')

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
    '/how-it-works',
    '/robots.txt',
    '/sitemap.xml',
    '/checkout/success', // Allow checkout success page without auth
    '/checkout/cancelled', // Allow checkout cancelled page without auth
    '/maintenance', // Maintenance page
    '/coming-soon', // Coming soon page
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

  // ============================================
  // API ROUTES HANDLING
  // ============================================
  
  // Webhook routes should never require authentication
  if (pathname.startsWith('/api/webhooks/')) {
    return response
  }

  // Public API routes - allow without authentication
  const publicApiPatterns = [
    '/api/orders/public/',
    '/api/auth/check-2fa-required',
    '/api/auth/login-with-2fa',
    '/api/auth/check-email',
    '/api/marketplace/',
    '/api/packs',
    '/api/store/',
    '/api/search',
    '/api/categories',
    '/api/tags',
  ]

  const isPublicApi = publicApiPatterns.some((pattern) => pathname.startsWith(pattern))

  if (isPublicApi) {
    return response
  }

  // Protected API routes - let the API handle auth errors (return JSON 401, not redirect)
  const protectedApiPatterns = [
    '/api/favorites',
    '/api/reviews',
    '/api/auth/',
    '/api/user',
    '/api/workflows/',
    '/api/orders/',
    '/api/cart/',
    '/api/checkout/',
  ]

  const isProtectedApi = protectedApiPatterns.some((pattern) => pathname.startsWith(pattern))

  if (isProtectedApi || isApiRoute) {
    // Pour les routes API protégées, on laisse l'API gérer l'authentification
    // et retourner une erreur 401 JSON appropriée au lieu de rediriger
    return response
  }

  // ============================================
  // PAGE ROUTES HANDLING
  // ============================================

  // Vérifier si l'utilisateur est authentifié pour les routes de pages protégées
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
