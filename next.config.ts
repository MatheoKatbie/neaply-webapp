import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    // Build Content-Security-Policy directives dynamically so we can
    // avoid 'upgrade-insecure-requests' and HSTS in local development
    const isProd = process.env.NODE_ENV === 'production'
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: allow self, eval for Next.js, inline for components, Google Identity, Stripe, GTM
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://js.stripe.com https://www.googletagmanager.com",
      // Styles: allow self, inline and Google Fonts and accounts.google (for One Tap stylesheet)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      // Explicit style-src-elem fallback for modern browsers
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      // Images: allow self, data URIs, HTTPS, blob (for uploads)
      "img-src 'self' data: https: blob:",
      // Fonts: allow self and data URIs and Google Fonts
      "font-src 'self' data: https://fonts.gstatic.com",
      // API connections: Supabase, Stripe, Google One Tap FedCM endpoints will be added
      "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://accounts.google.com",
      // Frames: Google Identity, Stripe
      "frame-src 'self' https://accounts.google.com https://js.stripe.com https://hooks.stripe.com",
      // No objects/embeds
      "object-src 'none'",
      // Base URI restricted to self
      "base-uri 'self'",
      // Form actions restricted to self
      "form-action 'self'",
      // Prevent being framed
      "frame-ancestors 'none'",
    ]

    if (isProd) {
      // Only include insecure upgrade and HSTS in production
      cspDirectives.push("upgrade-insecure-requests")
    }

    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
          {
            // Prevent clickjacking
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Control referrer information
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Restrict browser features
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // XSS protection (legacy but still useful)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Only send HSTS header in production
          ...(isProd
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin; same-origin-allow-popups',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Pour votre instance Supabase spécifique
      {
        protocol: 'https',
        hostname: 'txizuttdesisnwfagysr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Google user avatars
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
