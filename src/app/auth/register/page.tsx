'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import type { RegisterFormData } from '@/types/auth'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RegisterPage() {
  const { signUp, signInWithProvider, error: globalError, clearError } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Clear global error when component mounts and use only local errors
  useEffect(() => {
    clearError()
  }, [clearError])

  // Use only local error, ignore global error completely
  const displayError = localError


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError(null) // Clear local error when starting new registration attempt

    try {
      const { error } = await signUp(formData)
      if (error) {
        setLocalError(error)
        return
      }
      if (!error) {
        setRegistrationSuccess(true)
      }
    } catch (err) {
      console.error('Registration error:', err)
      setLocalError('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setLocalError(null) // Clear local error when starting OAuth
    try {
      const { error } = await signInWithProvider('google')
      if (error) {
        setLocalError(error)
      }
    } catch (err) {
      console.error('Google login error:', err)
      setLocalError('An error occurred during Google authentication')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    setLocalError(null) // Clear local error when starting OAuth
    try {
      const { error } = await signInWithProvider('github')
      if (error) {
        setLocalError(error)
      }
    } catch (err) {
      console.error('GitHub login error:', err)
      setLocalError('An error occurred during GitHub authentication')
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

  if (registrationSuccess) {
    return (
      <>
        <div className="h-screen grid lg:grid-cols-2 font-aeonikpro">
          {/* Left side - Success message */}
          <div className="flex items-center justify-center bg-[#08080A] px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-md w-full py-8">
              <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                <CardHeader>
                  <CardTitle className="text-center text-green-600">Registration successful!</CardTitle>
                  <CardDescription className="text-center text-[#9DA2B3] font-aeonikpro">Check your email to confirm your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-primary rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-green-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-[#9DA2B3] font-aeonikpro">
                      A confirmation email has been sent to <strong>{formData.email}</strong>. Click the link in the
                      email to activate your account.
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => router.push('/auth/login')}>
                    Go to sign in
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right side - Hero Image */}
          <div className="hidden lg:block relative bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
            {/* Logo Neaply en haut à droite */}
            <Link href="/" className="absolute top-8 right-8 z-20">
              <Image src="/images/neaply/logo-light.png" alt="Neaply Logo" width={120} height={40} priority />
            </Link>

            <div className="absolute inset-0">
              <img src="/images/hero.png" alt="Neaply Hero" className="w-full h-full object-cover" />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/40 to-blue-800/50"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="h-screen grid lg:grid-cols-2 font-aeonikpro overflow-hidden">
        {/* Left side - Form */}
        <div className="flex items-center justify-center bg-[#08080A] px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <div className="max-w-md w-full py-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-aeonikpro text-foreground">Create an account</h2>
              <p className="mt-2 text-sm text-muted-foreground">Join Neaply today</p>
            </div>

            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
                <CardDescription className="text-[#9DA2B3] font-aeonikpro">Create your account to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Message d'erreur */}
                {displayError && <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded">{displayError}</div>}

                {/* Boutons OAuth */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full border-1 border-secondary/10 hover:border-secondary/20"
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
                    variant="default"
                    className="w-full border-1 border-secondary/10 hover:border-secondary/20"
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
                    <span className="bg-[#08080A] px-2 text-[#9DA2B3] font-aeonikpro">Or create with email</span>
                  </div>
                </div>

                {/* Formulaire d'inscription */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#EDEFF7] font-aeonikpro">Full name</Label>
                    <Input
                          id="name"
                          name="name"
                          type="text"
                          className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#EDEFF7] font-aeonikpro">Email</Label>
                    <Input
                          id="email"
                          name="email"
                          type="email"
                          className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#EDEFF7] font-aeonikpro">Password</Label>
                    <Input
                          id="password"
                          name="password"
                          type="password"
                          className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#EDEFF7] font-aeonikpro">Confirm password</Label>
                    <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                    />
                  </div>

                  <Button type="submit" variant="outline" className="w-full border-1 border-secondary/10 hover:border-secondary/20"  disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create account'}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <span className="text-[#9DA2B3] font-aeonikpro">Already have an account? </span>
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="underline">
                    terms of service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline">
                    privacy policy
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Hero Image */}
        <div className="hidden lg:block relative bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
          {/* Logo Neaply en haut à droite */}
          <Link href="/" className="absolute top-8 right-8 z-20">
              <Image src="/images/neaply/logo-light.png" alt="Neaply Logo" width={120} height={40} priority />
            </Link>

          <div className="absolute inset-0">
            <img src="/images/hero.png" alt="Neaply Hero" className="w-full h-full object-cover" />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/40 to-blue-800/50"></div>
          </div>
        </div>
      </div>
    </>
  )
}
