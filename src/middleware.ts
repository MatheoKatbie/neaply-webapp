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
    ]

    const { pathname } = req.nextUrl

    // Permettre l'accès aux routes publiques
    if (publicRoutes.includes(pathname)) {
        // Si l'utilisateur est connecté et essaie d'accéder aux pages auth, rediriger vers la page d'accueil
        if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
            return NextResponse.redirect(new URL('/', req.url))
        }
        return response
    }

    // Vérifier si l'utilisateur est authentifié pour les routes protégées
    if (!session) {
        // Rediriger vers la page de connexion avec l'URL de retour
        const redirectUrl = new URL('/auth/login', req.url)
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
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
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
