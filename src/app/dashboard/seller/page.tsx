'use client'

import { useAuth } from '@/hooks/useAuth'
import { useFormValidation, type WorkflowFormData } from '@/hooks/useFormValidation'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { SellerAnalytics } from '@/components/ui/seller-analytics'
import { SellerPayouts } from '@/components/ui/seller-payouts'
import { StripeSetupCard } from '@/components/ui/stripe-setup-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SellerDashboardSkeleton } from '@/components/seller/SellerDashboardSkeleton'
import { SellerOverviewTab } from '@/components/seller/SellerOverviewTab'
import { SellerWorkflowsTab } from '@/components/seller/SellerWorkflowsTab'
import { StoreCustomization } from '@/components/seller/StoreCustomization'
import type { Category, Tag, Workflow } from '@/types/workflow'

import { Button } from '@/components/ui/button'

interface SellerProfileData {
  storeName: string
  storeSlug: string
  logoUrl: string | null
  bannerUrl: string | null
}

interface CurrentMonthEarnings {
  totalGross: number
  totalFees: number
  totalNet: number
  currency: string
  salesCount: number
}

export default function SellerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [tagsLoading, setTagsLoading] = useState(false)
  const [formData, setFormData] = useState<WorkflowFormData>({
    title: '',
    shortDesc: '',
    longDescMd: '',
    heroImageUrl: '',
    heroImageFile: undefined,
    documentationUrl: '',
    documentationFile: undefined,
    basePriceCents: 0, // $0.00 default (free)
    currency: 'USD',
    status: 'draft',
    platform: '',
    jsonContent: undefined,
    jsonFile: undefined,
    n8nMinVersion: '',
    n8nMaxVersion: '',
    zapierMinVersion: '',
    zapierMaxVersion: '',
    makeMinVersion: '',
    makeMaxVersion: '',
    airtableScriptMinVersion: '',
    airtableScriptMaxVersion: '',
    categoryIds: [],
    tagIds: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingDocumentation, setUploadingDocumentation] = useState(false)
  const [loadingWorkflowData, setLoadingWorkflowData] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<{
    hasStripeAccount: boolean
    onboardingCompleted: boolean
  } | null>(null)
  const [expressDashboardUrl, setExpressDashboardUrl] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [currentMonthEarnings, setCurrentMonthEarnings] = useState<CurrentMonthEarnings | null>(null)
  const [balance, setBalance] = useState<{
    available: number
    pending: number
    total: number
    currency: string
  } | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [sellerProfile, setSellerProfile] = useState<SellerProfileData | null>(null)

  const [analyticsOverview, setAnalyticsOverview] = useState<{
    totalWorkflows: number
    totalPacks: number
    totalFavorites: number
    totalRevenueCents: number
    totalSales: number
  } | null>(null)

  // Initialize validation hook
  const {
    errors,
    touched,
    validateField,
    validateForm,
    markFieldAsTouched,
    getFieldError,
    isFormValid,
    resetTouchedState,
  } = useFormValidation(formData)

  // Redirect if not a seller
  useEffect(() => {
    if (!loading && (!user || !user.isSeller)) {
      router.push('/become-seller')
    }
  }, [user, loading, router])

  // Check Stripe Connect status
  const fetchStripeStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/connect')
      if (response.ok) {
        const data = await response.json()
        setStripeStatus({
          hasStripeAccount: !!data.data?.stripeAccountId,
          onboardingCompleted: !!data.data?.onboardingCompleted,
        })
        if (data.data?.expressDashboardUrl) {
          setExpressDashboardUrl(data.data.expressDashboardUrl)
        }
      }
    } catch (error) {
      console.error('Failed to fetch Stripe status:', error)
    }
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceLoading(true)
      const response = await fetch('/api/stripe/seller/payouts')
      if (response.ok) {
        const data = await response.json()
        if (data.data?.balance && data.data?.summary?.currency) {
          setBalance({
            ...data.data.balance,
            currency: data.data.summary.currency,
          })
        } else if (data.data?.balance) {
          // Fallback if no currency in summary
          setBalance({
            ...data.data.balance,
            currency: 'USD',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    } finally {
      setBalanceLoading(false)
    }
  }, [])

  // Fetch workflows
  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/workflows')

      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }

      const data = await response.json()
      const workflows = data.data || []

      setWorkflows(workflows)
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to load workflows', {
        description: err.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data.data || [])
    } catch (err: any) {
      console.error('Failed to fetch categories:', err.message)
      toast.error('Failed to load categories', {
        description: 'Categories will be loaded when you create a workflow.',
      })
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  // Fetch tags
  const fetchTags = useCallback(async () => {
    try {
      setTagsLoading(true)
      const response = await fetch('/api/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      const data = await response.json()
      setTags(data.data || [])
    } catch (err: any) {
      console.error('Failed to fetch tags:', err.message)
      toast.error('Failed to load tags', {
        description: 'Tags will be loaded when you create a workflow.',
      })
    } finally {
      setTagsLoading(false)
    }
  }, [])

  // Fetch seller profile for store customization
  const fetchSellerProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/seller')
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setSellerProfile({
            storeName: data.data.storeName,
            storeSlug: data.data.slug,
            logoUrl: data.data.logoUrl,
            bannerUrl: data.data.bannerUrl,
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch seller profile:', error)
    }
  }, [])

  // Fetch analytics overview (includes packs + workflows)
  const fetchAnalyticsOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/seller/analytics?months=12`)
      if (!res.ok) return
      const json = await res.json()
      if (json?.data?.overview) {
        setAnalyticsOverview(json.data.overview)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Fetch current month earnings
  const fetchCurrentMonthEarnings = useCallback(async () => {
    try {
      const res = await fetch('/api/seller/current-month-earnings')
      if (!res.ok) return
      const json = await res.json()
      if (json?.data?.currentMonth) {
        setCurrentMonthEarnings(json.data.currentMonth)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Handle See Payouts click
  const handleSeePayoutsClick = () => {
    if (expressDashboardUrl) {
      window.open(expressDashboardUrl, '_blank')
    } else if (stripeStatus?.hasStripeAccount) {
      // If account exists but no Express URL, redirect to onboarding
      window.open('/dashboard/stripe/connect', '_blank')
    } else {
      // No account at all, start the setup process
      window.open('/dashboard/stripe/connect', '_blank')
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  useEffect(() => {
    if (user?.isSeller) {
      fetchWorkflows()
      fetchCategories()
      fetchTags()
      fetchAnalyticsOverview()
      fetchCurrentMonthEarnings()
      fetchStripeStatus()
      fetchBalance()
      fetchSellerProfile()
    }
  }, [
    user?.isSeller,
    fetchWorkflows,
    fetchCategories,
    fetchTags,
    fetchAnalyticsOverview,
    fetchCurrentMonthEarnings,
    fetchStripeStatus,
    fetchBalance,
    fetchSellerProfile,
  ])

  // Show tooltip when user has no workflows and Stripe is configured
  useEffect(() => {
    if (workflows.length === 0 && stripeStatus?.hasStripeAccount && stripeStatus?.onboardingCompleted) {
      const timer = setTimeout(() => {
        setShowTooltip(true)
      }, 500) // Show tooltip after .5 seconds

      return () => clearTimeout(timer)
    } else {
      setShowTooltip(false)
    }
  }, [workflows.length, stripeStatus])

  // Force validation when documentation file changes
  useEffect(() => {
    if (touched.documentationUrl) {
      validateField('documentationUrl', formData.documentationUrl)
    }
  }, [formData.documentationFile, formData.documentationUrl, touched.documentationUrl, validateField])

  // Force validation when editing workflow with existing documentation
  useEffect(() => {
    if (editingWorkflow && formData.documentationUrl && !formData.documentationFile) {
      markFieldAsTouched('documentationUrl')
      validateField('documentationUrl', formData.documentationUrl)
    }
  }, [editingWorkflow, formData.documentationUrl, formData.documentationFile, markFieldAsTouched, validateField])

  // Force validation when n8n versions change
  useEffect(() => {
    if (touched.n8nMinVersion || touched.n8nMaxVersion) {
      validateField('n8nMinVersion', formData.n8nMinVersion)
      validateField('n8nMaxVersion', formData.n8nMaxVersion)
    }
  }, [formData.n8nMinVersion, formData.n8nMaxVersion, touched.n8nMinVersion, touched.n8nMaxVersion, validateField])

  // Force validation when editing workflow with existing n8n versions
  useEffect(() => {
    if (editingWorkflow && formData.n8nMinVersion && formData.n8nMaxVersion) {
      markFieldAsTouched('n8nMaxVersion')
      validateField('n8nMaxVersion', formData.n8nMaxVersion)
    }
  }, [editingWorkflow, formData.n8nMinVersion, formData.n8nMaxVersion, markFieldAsTouched, validateField])

  // Force validation when zapier versions change
  useEffect(() => {
    if (touched.zapierMinVersion || touched.zapierMaxVersion) {
      validateField('zapierMinVersion', formData.zapierMinVersion)
      validateField('zapierMaxVersion', formData.zapierMaxVersion)
    }
  }, [
    formData.zapierMinVersion,
    formData.zapierMaxVersion,
    touched.zapierMinVersion,
    touched.zapierMaxVersion,
    validateField,
  ])

  // Force validation when editing workflow with existing zapier versions
  useEffect(() => {
    if (editingWorkflow && formData.zapierMinVersion && formData.zapierMaxVersion) {
      markFieldAsTouched('zapierMaxVersion')
      validateField('zapierMaxVersion', formData.zapierMaxVersion)
    }
  }, [editingWorkflow, formData.zapierMinVersion, formData.zapierMaxVersion, markFieldAsTouched, validateField])

  // Force validation when make versions change
  useEffect(() => {
    if (touched.makeMinVersion || touched.makeMaxVersion) {
      validateField('makeMinVersion', formData.makeMinVersion)
      validateField('makeMaxVersion', formData.makeMaxVersion)
    }
  }, [formData.makeMinVersion, formData.makeMaxVersion, touched.makeMinVersion, touched.makeMaxVersion, validateField])

  // Force validation when editing workflow with existing make versions
  useEffect(() => {
    if (editingWorkflow && formData.makeMinVersion && formData.makeMaxVersion) {
      markFieldAsTouched('makeMaxVersion')
      validateField('makeMaxVersion', formData.makeMaxVersion)
    }
  }, [editingWorkflow, formData.makeMinVersion, formData.makeMaxVersion, markFieldAsTouched, validateField])

  // Force validation when airtable script versions change
  useEffect(() => {
    if (touched.airtableScriptMinVersion || touched.airtableScriptMaxVersion) {
      validateField('airtableScriptMinVersion', formData.airtableScriptMinVersion)
      validateField('airtableScriptMaxVersion', formData.airtableScriptMaxVersion)
    }
  }, [
    formData.airtableScriptMinVersion,
    formData.airtableScriptMaxVersion,
    touched.airtableScriptMinVersion,
    touched.airtableScriptMaxVersion,
    validateField,
  ])

  // Force validation when editing workflow with existing airtable script versions
  useEffect(() => {
    if (editingWorkflow && formData.airtableScriptMinVersion && formData.airtableScriptMaxVersion) {
      markFieldAsTouched('airtableScriptMaxVersion')
      validateField('airtableScriptMaxVersion', formData.airtableScriptMaxVersion)
    }
  }, [
    editingWorkflow,
    formData.airtableScriptMinVersion,
    formData.airtableScriptMaxVersion,
    markFieldAsTouched,
    validateField,
  ])

  // Helper function to delete image from bucket
  const deleteImageFromBucket = async (imageUrl: string) => {
    try {
      if (!imageUrl || imageUrl.startsWith('blob:')) return

      const url = new URL(imageUrl)
      const fileName = url.pathname.split('/').pop()

      if (fileName && fileName.includes(user?.id || '')) {
        await fetch(`/api/upload/hero-image?fileName=${fileName}`, {
          method: 'DELETE',
        })
      }
    } catch (error) {
      console.warn('Failed to delete image from bucket:', error)
    }
  }

  // Helper function to delete documentation from bucket
  const deleteDocumentationFromBucket = async (documentationUrl: string) => {
    try {
      if (!documentationUrl || documentationUrl.startsWith('blob:')) return

      const url = new URL(documentationUrl)
      const fileName = url.pathname.split('/').pop()

      if (fileName && fileName.includes(user?.id || '')) {
        await fetch(`/api/upload/documentation`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName }),
        })
      }
    } catch (error) {
      console.warn('Failed to delete documentation from bucket:', error)
    }
  }

  // Helper function to check if image exists and clean up if not
  const checkAndCleanImageUrl = async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl || imageUrl.startsWith('blob:')) return imageUrl

    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (response.ok) {
        return imageUrl
      } else {
        console.warn('Image not found, cleaning up URL:', imageUrl)
        return null
      }
    } catch (error) {
      console.warn('Error checking image:', error)
      return null
    }
  }

  // Helper function to update workflow in database
  const updateWorkflowThumbnail = async (workflowId: string, thumbnailUrl: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heroImageUrl: thumbnailUrl || '',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update workflow')
      }

      return true
    } catch (error: any) {
      console.error('Failed to update workflow thumbnail:', error)
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched to trigger validation
    const fieldsToValidate = [
      'title',
      'shortDesc',
      'longDescMd',
      'basePriceCents',
      'platform',
      'jsonContent',
      'documentationUrl',
      'n8nMinVersion',
      'n8nMaxVersion',
      'zapierMinVersion',
      'zapierMaxVersion',
      'makeMinVersion',
      'makeMaxVersion',
      'airtableScriptMinVersion',
      'airtableScriptMaxVersion',
      'categoryIds',
      'tagIds',
    ]

    fieldsToValidate.forEach((field) => {
      markFieldAsTouched(field)
    })

    const isValid = validateForm()
    if (!isValid) {
      // Don't show toast error - let the form display the errors visually
      return
    }

    setIsSubmitting(true)
    setError(null)

    const action = editingWorkflow ? 'updating' : 'creating'
    const mainToast = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} workflow...`, {
      description: editingWorkflow
        ? `"${formData.title || editingWorkflow.title}" is being updated.`
        : `"${formData.title}" is being created.`,
    })

    try {
      let imageToast: string | number | undefined
      let documentationToast: string | number | undefined
      let finalHeroImageUrl = formData.heroImageUrl

      if (formData.heroImageFile && formData.heroImageUrl.startsWith('blob:')) {
        setUploadingThumbnail(true)
        imageToast = toast.loading('Uploading image...', {
          description: 'Please wait while your image is being uploaded.',
        })

        if (editingWorkflow && editingWorkflow.heroImageUrl) {
          await deleteImageFromBucket(editingWorkflow.heroImageUrl)
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.heroImageFile)

        const uploadResponse = await fetch('/api/upload/hero-image', {
          method: 'POST',
          body: uploadFormData,
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload image')
        }

        if (imageToast) toast.dismiss(imageToast)
        toast.success('Image uploaded successfully!')

        finalHeroImageUrl = uploadData.url
        setUploadingThumbnail(false)
      } else if (editingWorkflow && editingWorkflow.heroImageUrl && !formData.heroImageUrl) {
        await deleteImageFromBucket(editingWorkflow.heroImageUrl)
        finalHeroImageUrl = ''
      }

      let finalDocumentationUrl = formData.documentationUrl

      if (formData.documentationFile && formData.documentationUrl.startsWith('blob:')) {
        setUploadingDocumentation(true)
        documentationToast = toast.loading('Uploading documentation...', {
          description: 'Please wait while your documentation is being uploaded.',
        })

        if (editingWorkflow && editingWorkflow.documentationUrl) {
          await deleteDocumentationFromBucket(editingWorkflow.documentationUrl)
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.documentationFile)

        const uploadResponse = await fetch('/api/upload/documentation', {
          method: 'POST',
          body: uploadFormData,
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload documentation')
        }

        if (documentationToast) toast.dismiss(documentationToast)
        toast.success('Documentation uploaded successfully!')

        finalDocumentationUrl = uploadData.url
        setUploadingDocumentation(false)
      } else if (editingWorkflow && editingWorkflow.documentationUrl && !formData.documentationUrl) {
        await deleteDocumentationFromBucket(editingWorkflow.documentationUrl)
        finalDocumentationUrl = ''
      }

      const url = editingWorkflow ? `/api/workflows/${editingWorkflow.id}` : '/api/workflows'
      const method = editingWorkflow ? 'PUT' : 'POST'

      const cleanFormData = {
        ...formData,
        longDescMd: formData.longDescMd.trim() || undefined,
        heroImageUrl: finalHeroImageUrl,
        documentationUrl: finalDocumentationUrl,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((detail: any) => `${detail.field}: ${detail.message}`).join(', ')
          throw new Error(`Validation failed: ${validationErrors}`)
        }
        throw new Error(data.error || 'An error occurred')
      }

      setFormData({
        title: '',
        shortDesc: '',
        longDescMd: '',
        heroImageUrl: '',
        heroImageFile: undefined,
        documentationUrl: '',
        documentationFile: undefined,
        basePriceCents: 0,
        currency: 'USD',
        status: 'draft',
        platform: '',
        jsonContent: undefined,
        jsonFile: undefined,
        n8nMinVersion: '',
        n8nMaxVersion: '',
        zapierMinVersion: '',
        zapierMaxVersion: '',
        makeMinVersion: '',
        makeMaxVersion: '',
        airtableScriptMinVersion: '',
        airtableScriptMaxVersion: '',
        categoryIds: [],
        tagIds: [],
      })
      setShowCreateForm(false)
      setEditingWorkflow(null)
      setLoadingWorkflowData(false)
      await fetchWorkflows()

      // Dismiss main loading toast before showing success
      toast.dismiss(mainToast)

      if (editingWorkflow) {
        toast.success('Workflow updated successfully!', {
          description: `"${formData.title || editingWorkflow.title}" has been updated.`,
        })
      } else {
        toast.success('Workflow created successfully!', {
          description: `"${formData.title}" has been added to your store.`,
        })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the workflow')
      // Ensure any loading toasts are dismissed on error
      try {
        toast.dismiss()
      } catch {}
      toast.error('Failed to save workflow', {
        description: err.message || 'An error occurred while saving the workflow',
      })
    } finally {
      setIsSubmitting(false)
      setUploadingThumbnail(false)
      setUploadingDocumentation(false)
      // Ensure main loader is dismissed in any case
      try {
        toast.dismiss()
      } catch {}
    }
  }

  // Handle thumbnail image selection (preview only, no upload)
  const handleHeroImageUpload = useCallback(async (file: File | null, previewUrl?: string) => {
    if (!file) return

    setFormData((prev) => ({
      ...prev,
      heroImageUrl: previewUrl || '',
      heroImageFile: file,
    }))
  }, [])

  // Handle thumbnail image removal (preview only, no deletion)
  const handleHeroImageRemove = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      heroImageUrl: '',
      heroImageFile: undefined,
    }))
  }, [])

  // Handle documentation file selection (preview only, no upload)
  const handleDocumentationUpload = useCallback(
    async (file: File | null, previewUrl?: string) => {
      if (!file) return

      setFormData((prev) => ({
        ...prev,
        documentationUrl: previewUrl || '',
        documentationFile: file,
      }))

      markFieldAsTouched('documentationUrl')

      setTimeout(() => {
        validateField('documentationUrl', previewUrl || '')
      }, 0)
    },
    [markFieldAsTouched, validateField]
  )

  // Handle documentation file removal (preview only, no deletion)
  const handleDocumentationRemove = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      documentationUrl: '',
      documentationFile: undefined,
    }))
    markFieldAsTouched('documentationUrl')
  }, [markFieldAsTouched])

  // Handle workflow deletion
  const handleDeleteClick = (workflowId: string, workflowTitle: string) => {
    setWorkflowToDelete({ id: workflowId, title: workflowTitle })
    setDeleteModalOpen(true)
  }

  // Handle workflow publish/disable/enable
  const handlePublishToggle = async (workflow: Workflow) => {
    let loadingToast: string | number | undefined

    try {
      let newStatus: string
      let action: string

      if (workflow.status === 'admin_disabled') {
        throw new Error('This workflow was disabled by an admin and cannot be re-enabled by the seller')
      } else if (workflow.status === 'draft') {
        newStatus = 'published'
        action = 'publishing'
      } else if (workflow.status === 'published') {
        newStatus = 'disabled'
        action = 'disabling'
      } else {
        newStatus = 'published'
        action = 'enabling'
      }

      loadingToast = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} workflow...`, {
        description: `"${workflow.title}" is being ${action}. Please wait...`,
      })

      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update workflow status')
      }

      await fetchWorkflows()

      // Dismiss the loading toast
      toast.dismiss(loadingToast)

      let successAction: string
      if (newStatus === 'published') {
        successAction = workflow.status === 'draft' ? 'published' : 'enabled'
      } else {
        successAction = 'disabled'
      }

      toast.success(`Workflow ${successAction} successfully!`, {
        description: `"${workflow.title}" has been ${successAction} and is now ${
          newStatus === 'published' ? 'live on the marketplace' : 'temporarily unavailable'
        }.`,
        duration: 5000, // Show for 5 seconds
      })
    } catch (err: any) {
      setError(err.message)
      // Dismiss the loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast)
      }
      toast.error(`Failed to update workflow status`, {
        description: err.message,
      })
    }
  }

  const handleCreateWorkflow = async () => {
    const canBypassStripe =
      process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_BYPASS_STRIPE_ONBOARDING === 'true'

    if (!stripeStatus?.hasStripeAccount && !canBypassStripe) {
      toast.error('Stripe Connect Required', {
        description:
          'You must set up your Stripe Connect account before creating workflows. This is required to receive payments.',
        action: {
          label: 'Set up Stripe',
          onClick: () => router.push('/dashboard/stripe/connect'),
        },
      })
      return
    }

    if (!stripeStatus?.onboardingCompleted && !canBypassStripe) {
      toast.error('Stripe Onboarding Required', {
        description:
          'You must complete your Stripe onboarding before creating workflows. Please complete your account verification.',
        action: {
          label: 'Complete Onboarding',
          onClick: () => router.push('/dashboard/stripe/connect'),
        },
      })
      return
    }

    // Switch to workflows tab
    setActiveTab('workflows')

    // Hide tooltip when user clicks the button
    setShowTooltip(false)

    resetTouchedState()
    setEditingWorkflow(null)
    setLoadingWorkflowData(false)
    setFormData({
      title: '',
      shortDesc: '',
      longDescMd: '',
      heroImageUrl: '',
      heroImageFile: undefined,
      documentationUrl: '',
      documentationFile: undefined,
      basePriceCents: 0,
      currency: 'USD',
      status: 'draft',
      jsonContent: undefined,
      jsonFile: undefined,
      n8nMinVersion: '',
      n8nMaxVersion: '',
      zapierMinVersion: '',
      zapierMaxVersion: '',
      makeMinVersion: '',
      makeMaxVersion: '',
      airtableScriptMinVersion: '',
      airtableScriptMaxVersion: '',
      categoryIds: [],
      tagIds: [],
    })
    setShowCreateForm(true)
    await fetchWorkflows()
  }

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return

    setIsDeleting(true)

    toast.loading('Deleting workflow...', {
      description: `"${workflowToDelete.title}" is being deleted.`,
    })

    try {
      const workflow = workflows.find((w) => w.id === workflowToDelete.id)

      const response = await fetch(`/api/workflows/${workflowToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete workflow')
      }

      if (workflow) {
        const fullWorkflow = await fetchWorkflowDetails(workflowToDelete.id)
        if (fullWorkflow?.heroImageUrl) {
          await deleteImageFromBucket(fullWorkflow.heroImageUrl)
        }
        if (fullWorkflow?.documentationUrl) {
          await deleteDocumentationFromBucket(fullWorkflow.documentationUrl)
        }
      }

      await fetchWorkflows()
      toast.success('Workflow deleted successfully!', {
        description: `"${workflowToDelete.title}" has been removed from your store.`,
      })
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to delete workflow', {
        description: err.message,
      })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setWorkflowToDelete(null)
    }
  }

  // Fetch full workflow details
  const fetchWorkflowDetails = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch workflow details')
      }
      const data = await response.json()
      return data.data
    } catch (err: any) {
      setError(`Failed to load workflow details: ${err.message}`)
      toast.error('Failed to load workflow details', {
        description: err.message,
      })
      return null
    }
  }

  // Handle edit workflow
  const handleEdit = async (workflow: Workflow) => {
    resetTouchedState()
    setEditingWorkflow(workflow)
    setShowCreateForm(true)
    setLoadingWorkflowData(true)

    try {
      const fullWorkflow = await fetchWorkflowDetails(workflow.id)
      if (fullWorkflow) {
        const latestVersion = fullWorkflow.versions?.[0]

        let cleanImageUrl = fullWorkflow.heroImageUrl || ''

        setFormData({
          title: fullWorkflow.title,
          shortDesc: fullWorkflow.shortDesc,
          longDescMd: fullWorkflow.longDescMd || '',
          heroImageUrl: cleanImageUrl,
          heroImageFile: undefined,
          documentationUrl: fullWorkflow.documentationUrl || '',
          documentationFile: undefined,
          basePriceCents: fullWorkflow.basePriceCents,
          currency: fullWorkflow.currency,
          status: fullWorkflow.status as any,
          platform: fullWorkflow.platform || '',
          jsonContent: latestVersion?.jsonContent || undefined,
          jsonFile: undefined,
          n8nMinVersion: latestVersion?.n8nMinVersion || '',
          n8nMaxVersion: latestVersion?.n8nMaxVersion || '',
          zapierMinVersion: latestVersion?.zapierMinVersion || '',
          zapierMaxVersion: latestVersion?.zapierMaxVersion || '',
          makeMinVersion: latestVersion?.makeMinVersion || '',
          makeMaxVersion: latestVersion?.makeMaxVersion || '',
          airtableScriptMinVersion: latestVersion?.airtableScriptMinVersion || '',
          airtableScriptMaxVersion: latestVersion?.airtableScriptMaxVersion || '',
          categoryIds: fullWorkflow.categories?.map((cat: any) => cat.category.id.toString()) || [],
          tagIds: fullWorkflow.tags?.map((tag: any) => tag.tag.id.toString()) || [],
        })
      } else {
        setFormData({
          title: workflow.title,
          shortDesc: workflow.shortDesc,
          longDescMd: '',
          heroImageUrl: '',
          heroImageFile: undefined,
          documentationUrl: workflow.documentationUrl || '',
          documentationFile: undefined,
          basePriceCents: workflow.basePriceCents,
          currency: workflow.currency,
          status: workflow.status as any,
          platform: workflow.platform || '',
          jsonContent: undefined,
          jsonFile: undefined,
          n8nMinVersion: '',
          n8nMaxVersion: '',
          zapierMinVersion: '',
          zapierMaxVersion: '',
          makeMinVersion: '',
          makeMaxVersion: '',
          airtableScriptMinVersion: '',
          airtableScriptMaxVersion: '',
          categoryIds: [],
          tagIds: [],
        })
      }
    } catch (error) {
      console.error('Error loading workflow data:', error)
      setError('Failed to load workflow data')
      toast.error('Failed to load workflow data', {
        description: 'Please try again or contact support if the problem persists.',
      })
    } finally {
      setLoadingWorkflowData(false)
    }
  }

  if (loading || isLoading || stripeStatus === null) {
    return <SellerDashboardSkeleton />
  }

  if (!user?.isSeller) {
    return null
  }

  // Show Stripe setup card if no Stripe account is configured
  if (stripeStatus && !stripeStatus.hasStripeAccount) {
    return (
      <div className="min-h-screen bg-[#08080A] py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-8">
                {/* Profile Picture */}
                <div className="w-16 h-16 rounded-full bg-[#1E1E24] flex items-center justify-center overflow-hidden border border-[#9DA2B3]/25">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl font-aeonikpro">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* User Info and Balance */}
                <div className="flex items-center space-x-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#EDEFF7] font-aeonikpro">
                      {user?.displayName || user?.name || user?.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-[#9DA2B3] font-aeonikpro">{user?.email}</p>
                  </div>

                  {/* Balance Section */}
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-[#9DA2B3] font-aeonikpro">Balance</span>
                      <button
                        onClick={handleSeePayoutsClick}
                        className="text-[#EDEFF7] hover:text-white text-sm flex items-center cursor-pointer font-aeonikpro transition-colors"
                      >
                        See Payouts
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-2xl font-bold text-[#EDEFF7] font-aeonikpro">
                      {currentMonthEarnings
                        ? formatCurrency(currentMonthEarnings.totalNet, currentMonthEarnings.currency)
                        : 'USD 0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Workflow Button */}
              <Button onClick={handleCreateWorkflow} className="font-aeonikpro">
                Create Workflow
              </Button>
            </div>
          </div>

          <StripeSetupCard className="mt-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080A] py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-8">
              {/* Profile Picture */}
              <div className="w-16 h-16 rounded-full bg-[#1E1E24] flex items-center justify-center overflow-hidden border border-[#9DA2B3]/25">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl font-aeonikpro">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* User Info and Balance */}
              <div className="flex items-center space-x-8">
                <div>
                  <h1 className="text-2xl font-bold text-[#EDEFF7] font-aeonikpro">
                    {user?.displayName || user?.name || user?.email?.split('@')[0] || 'User'}
                  </h1>
                  <p className="text-[#9DA2B3] font-aeonikpro">{user?.email}</p>
                </div>

                {/* Balance Section */}
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-[#9DA2B3] font-aeonikpro">Balance</span>
                    <button
                      onClick={handleSeePayoutsClick}
                      className="text-[#EDEFF7] hover:text-white text-sm flex items-center cursor-pointer font-aeonikpro transition-colors"
                    >
                      See Payouts
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-2xl font-bold text-[#EDEFF7] font-aeonikpro">
                    {balanceLoading ? (
                      <span className="text-[#9DA2B3]">Loading...</span>
                    ) : balance ? (
                      `${(balance.currency || 'USD').toUpperCase()} ${(balance.total / 100).toFixed(2)}`
                    ) : (
                      <span className="text-[#9DA2B3]">USD 0.00</span>
                    )}
                  </div>
                  {balance && balance.available > 0 && (
                    <div className="text-xs text-[#9DA2B3] font-aeonikpro">
                      Available: {(balance.currency || 'USD').toUpperCase()} {(balance.available / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Create Workflow Button */}
            <AnimatedTooltip
              show={showTooltip}
              title="Time to create your first workflow!"
              description="Your account and payout information have been verified. You can now add your first workflow to neaply."
              position="bottom"
            >
              <Button onClick={handleCreateWorkflow} className="bg-opacity-30 font-aeonikpro">
                Create Workflow
              </Button>
            </AnimatedTooltip>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/50 bg-red-500/10 px-4 py-3 rounded-lg">
            <div className="text-red-400 text-sm font-aeonikpro">{error}</div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 bg-transparent">
          <TabsList className="grid w-full grid-cols-5 bg-transparent border-b border-[#9DA2B3]/25">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SellerOverviewTab
              workflows={workflows}
              analyticsOverview={analyticsOverview}
              onResetTouchedState={resetTouchedState}
              onSetShowCreateForm={setShowCreateForm}
              onSetActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <SellerWorkflowsTab
              workflows={workflows}
              showCreateForm={showCreateForm}
              editingWorkflow={editingWorkflow}
              loadingWorkflowData={loadingWorkflowData}
              formData={formData}
              errors={errors}
              touched={touched}
              isSubmitting={isSubmitting}
              isFormValid={isFormValid}
              categories={categories}
              tags={tags}
              categoriesLoading={categoriesLoading}
              tagsLoading={tagsLoading}
              uploadingThumbnail={uploadingThumbnail}
              uploadingDocumentation={uploadingDocumentation}
              onUpdateFormData={(field, value) => setFormData({ ...formData, [field]: value })}
              onMarkFieldAsTouched={markFieldAsTouched}
              onSubmit={handleSubmit}
              onCancel={async () => {
                setShowCreateForm(false)
                setEditingWorkflow(null)
                setLoadingWorkflowData(false)
                await fetchWorkflows()
              }}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPublishToggle={handlePublishToggle}
              onHeroImageUpload={handleHeroImageUpload}
              onHeroImageRemove={handleHeroImageRemove}
              onDocumentationUpload={handleDocumentationUpload}
              onDocumentationRemove={handleDocumentationRemove}
              onCreateWorkflow={handleCreateWorkflow}
            />
          </TabsContent>

          <TabsContent value="store" className="space-y-6">
            {sellerProfile ? (
              <StoreCustomization
                initialData={sellerProfile}
                onUpdate={(data) => {
                  setSellerProfile((prev) => (prev ? { ...prev, ...data } : null))
                }}
              />
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 bg-[#40424D]/50 rounded" />
                <div className="h-40 bg-[#40424D]/30 rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 bg-[#40424D]/30 rounded-xl" />
                  <div className="h-48 bg-[#40424D]/30 rounded-xl" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SellerAnalytics />
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <SellerPayouts />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Workflow"
        itemName={workflowToDelete?.title}
        isLoading={isDeleting}
      />
    </div>
  )
}
