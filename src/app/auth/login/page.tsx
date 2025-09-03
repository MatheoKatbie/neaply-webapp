'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { createFingerprintHash, generateDeviceFingerprint, getDeviceName } from '@/lib/device-fingerprint'
import type { LoginFormData } from '@/types/auth'
import { Key, Shield, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Component that uses searchParams - needs to be wrapped in Suspense
function LoginContent() {
  const { signIn, signInWithProvider, loading, error } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // 2FA States
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa'>('credentials')
  const [requiresTwoFA, setRequiresTwoFA] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)
  const [deviceFingerprint, setDeviceFingerprint] = useState('')
  const [use2FATab, setUse2FATab] = useState<'totp' | 'backup'>('totp')

  const callbackError = searchParams.get('error')

  // Generate device fingerprint on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fingerprint = generateDeviceFingerprint()
      const hash = createFingerprintHash(fingerprint)
      setDeviceFingerprint(hash)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, check if device is remembered (but only after auth attempt)
      const { error } = await signIn(formData)
      if (!error) {
        // Check if 2FA is required for this user
        if (deviceFingerprint) {
          const deviceCheckResponse = await fetch('/api/auth/devices/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fingerprint: deviceFingerprint }),
          })

          if (deviceCheckResponse.ok) {
            const deviceData = await deviceCheckResponse.json()
            if (deviceData.requiresTwoFA) {
              setRequiresTwoFA(true)
              setLoginStep('2fa')
              return
            }
          }
        }

        // If no 2FA required, redirect
        router.push('/')
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const code = use2FATab === 'totp' ? totpCode : backupCode

      if (!code) {
        toast.error('Code Required', {
          description: `Please enter a ${use2FATab === 'totp' ? '6-digit' : 'backup'} code`,
        })
        return
      }

      const requestBody = {
        ...(use2FATab === 'totp' ? { totpCode: code } : { backupCode: code }),
        rememberDevice,
        deviceInfo: rememberDevice
          ? {
              fingerprint: deviceFingerprint,
              deviceName: getDeviceName(),
              userAgent: navigator.userAgent,
            }
          : undefined,
      }

      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast.success('Login Successful', {
          description: 'Two-factor authentication verified successfully.',
        })
        router.push('/')
      } else {
        const error = await response.json()
        toast.error('Verification Failed', {
          description: error.error || 'Invalid code. Please try again.',
        })
      }
    } catch (err) {
      console.error('2FA verification error:', err)
      toast.error('Error', {
        description: 'Failed to verify code. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithProvider('google')
    } catch (err) {
      console.error('Google login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithProvider('github')
    } catch (err) {
      console.error('GitHub login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-foreground">Welcome to Neaply</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {loginStep === 'credentials' ? 'Sign in to your account' : 'Enter your verification code'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {loginStep === '2fa' && <Shield className="h-5 w-5" />}
                {loginStep === 'credentials' ? 'Sign In' : 'Two-Factor Authentication'}
              </CardTitle>
              <CardDescription>
                {loginStep === 'credentials'
                  ? 'Enter your credentials to access your account'
                  : 'Verify your identity with your authenticator app or backup code'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message d'erreur de callback */}
              {callbackError === 'callback_error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  An error occurred during authentication. Please try again.
                </div>
              )}

              {/* Message d'erreur général */}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              {loginStep === 'credentials' && (
                <>
                  {/* Boutons OAuth */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {isLoading ? 'Signing in...' : 'Continue with Google'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGitHubSignIn}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                      {isLoading ? 'Signing in...' : 'Continue with GitHub'}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Formulaire de connexion */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </>
              )}

              {loginStep === '2fa' && (
                <form onSubmit={handle2FASubmit} className="space-y-4">
                  <Tabs value={use2FATab} onValueChange={(value) => setUse2FATab(value as 'totp' | 'backup')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="totp" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Authenticator
                      </TabsTrigger>
                      <TabsTrigger value="backup" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Backup Code
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="totp" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="totpCode">Verification Code</Label>
                        <Input
                          id="totpCode"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="text-center text-lg font-mono tracking-wider"
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="backup" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="backupCode">Backup Code</Label>
                        <Input
                          id="backupCode"
                          value={backupCode}
                          onChange={(e) =>
                            setBackupCode(
                              e.target.value
                                .toUpperCase()
                                .replace(/[^A-F0-9]/g, '')
                                .slice(0, 8)
                            )
                          }
                          placeholder="XXXXXXXX"
                          className="text-center text-lg font-mono tracking-wider"
                          maxLength={8}
                        />
                        <p className="text-sm text-muted-foreground">Enter one of your 8-character backup codes</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center space-x-2">
                    <Switch id="rememberDevice" checked={rememberDevice} onCheckedChange={setRememberDevice} />
                    <Label htmlFor="rememberDevice" className="text-sm">
                      Remember this device for 30 days
                    </Label>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      {rememberDevice
                        ? "This device will be remembered and won't require 2FA for 30 days."
                        : "You'll need to verify your identity each time you sign in from this device."}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || (use2FATab === 'totp' ? totpCode.length !== 6 : backupCode.length !== 8)}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setLoginStep('credentials')
                        setTotpCode('')
                        setBackupCode('')
                        setRememberDevice(false)
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}

              {loginStep === 'credentials' && (
                <div className="text-center text-sm space-y-2">
                  <div>
                    <Link href="/auth/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                      Create account
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
