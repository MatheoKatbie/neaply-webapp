'use client'

import { Button } from '@/components/ui/button'
import CountrySelect from '@/components/ui/country-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInputComponent } from '@/components/ui/phone-input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SellerFormData {
  storeName: string
  bio: string
  phoneNumber: string
  countryCode: string
}

interface ValidationErrors {
  storeName?: string
  bio?: string
  phoneNumber?: string
  countryCode?: string
}

// Validation functions
const validateStoreName = (value: string, t: (key: string) => string): string | undefined => {
  if (!value) return t('becomeSeller.validation.storeNameRequired')
  if (value.length < 2) return t('becomeSeller.validation.storeNameMin')
  if (value.length > 50) return t('becomeSeller.validation.storeNameMax')
  return undefined
}

const validateBio = (value: string, t: (key: string) => string): string | undefined => {
  if (!value) return t('becomeSeller.validation.bioRequired')
  if (value.length < 10) return t('becomeSeller.validation.bioMin')
  if (value.length > 500) return t('becomeSeller.validation.bioMax')
  return undefined
}

const validatePhoneNumber = (value: string, t: (key: string) => string): string | undefined => {
  if (!value) return undefined // Optional field
  if (value.length < 8) return t('becomeSeller.validation.phoneMin')
  if (value.length > 20) return t('becomeSeller.validation.phoneMax')
  return undefined
}

const validateCountryCode = (value: string, t: (key: string) => string): string | undefined => {
  if (!value) return t('becomeSeller.validation.countryRequired')
  if (value.length < 2) return t('becomeSeller.validation.countryMin')
  if (value.length > 3) return t('becomeSeller.validation.countryMax')
  return undefined
}

export default function BecomeSellerPage() {
  const { user, loading, refreshUser } = useAuth()
  const { t, locale } = useTranslation()
  const router = useRouter()

  const [formData, setFormData] = useState<SellerFormData>({
    storeName: '',
    bio: '',
    phoneNumber: '',
    countryCode: 'US',
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingProfile, setExistingProfile] = useState<any>(null)
  const [countrySelectOpen, setCountrySelectOpen] = useState(false)

  // Get default country (US)
  const defaultCountry = COUNTRIES.find((country) => country.value === 'US') || COUNTRIES[0]

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

  // Real-time validation for bio field
  useEffect(() => {
    if (formData.bio) {
      const error = validateBio(formData.bio, t)
      setValidationErrors((prev) => ({
        ...prev,
        bio: error,
      }))
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        bio: undefined,
      }))
    }
  }, [formData.bio, t])

  // Real-time validation for optional fields
  useEffect(() => {
    // Phone number validation
    if (formData.phoneNumber) {
      const error = validatePhoneNumber(formData.phoneNumber, t)
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
  }, [formData.phoneNumber, t])

  // Real-time validation function
  const validateField = (field: keyof SellerFormData, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'storeName':
        error = validateStoreName(value, t)
        break
      case 'bio':
        error = validateBio(value, t)
        break

      case 'phoneNumber':
        error = validatePhoneNumber(value, t)
        break
      case 'countryCode':
        error = validateCountryCode(value, t)
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
    const requiredFields: (keyof SellerFormData)[] = ['storeName', 'bio', 'countryCode']
    const hasRequiredErrors = requiredFields.some((field) => validationErrors[field])
    const hasAnyErrors = Object.values(validationErrors).some((error) => error)

    return !hasRequiredErrors && !hasAnyErrors && formData.storeName.trim() !== '' && formData.bio.trim() !== ''
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

      // If this is a new seller profile, automatically create Stripe Connect account
      if (!existingProfile && data.data) {
        try {
          // Create Stripe Connect account with pre-filled business profile
          const stripeResponse = await fetch('/api/stripe/create-seller', {
            method: 'POST',
          })

          if (stripeResponse.ok) {
            const stripeData = await stripeResponse.json()

            // Redirect directly to pre-filled Stripe onboarding
            window.location.href = stripeData.url
            return // Exit early, don't show success message
          } else {
            // If Stripe creation fails, still show success but with warning
            console.warn('Stripe account creation failed, but seller profile was created')
          }
        } catch (stripeError) {
          // If Stripe creation fails, still show success but with warning
          console.warn('Stripe account creation failed:', stripeError)
        }
      }

      setSuccess(true)
      // Refresh user data to update seller status
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
      <div className="min-h-screen flex items-center justify-center bg-[#08080A]">
        <div className="animate-pulse text-[#EDEFF7]">Loading...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080A] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-2xl border border-[#9DA2B3]/25 bg-[rgba(64,66,77,0.25)] p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
                <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-aeonikpro text-2xl font-bold text-[#EDEFF7] mb-2">
                {existingProfile ? 'Profile updated!' : 'Welcome to the seller community!'}
              </h2>
              <p className="font-aeonikpro text-[#9DA2B3] text-sm mb-4">
                {existingProfile
                  ? 'Your seller profile has been successfully updated.'
                  : 'Your seller profile has been created. Redirecting to your dashboard...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#08080A]" style={{ backgroundColor: '#08080A' }}>
      {/* Decorative ellipses for ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bottom ellipses */}
        <div
          className="absolute rounded-full"
          style={{
            left: '-471px',
            bottom: '400px',
            width: '639px',
            height: '639px',
            backgroundColor: '#7899A8',
            opacity: 0.35,
            filter: 'blur(350px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            right: '-471px',
            bottom: '400px',
            width: '639px',
            height: '639px',
            backgroundColor: '#7899A8',
            opacity: 0.35,
            filter: 'blur(350px)',
          }}
        />
      </div>

      {/* Content with higher z-index */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-visible pt-[140px] md:pt-[170px] pb-32">
          {/* Small decorative ellipses */}
          <div
            className="absolute rounded-full"
            style={{
              right: '-200px',
              top: '600px',
              width: '300px',
              height: '300px',
              backgroundColor: '#7899A8',
              opacity: 0.3,
              filter: 'blur(150px)',
              zIndex: 1,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: '-150px',
              top: '0px',
              width: '350px',
              height: '350px',
              backgroundColor: '#7899A8',
              opacity: 0.3,
              filter: 'blur(150px)',
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-white">
                <p className="font-aeonikpro text-[#BCBFCC] text-[16px] md:text-[18px] mb-4">
                  Build Your Business
                </p>

                {/* Main Heading */}
                <h1 className="font-aeonikpro text-3xl md:text-4xl lg:text-5xl xl:text-[64px] text-[#EDEFF7] leading-tight lg:leading-[1.2] tracking-tight mb-6">
                  Become a Seller
                  <br />
                  on neaply
                </h1>

                {/* Subheading */}
                <p className="font-aeonikpro text-[18px] md:text-[20px] text-[#D3D6E0] mb-8 max-w-xl leading-relaxed">
                  Turn your automation expertise into revenue. Sell your n8n workflows to thousands of businesses worldwide and earn recurring income.
                </p>

                {/* Key Benefits */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-aeonikpro text-[#BCBFCC]">Reach a global audience of automation professionals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-aeonikpro text-[#BCBFCC]">Set your own prices and earn recurring revenue</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-aeonikpro text-[#BCBFCC]">Get paid securely through Stripe Connect</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="relative">
                <div
                  className="rounded-2xl border border-[#9DA2B3]/25 p-8 backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(64, 66, 77, 0.25)' }}
                >
                  <h2 className="font-aeonikpro text-2xl font-bold text-[#EDEFF7] mb-2">
                    {existingProfile ? 'Update Store Information' : 'Create Your Store'}
                  </h2>
                  <p className="font-aeonikpro text-[#9DA2B3] text-sm mb-6">
                    {existingProfile
                      ? 'Update your store details'
                      : 'Tell us about your store and the workflows you plan to sell'}
                  </p>

                  {error && (
                    <div className="mb-6 border border-red-500/50 bg-red-500/10 px-4 py-3 rounded-lg">
                      <div className="text-red-400 text-sm font-aeonikpro">{error}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName" className="font-aeonikpro text-[#EDEFF7]">
                        Store Name *
                      </Label>
                      <Input
                        id="storeName"
                        name="storeName"
                        type="text"
                        required
                        value={formData.storeName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="Your Store Name"
                        maxLength={50}
                        className={`bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro ${
                          validationErrors.storeName ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {validationErrors.storeName ? (
                        <p className="text-xs text-red-400 font-aeonikpro">{validationErrors.storeName}</p>
                      ) : (
                        <p className="text-xs text-[#9DA2B3] font-aeonikpro">
                          {formData.storeName.length}/50 characters (min. 2)
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-aeonikpro text-[#EDEFF7]">
                        Store Description *
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        required
                        className={`h-24 bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3]/50 font-aeonikpro resize-none ${
                          validationErrors.bio ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        value={formData.bio}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="Describe your store and expertise..."
                        maxLength={500}
                        rows={4}
                      />
                      {validationErrors.bio ? (
                        <p className="text-xs text-red-400 font-aeonikpro">{validationErrors.bio}</p>
                      ) : (
                        <p className="text-xs text-[#9DA2B3] font-aeonikpro">
                          {formData.bio.length}/500 characters (min. 10, required)
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="font-aeonikpro text-[#EDEFF7]">
                          Phone Number
                        </Label>
                        <PhoneInputComponent
                          value={formData.phoneNumber}
                          onChange={(value) => {
                            setFormData((prev) => ({ ...prev, phoneNumber: value || '' }))
                          }}
                          placeholder="Enter your phone number"
                          defaultCountry={formData.countryCode}
                          disableCountrySelect={true}
                        />
                        {validationErrors.phoneNumber ? (
                          <p className="text-xs text-red-400 font-aeonikpro">{validationErrors.phoneNumber}</p>
                        ) : (
                          <p className="text-xs text-[#9DA2B3] font-aeonikpro">
                            {formData.phoneNumber
                              ? `${formData.phoneNumber.replace(/\D/g, '').length} digits (min. 8)`
                              : '0 digits (min. 8)'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="countryCode" className="font-aeonikpro text-[#EDEFF7]">
                          Country *
                        </Label>
                        <CountrySelect
                          id="countryCode"
                          open={countrySelectOpen}
                          disabled={false}
                          onToggle={handleCountryToggle}
                          onChange={handleCountryChange}
                          selectedValue={selectedCountry}
                        />
                        {validationErrors.countryCode && (
                          <p className="text-xs text-red-400 font-aeonikpro">{validationErrors.countryCode}</p>
                        )}
                        <p className="text-xs text-[#9DA2B3] font-aeonikpro">Where your bank account is located</p>
                      </div>
                    </div>

                    {/* Important warning about bank account */}
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/25 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <svg
                          className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-orange-300 font-aeonikpro">Important</p>
                          <p className="text-xs text-orange-200 mt-1 font-aeonikpro">
                            You must have a bank account in your selected country to receive payments.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Connect Info */}
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <svg
                          className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-300 font-aeonikpro">Stripe Connect</p>
                          <p className="text-xs text-blue-200 mt-1 font-aeonikpro">
                            After creating your store, you'll set up Stripe payments to start selling.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 font-aeonikpro bg-white text-black hover:bg-[#40424D]/30 disabled:opacity-50"
                        disabled={isLoading || !isFormValid()}
                      >
                        {isLoading
                          ? existingProfile
                            ? 'Updating...'
                            : 'Creating Store...'
                          : existingProfile
                          ? 'Update Store'
                          : 'Create Store'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="font-aeonikpro border-[#9DA2B3]/25 text-[#EDEFF7] hover:bg-[#1E1E24]"
                        onClick={() => router.back()}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>

                  {!existingProfile && (
                    <div className="mt-6 pt-6 border-t border-[#9DA2B3]/25">
                      <p className="text-xs text-[#9DA2B3] text-center font-aeonikpro">
                        By creating a store, you agree to our{' '}
                        <Link href="/terms-sellers" className="underline hover:text-[#BCBFCC]">
                          Seller Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-[#BCBFCC]">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
