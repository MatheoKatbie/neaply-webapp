export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  isSeller: boolean
  isAdmin: boolean
  displayName: string
  createdAt?: Date
  updatedAt?: Date
  authProvider?: 'email' | 'google' | 'github' | 'discord'
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export type AuthProvider = 'google' | 'github' | 'discord'

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  otpUrl: string
  backupCodes: string[]
}

export interface TwoFactorStatus {
  enabled: boolean
  setupInProgress?: boolean
  backupCodes?: string[]
  methods: string[]
  enabledAt?: string | null
}

export interface RememberedDevice {
  id: string
  name: string
  fingerprint: string
  lastUsed: string
  createdAt: string
  userAgent: string
  ipAddress?: string
}

export interface DeviceFingerprint {
  userAgent: string
  screen: string
  timezone: string
  language: string
  platform: string
}
