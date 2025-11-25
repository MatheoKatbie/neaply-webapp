import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
// If UPSTASH_REDIS_REST_URL is not set, rate limiting will be disabled (development mode)
const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null

/**
 * Rate limiters for different API endpoints
 * Each limiter has different thresholds based on sensitivity
 */
export const ratelimit = {
    /**
     * Auth endpoints (login, 2FA verification)
     * Very strict: 5 attempts per 15 minutes
     * Prevents brute force attacks on authentication
     */
    auth: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, '15 m'),
            analytics: true,
            prefix: 'ratelimit:auth',
        })
        : null,

    /**
     * General API endpoints
     * Moderate: 100 requests per minute
     * Prevents API abuse while allowing normal usage
     */
    api: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(100, '1 m'),
            analytics: true,
            prefix: 'ratelimit:api',
        })
        : null,

    /**
     * File upload endpoints
     * Strict: 10 uploads per hour
     * Prevents storage abuse and excessive bandwidth usage
     */
    upload: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, '1 h'),
            analytics: true,
            prefix: 'ratelimit:upload',
        })
        : null,

    /**
     * Checkout/payment endpoints
     * Moderate: 20 attempts per hour
     * Prevents payment spam while allowing legitimate retries
     */
    checkout: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(20, '1 h'),
            analytics: true,
            prefix: 'ratelimit:checkout',
        })
        : null,

    /**
     * Content creation endpoints (workflows, reviews)
     * Moderate: 30 creations per hour
     * Prevents spam while allowing active users to work
     */
    create: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(30, '1 h'),
            analytics: true,
            prefix: 'ratelimit:create',
        })
        : null,
}

/**
 * Helper function to check rate limit and return appropriate response
 * @param limiter - The rate limiter to use
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @returns Object with success status and remaining/reset info
 */
export async function checkRateLimit(
    limiter: Ratelimit | null,
    identifier: string
): Promise<{
    success: boolean
    limit?: number
    remaining?: number
    reset?: number
}> {
    // If rate limiting is disabled (no Redis configured), allow all requests
    if (!limiter) {
        return { success: true }
    }

    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    return {
        success,
        limit,
        remaining,
        reset,
    }
}

/**
 * Get rate limit identifier from request
 * Prefers user ID if authenticated, falls back to IP address
 */
export function getRateLimitIdentifier(userId?: string, ip?: string): string {
    return userId || ip || 'anonymous'
}
