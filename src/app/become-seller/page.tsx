'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CountrySelect from '@/components/ui/country-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInputComponent } from '@/components/ui/phone-input'
import { useAuth } from '@/hooks/useAuth'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SellerFormData {
  storeName: string
  bio: string
  websiteUrl: string
  supportEmail: string
  phoneNumber: string
  countryCode: string
}

interface ValidationErrors {
  storeName?: string
  bio?: string
  websiteUrl?: string
  supportEmail?: string
  phoneNumber?: string
  countryCode?: string
}

// Validation functions
const validateStoreName = (value: string): string | undefined => {
  if (!value) return 'Store name is required'
  if (value.length < 2) return 'Store name must be at least 2 characters'
  if (value.length > 50) return 'Store name cannot exceed 50 characters'
  return undefined
}

const validateBio = (value: string): string | undefined => {
  if (value && value.length < 10) return 'Bio must be at least 10 characters'
  if (value && value.length > 500) return 'Bio cannot exceed 500 characters'
  return undefined
}

const validateWebsiteUrl = (value: string): string | undefined => {
  if (!value) return undefined // Optional field
  try {
    new URL(value)
    return undefined
  } catch {
    return 'Website URL must be valid (e.g., https://example.com)'
  }
}

const validateSupportEmail = (value: string): string | undefined => {
  if (!value) return undefined // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) return 'Support email must be valid'
  return undefined
}

const validatePhoneNumber = (value: string): string | undefined => {
  if (!value) return undefined // Optional field
  if (value.length < 8) return 'Phone number must be at least 8 digits'
  if (value.length > 20) return 'Phone number cannot exceed 20 characters'
  return undefined
}

const validateCountryCode = (value: string): string | undefined => {
  if (!value) return 'Country is required'
  if (value.length < 2) return 'Country code is required and must be at least 2 characters'
  if (value.length > 3) return 'Country code cannot exceed 3 characters'
  return undefined
}

export default function BecomeSellerPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<SellerFormData>({
    storeName: '',
    bio: '',
    websiteUrl: '',
    supportEmail: '',
    phoneNumber: '',
    countryCode: 'FR',
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingProfile, setExistingProfile] = useState<any>(null)
  const [countrySelectOpen, setCountrySelectOpen] = useState(false)

  // Get default country (France)
  const defaultCountry = COUNTRIES.find((country) => country.value === 'FR') || COUNTRIES[0]

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

  // Real-time validation for optional fields
  useEffect(() => {
    // Phone number validation
    if (formData.phoneNumber) {
      const error = validatePhoneNumber(formData.phoneNumber)
      setValidationErrors((prev) => ({
        ...prev,
        phoneNumber: error,
      }))
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        phoneNumber: undefined,
      }))
    }
  }, [formData.phoneNumber])

  // Website URL validation
  useEffect(() => {
    if (formData.websiteUrl) {
      const error = validateWebsiteUrl(formData.websiteUrl)
      setValidationErrors((prev) => ({
        ...prev,
        websiteUrl: error,
      }))
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        websiteUrl: undefined,
      }))
    }
  }, [formData.websiteUrl])

  // Support email validation
  useEffect(() => {
    if (formData.supportEmail) {
      const error = validateSupportEmail(formData.supportEmail)
      setValidationErrors((prev) => ({
        ...prev,
        supportEmail: error,
      }))
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        supportEmail: undefined,
      }))
    }
  }, [formData.supportEmail])

  // Real-time validation function
  const validateField = (field: keyof SellerFormData, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'storeName':
        error = validateStoreName(value)
        break
      case 'bio':
        error = validateBio(value)
        break
      case 'websiteUrl':
        error = validateWebsiteUrl(value)
        break
      case 'supportEmail':
        error = validateSupportEmail(value)
        break
      case 'phoneNumber':
        error = validatePhoneNumber(value)
        break
      case 'countryCode':
        error = validateCountryCode(value)
        break
    }

    setValidationErrors((prev) => ({
      ...prev,
      [field]: error,
    }))

    return error
  }

  // Check if form is valid
  const isFormValid = () => {
    const requiredFields: (keyof SellerFormData)[] = ['storeName', 'countryCode']
    const hasRequiredErrors = requiredFields.some((field) => validationErrors[field])
    const hasAnyErrors = Object.values(validationErrors).some((error) => error)

    return !hasRequiredErrors && !hasAnyErrors && formData.storeName.trim() !== ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields before submission
    const errors: ValidationErrors = {}
    Object.keys(formData).forEach((key) => {
      const field = key as keyof SellerFormData
      const error = validateField(field, formData[field])
      if (error) errors[field] = error
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

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
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user starts typing
    if (validationErrors[name as keyof SellerFormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    validateField(name as keyof SellerFormData, value)
  }

  const handleCountryChange = (countryCode: string) => {
    setFormData((prev) => ({ ...prev, countryCode }))
    validateField('countryCode', countryCode)
  }

  const handleCountryToggle = () => {
    setCountrySelectOpen(!countrySelectOpen)
  }

  // Get current selected country
  const selectedCountry = COUNTRIES.find((country) => country.value === formData.countryCode) || defaultCountry

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
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">
                {existingProfile ? 'Profile Updated!' : 'Welcome to Flow Market!'}
              </CardTitle>
              <CardDescription className="text-center">
                {existingProfile
                  ? 'Your creator profile has been successfully updated'
                  : 'Your creator profile has been successfully created'}
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
                <p className="text-sm text-muted-foreground">
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
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {existingProfile ? 'Edit Your Seller Profile' : 'Become a Seller on Flow Market'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {existingProfile ? 'Update your store information' : 'Start selling your n8n workflows today'}
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Benefits & Information */}
          <div className="space-y-6">
            {!existingProfile && (
              <>
                {/* Benefits Section */}
                <Card className="bg-gradient-to-br bg-background/90">
                  <CardHeader>
                    <CardTitle className="text-2xl">Why Create on FlowMarket?</CardTitle>
                    <CardDescription className="">
                      Join thousands of creators monetizing their n8n workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Upload Your Workflows</h3>
                        <p className="">Share your n8n creations with the community</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Earn Money</h3>
                        <p className="">Set your prices and receive instant payments</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Grow Your Audience</h3>
                        <p className="">Build your reputation and customer base</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Trust Indicators */}
            <Card className="bg-background border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Secure & Trusted</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>SSL encrypted payments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant payouts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">{existingProfile ? 'Your Store Information' : 'Store Setup'}</CardTitle>
                <CardDescription>
                  {existingProfile
                    ? 'Update your creator profile information'
                    : 'Fill in this information to create your creator profile'}
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
                      onBlur={handleInputBlur}
                      placeholder="e.g., FlowAutomation Pro"
                      maxLength={50}
                      className={validationErrors.storeName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {validationErrors.storeName ? (
                      <p className="text-xs text-red-600">{validationErrors.storeName}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formData.storeName.length}/50 characters (min. 2). This name will be displayed on your public
                        profile and workflows.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Store Description</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${validationErrors.bio ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      value={formData.bio}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Describe your expertise, specialties, and what customers can expect from your workflows..."
                      maxLength={500}
                      rows={4}
                    />
                    {validationErrors.bio ? (
                      <p className="text-xs text-red-600">{validationErrors.bio}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formData.bio.length}/500 characters (min. 10). Help customers trust you.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website (optional)</Label>
                      <Input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        value={formData.websiteUrl}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="https://yoursite.com"
                        className={validationErrors.websiteUrl ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {validationErrors.websiteUrl ? (
                        <p className="text-xs text-red-600">{validationErrors.websiteUrl}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Add your website to gain credibility</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email (optional)</Label>
                      <Input
                        id="supportEmail"
                        name="supportEmail"
                        type="email"
                        value={formData.supportEmail}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="support@yoursite.com"
                        className={validationErrors.supportEmail ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {validationErrors.supportEmail ? (
                        <p className="text-xs text-red-600">{validationErrors.supportEmail}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Email for customer support</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                      <PhoneInputComponent
                        value={formData.phoneNumber}
                        onChange={(value) => {
                          setFormData((prev) => ({ ...prev, phoneNumber: value || '' }))
                        }}
                        placeholder="Enter your phone number"
                      />
                      {validationErrors.phoneNumber ? (
                        <p className="text-xs text-red-600">{validationErrors.phoneNumber}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {formData.phoneNumber
                            ? `${formData.phoneNumber.replace(/\D/g, '').length} digits (min. 8)`
                            : '0 digits (min. 8)'}{' '}
                          - Phone for business communication
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="countryCode">Country *</Label>
                      <CountrySelect
                        id="countryCode"
                        open={countrySelectOpen}
                        disabled={false}
                        onToggle={handleCountryToggle}
                        onChange={handleCountryChange}
                        selectedValue={selectedCountry}
                      />
                      {validationErrors.countryCode && (
                        <p className="text-xs text-red-600">{validationErrors.countryCode}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Your business location</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button type="submit" className="flex-1" disabled={isLoading || !isFormValid()}>
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
                    <p className="text-xs text-muted-foreground text-center">
                      By creating your store, you agree to our{' '}
                      <Link href="/terms-sellers" className="underline hover:text-muted-foreground">
                        seller terms
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="underline hover:text-muted-foreground">
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
      </div>
    </div>
  )
}
