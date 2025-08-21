import type { DeviceFingerprint } from '@/types/auth'

export function generateDeviceFingerprint(): DeviceFingerprint {
  const fingerprint: DeviceFingerprint = {
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
  }

  return fingerprint
}

export function createFingerprintHash(fingerprint: DeviceFingerprint): string {
  const components = [
    fingerprint.userAgent,
    fingerprint.screen,
    fingerprint.timezone,
    fingerprint.language,
    fingerprint.platform,
  ]

  // Simple hash function - in production you might want to use crypto.subtle
  const data = components.join('|')
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36)
}

export function getDeviceName(): string {
  const ua = navigator.userAgent

  // Mobile devices
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android.*Mobile/i.test(ua)) return 'Android Phone'
  if (/Android/i.test(ua)) return 'Android Tablet'

  // Desktop browsers
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) return 'Chrome Browser'
  if (/Firefox/i.test(ua)) return 'Firefox Browser'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari Browser'
  if (/Edge/i.test(ua)) return 'Edge Browser'

  // Operating systems
  if (/Windows/i.test(ua)) return 'Windows Computer'
  if (/Mac/i.test(ua)) return 'Mac Computer'
  if (/Linux/i.test(ua)) return 'Linux Computer'

  return 'Unknown Device'
}
