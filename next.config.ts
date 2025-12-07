import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: allow self, eval for Next.js, inline for components, Google OAuth, Stripe
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://js.stripe.com https://www.googletagmanager.com",
              // Styles: allow self and inline styles (required for CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: allow self, data URIs, HTTPS, blob (for uploads)
              "img-src 'self' data: https: blob:",
              // Fonts: allow self and data URIs
              "font-src 'self' data: https://fonts.gstatic.com",
              // API connections: Supabase, Stripe, etc.
              "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",
              // Frames: Google OAuth, Stripe
              "frame-src 'self' https://accounts.google.com https://js.stripe.com https://hooks.stripe.com",
              // No objects/embeds
              "object-src 'none'",
              // Base URI restricted to self
              "base-uri 'self'",
              // Form actions restricted to self
              "form-action 'self'",
              // Prevent being framed
              "frame-ancestors 'none'",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join('; '),
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
          {
            // Strict Transport Security (HSTS) - only in production
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
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
