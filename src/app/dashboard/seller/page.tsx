'use client'

import { useAuth } from '@/hooks/useAuth'
import { useFormValidation, type WorkflowFormData } from '@/hooks/useFormValidation'
import { safeDecrypt } from '@/lib/encryption'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { SellerAnalytics } from '@/components/ui/seller-analytics'
import { SellerPayouts } from '@/components/ui/seller-payouts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkflowPacksTab } from '@/components/workflow/WorkflowPacksTab'
import { SellerDashboardSkeleton } from '@/components/seller/SellerDashboardSkeleton'
import { SellerOverviewTab } from '@/components/seller/SellerOverviewTab'
import { SellerWorkflowsTab } from '@/components/seller/SellerWorkflowsTab'
import type { Category, Tag, Workflow } from '@/types/workflow'

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
    basePriceCents: 0, // €0.00 default (free)
    currency: 'EUR',
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
  const [workflowPacksCount, setWorkflowPacksCount] = useState(0)
  const [packPublishedCount, setPackPublishedCount] = useState(0)
  const [recentPacks, setRecentPacks] = useState<any[]>([])
  const [workflowPacks, setWorkflowPacks] = useState<any[]>([])
  const [isLoadingPacks, setIsLoadingPacks] = useState(false)
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
  const checkStripeStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/connect')
      if (response.ok) {
        const data = await response.json()
        setStripeStatus({
          hasStripeAccount: !!data.data?.stripeAccountId,
          onboardingCompleted: !!data.data?.stripeOnboardingCompleted,
        })
      } else {
        setStripeStatus({
          hasStripeAccount: false,
          onboardingCompleted: false,
        })
      }
    } catch (error) {
      console.error('Failed to check Stripe status:', error)
      setStripeStatus({
        hasStripeAccount: false,
        onboardingCompleted: false,
      })
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
    } finally {
      setTagsLoading(false)
    }
  }, [])

  // Fetch workflow packs count for current seller (all statuses)
  const fetchWorkflowPacks = useCallback(async () => {
    try {
      if (!user?.id) return
      setIsLoadingPacks(true)

      const statuses = ['draft', 'published', 'unlisted', 'disabled'] as const
      const allPacks: any[] = []

      // Fetch count for stats
      const countRequests = statuses.map((status) =>
        fetch(`/api/packs?sellerId=${encodeURIComponent(user.id)}&status=${status}&limit=1`)
      )
      const countResponses = await Promise.all(countRequests)
      const countJsons = await Promise.all(countResponses.map((r) => r.json()))
      const total = countJsons.reduce((sum, j) => sum + (j.pagination?.total || 0), 0)
      const publishedRes = countJsons[statuses.indexOf('published')]
      const published = publishedRes?.pagination?.total || 0
      setWorkflowPacksCount(total)
      setPackPublishedCount(published)

      // Fetch all packs for the tab
      for (const status of statuses) {
        const response = await fetch(`/api/packs?sellerId=${encodeURIComponent(user.id)}&status=${status}&limit=100`)
        if (response.ok) {
          const data = await response.json()
          if (data.packs && Array.isArray(data.packs)) {
            allPacks.push(...data.packs)
          }
        }
      }

      setWorkflowPacks(allPacks)
    } catch (err: any) {
      console.error('Failed to fetch workflow packs:', err.message)
    } finally {
      setIsLoadingPacks(false)
    }
  }, [user?.id])

  // Fetch recent packs for activity (default: published/unlisted)
  const fetchRecentPacks = useCallback(async () => {
    try {
      if (!user?.id) return
      const response = await fetch(`/api/packs?sellerId=${encodeURIComponent(user.id)}&limit=5&page=1`)
      if (!response.ok) return
      const data = await response.json()
      setRecentPacks(data.packs || [])
    } catch (err) {
      // ignore
    }
  }, [user?.id])

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

  useEffect(() => {
    if (user?.isSeller) {
      fetchWorkflows()
      fetchCategories()
      fetchTags()
      fetchWorkflowPacks()
      fetchRecentPacks()
      fetchAnalyticsOverview()
      checkStripeStatus()
    }
  }, [user?.isSeller, fetchWorkflows, fetchCategories, fetchTags, fetchWorkflowPacks, fetchRecentPacks, fetchAnalyticsOverview, checkStripeStatus])

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
      'title', 'shortDesc', 'longDescMd', 'basePriceCents', 'platform',
      'jsonContent', 'documentationUrl', 'n8nMinVersion', 'n8nMaxVersion',
      'zapierMinVersion', 'zapierMaxVersion', 'makeMinVersion', 'makeMaxVersion',
      'airtableScriptMinVersion', 'airtableScriptMaxVersion', 'categoryIds', 'tagIds'
    ]

    fieldsToValidate.forEach((field) => {
      markFieldAsTouched(field)
    })

    const isValid = validateForm()
    if (!isValid) {
      setError('Please fix the validation errors before submitting')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let finalHeroImageUrl = formData.heroImageUrl

      if (formData.heroImageFile && formData.heroImageUrl.startsWith('blob:')) {
        setUploadingThumbnail(true)

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

        finalHeroImageUrl = uploadData.url
        setUploadingThumbnail(false)
      } else if (editingWorkflow && editingWorkflow.heroImageUrl && !formData.heroImageUrl) {
        await deleteImageFromBucket(editingWorkflow.heroImageUrl)
        finalHeroImageUrl = ''
      }

      let finalDocumentationUrl = formData.documentationUrl

      if (formData.documentationFile && formData.documentationUrl.startsWith('blob:')) {
        setUploadingDocumentation(true)

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
        currency: 'EUR',
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
    } finally {
      setIsSubmitting(false)
      setUploadingThumbnail(false)
      setUploadingDocumentation(false)
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

  const handleCreateWorkflow = async () => {
    if (!stripeStatus?.hasStripeAccount || !stripeStatus?.onboardingCompleted) {
      toast.error('Stripe Connect Required', {
        description: 'You must complete your Stripe Connect setup before creating workflows. Please set up your payment account first.',
        action: {
          label: 'Set up Stripe',
          onClick: () => router.push('/dashboard/stripe/connect'),
        },
      })
      return
    }

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
      currency: 'EUR',
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
          status: fullWorkflow.status,
          platform: fullWorkflow.platform || '',
          jsonContent: latestVersion?.jsonContent ? safeDecrypt(latestVersion.jsonContent) : undefined,
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
          status: workflow.status,
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
    } finally {
      setLoadingWorkflowData(false)
    }
  }

  if (loading || isLoading) {
    return <SellerDashboardSkeleton />
  }

  if (!user?.isSeller) {
    return null
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-space-grotesk font-bold text-foreground">Creator Dashboard</h1>
              <p className="mt-2 text-lg text-muted-foreground">Manage your workflows and track your sales</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 border-red-200 bg-red-50 border px-4 py-3 rounded">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
            <TabsTrigger value="packs">Packs ({workflowPacksCount})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SellerOverviewTab
              workflows={workflows}
              recentPacks={recentPacks}
              analyticsOverview={analyticsOverview}
              workflowPacksCount={workflowPacksCount}
              packPublishedCount={packPublishedCount}
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
              onHeroImageUpload={handleHeroImageUpload}
              onHeroImageRemove={handleHeroImageRemove}
              onDocumentationUpload={handleDocumentationUpload}
              onDocumentationRemove={handleDocumentationRemove}
              onCreateWorkflow={handleCreateWorkflow}
            />
          </TabsContent>

          <TabsContent value="packs" className="space-y-6">
            <WorkflowPacksTab
              categories={categories}
              tags={tags}
              workflows={workflows}
              workflowPacks={workflowPacks}
              isLoadingPacks={isLoadingPacks}
              onTabChange={setActiveTab}
              onRefreshPacks={fetchWorkflowPacks}
            />
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
