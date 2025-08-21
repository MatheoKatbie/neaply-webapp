'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SellerFormData {
  storeName: string
  bio: string
  websiteUrl: string
  supportEmail: string
}

export default function BecomeSellerPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<SellerFormData>({
    storeName: '',
    bio: '',
    websiteUrl: '',
    supportEmail: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingProfile, setExistingProfile] = useState<any>(null)

  // Check if user already has a seller profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/seller')
        if (response.ok) {
          const data = await response.json()
          setExistingProfile(data.data)
          router.push('/dashboard/seller')
        }
      } catch (error) {
        // No existing profile, that's normal
      }
    }

    checkExistingProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const method = existingProfile ? 'PUT' : 'POST'
      const response = await fetch('/api/seller', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
      }

      setSuccess(true)
      // Rafraîchir les données utilisateur pour mettre à jour le statut seller
      await refreshUser()
      setTimeout(() => {
        router.push('/dashboard/seller')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/auth/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">
                {existingProfile ? 'Profile Updated!' : 'Welcome to FlowMarket!'}
              </CardTitle>
              <CardDescription className="text-center">
                {existingProfile
                  ? 'Your seller profile has been successfully updated'
                  : 'Your seller profile has been successfully created'}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  {existingProfile
                    ? 'Redirecting to your dashboard...'
                    : 'You can now start selling your workflows! Redirecting to your dashboard...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {existingProfile ? 'Edit Your Seller Profile' : 'Become a Seller on FlowMarket'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {existingProfile ? 'Update your store information' : 'Start selling your n8n workflows today'}
          </p>
        </div>

        {!existingProfile && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Upload Your Workflows</h3>
              <p className="text-sm text-gray-600">Share your n8n creations with the community</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Earn Money</h3>
              <p className="text-sm text-gray-600">Set your prices and receive instant payments</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Grow Your Audience</h3>
              <p className="text-sm text-gray-600">Build your reputation and customer base</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{existingProfile ? 'Your Store Information' : 'Store Setup'}</CardTitle>
            <CardDescription>
              {existingProfile
                ? 'Update your seller profile information'
                : 'Fill in this information to create your seller profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 border-red-200 bg-red-50 border px-4 py-3 rounded">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleInputChange}
                  placeholder="e.g., FlowAutomation Pro"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">
                  This name will be displayed on your public profile and workflows
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Store Description</Label>
                <textarea
                  id="bio"
                  name="bio"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Describe your expertise, specialties, and what customers can expect from your workflows..."
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-gray-500">{formData.bio.length}/500 characters. Help customers trust you.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website (optional)</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://yoursite.com"
                />
                <p className="text-xs text-gray-500">Add your website or portfolio to gain credibility</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email (optional)</Label>
                <Input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={handleInputChange}
                  placeholder="support@yoursite.com"
                />
                <p className="text-xs text-gray-500">Email for customers to contact you directly</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading
                    ? existingProfile
                      ? 'Updating...'
                      : 'Creating...'
                    : existingProfile
                    ? 'Update Profile'
                    : 'Create Store'}
                </Button>

                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>

            {!existingProfile && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  By creating your store, you agree to our{' '}
                  <Link href="/terms-sellers" className="underline hover:text-gray-700">
                    seller terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-gray-700">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
