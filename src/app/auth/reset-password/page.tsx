'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
    const { resetPassword, error } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await resetPassword(email)
            if (!error) {
                setEmailSent(true)
            }
        } catch (err) {
            console.error('Reset request error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-green-600">
                                Email sent!
                            </CardTitle>
                            <CardDescription className="text-center">
                                Check your email inbox
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-6 bg-green-50 rounded-lg">
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
                                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="text-sm text-gray-600">
                                    An email with instructions to reset your password has been sent to{' '}
                                    <strong>{email}</strong>.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => router.push('/auth/login')}
                            >
                                Back to sign in
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Forgot password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email to receive a reset link
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reset password</CardTitle>
                        <CardDescription>
                            We'll send you an email with instructions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Message d'erreur */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
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
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                ← Back to sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
