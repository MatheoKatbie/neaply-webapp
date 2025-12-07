'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ResetPasswordPage() {
    const { resetPassword, error: globalError, clearError } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)
    const [resendCountdown, setResendCountdown] = useState(0)
    const [resendSuccess, setResendSuccess] = useState(false)

    // États pour le formulaire de nouveau mot de passe
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isResetMode, setIsResetMode] = useState(false)
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false)

    // Détecter si on arrive avec les paramètres de reset password
    useEffect(() => {
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        if (accessToken && refreshToken && type === 'recovery') {
            // On arrive avec un token de reset password
            setIsResetMode(true)
            // Définir la session avec les tokens reçus
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            })
        }
    }, [searchParams])

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCountdown <= 0) return

        const timer = setInterval(() => {
            setResendCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [resendCountdown])

    // Clear global error when component mounts and use only local errors
    useEffect(() => {
        clearError()
    }, [clearError])

    // Use only local error, ignore global error completely
    const displayError = localError

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setLocalError(null) // Clear local error when starting new reset attempt

        try {
            const { error } = await resetPassword(email)
            if (error) {
                setLocalError(error)
                return
            }
            if (!error) {
                setEmailSent(true)
                setResendCountdown(60) // Start 60 second countdown
                setResendSuccess(false)
            }
        } catch (err) {
            console.error('Reset request error:', err)
            setLocalError('An error occurred while sending the reset email')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendEmail = async () => {
        setIsLoading(true)
        setResendSuccess(false)

        try {
            const { error } = await resetPassword(email)
            if (error) {
                setLocalError(error)
            } else {
                setResendSuccess(true)
                setResendCountdown(60) // Restart 60 second countdown
            }
        } catch (err) {
            console.error('Resend error:', err)
            setLocalError('An error occurred while resending the email')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setLocalError(null)

        if (newPassword !== confirmPassword) {
            setLocalError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setLocalError('Password must be at least 6 characters long')
            setIsLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                setLocalError(error.message)
            } else {
                setPasswordResetSuccess(true)
                // Rediriger vers la page de connexion après 3 secondes
                setTimeout(() => {
                    router.push('/auth/login?message=password_reset_success')
                }, 3000)
            }
        } catch (err) {
            console.error('Password reset error:', err)
            setLocalError('An error occurred while updating your password')
        } finally {
            setIsLoading(false)
        }
    }

    // Afficher le formulaire de nouveau mot de passe si on arrive avec un token de reset
    if (isResetMode) {
        if (passwordResetSuccess) {
            return (
                <div className="min-h-screen bg-[#08080A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-aeonikpro">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-aeonikpro text-[#EDEFF7]">Password updated!</h2>
                            <p className="mt-2 text-sm text-[#9DA2B3] font-aeonikpro">
                                Your password has been successfully updated.
                            </p>
                        </div>

                        <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                            <CardContent className="space-y-6 pt-6">
                                <div className="text-center p-6 bg-green-500/10 border border-green-500/50 rounded-lg">
                                    <svg
                                        className="mx-auto h-12 w-12 text-green-400 mb-4"
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
                                        You will be redirected to the sign-in page in a few seconds...
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-[#08080A] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto font-aeonikpro">
                <div className="max-w-md w-full py-8">
                    <div className="text-center mb-6 flex items-center flex-col justify-center gap-2">
                        <Link href="/" className="">
                            <Image
                                src="/images/neaply/logo-light.png"
                                alt="Neaply"
                                width={120}
                                height={40}
                                className="h-10 w-auto mb-4"
                            />
                        </Link>
                        <h2 className="text-3xl font-aeonikpro text-[#EDEFF7]">Set new password</h2>
                        <p className="mt-2 text-sm text-[#9DA2B3] font-aeonikpro">
                            Enter your new password below
                        </p>
                    </div>

                    <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                        <CardHeader>
                            <CardTitle className="text-[#EDEFF7] font-aeonikpro">New password</CardTitle>
                            <CardDescription className="text-[#9DA2B3] font-aeonikpro">
                                Choose a secure password for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {displayError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                                    {displayError}
                                </div>
                            )}

                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-[#EDEFF7] font-aeonikpro">New password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter your new password"
                                        className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-[#EDEFF7] font-aeonikpro">Confirm new password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password"
                                        className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating password...' : 'Update password'}
                                </Button>
                            </form>

                            <div className="text-center text-sm">
                                <Link
                                    href="/auth/login"
                                    className="font-aeonikpro text-[#9DA2B3] hover:text-[#EDEFF7] flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (emailSent) {
        return (
            <div className="min-h-screen bg-[#08080A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-aeonikpro">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-aeonikpro text-[#EDEFF7]">Email sent!</h2>
                        <p className="mt-2 text-sm text-[#9DA2B3] font-aeonikpro">
                            Check your email inbox
                        </p>
                    </div>

                    <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                        <CardContent className="space-y-6 pt-6">
                            {resendSuccess && (
                                <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded">
                                    Email resent successfully! Check your inbox.
                                </div>
                            )}

                            {displayError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                                    {displayError}
                                </div>
                            )}

                            <div className="text-center p-6 bg-green-500/10 border border-green-500/50 rounded-lg">
                                <svg
                                    className="mx-auto h-12 w-12 text-green-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="text-sm text-[#9DA2B3] font-aeonikpro">
                                    An email with instructions to reset your password has been sent to{' '}
                                    <strong className="text-[#EDEFF7]">{email}</strong>.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-black text-white hover:bg-gray-800 font-aeonikpro"
                                    onClick={handleResendEmail}
                                    disabled={isLoading || resendCountdown > 0}
                                >
                                    {resendCountdown > 0 
                                        ? `Resend email (${resendCountdown}s)` 
                                        : 'Resend email'}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full font-aeonikpro"
                                    onClick={() => router.push('/auth/login')}
                                >
                                    Back to sign in
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#08080A] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto font-aeonikpro">
            <div className="max-w-md w-full py-8">
  
                <div className="text-center mb-6 flex items-center flex-col justify-center gap-2">
                <Link href="/" className="">
                <Image
                        src="/images/neaply/logo-light.png"
                        alt="Neaply"
                        width={120}
                        height={40}
                        className="h-10 w-auto mb-4"
                    />
                    </Link>
                    <h2 className="text-3xl font-aeonikpro text-[#EDEFF7]">Forgot password?</h2>
                    <p className="mt-2 text-sm text-[#9DA2B3] font-aeonikpro">
                        Enter your email to receive a reset link
                    </p>
                </div>

                <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                    <CardHeader>
                        <CardTitle className="text-[#EDEFF7] font-aeonikpro">Reset password</CardTitle>
                        <CardDescription className="text-[#9DA2B3] font-aeonikpro">
                            We'll send you an email with instructions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Message d'erreur */}
                        {displayError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                                {displayError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#EDEFF7] font-aeonikpro">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send link'}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            <Link
                                href="/auth/login"
                                className="font-aeonikpro text-[#9DA2B3] hover:text-[#EDEFF7] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
