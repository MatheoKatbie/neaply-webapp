/**
 * Site Status Configuration
 *
 * Toggle these settings to control site availability.
 *
 * Usage:
 * - COMING_SOON_MODE: true = site not launched yet (shows coming soon page)
 * - MAINTENANCE_MODE: true = site temporarily down for maintenance
 * - Add IP addresses to ALLOWED_IPS to whitelist admins/developers
 */

// ⚠️ COMING SOON MODE - Set to true if the site is not launched yet
export const COMING_SOON_MODE = false;

// ⚠️ MAINTENANCE MODE - Set to true for temporary maintenance
export const MAINTENANCE_MODE = false

// Whitelisted IP addresses (these users can bypass coming soon/maintenance)
// Add your IP address here to access the site during development
export const ALLOWED_IPS: string[] = [
  // '127.0.0.1',
  // 'YOUR_IP_ADDRESS',
]

/**
 * Helper function to check if an IP is whitelisted
 */
export function isIPWhitelisted(ip: string | null): boolean {
  if (!ip) return false
  return ALLOWED_IPS.includes(ip)
}

/**
 * Check if coming soon mode is active
 */
export function isComingSoonModeActive(): boolean {
  if (process.env.COMING_SOON_MODE === 'true') return true
  if (process.env.COMING_SOON_MODE === 'false') return false
  return COMING_SOON_MODE
}

/**
 * Check if maintenance mode is active
 */
export function isMaintenanceModeActive(): boolean {
  if (process.env.MAINTENANCE_MODE === 'true') return true
  if (process.env.MAINTENANCE_MODE === 'false') return false
  return MAINTENANCE_MODE
}
