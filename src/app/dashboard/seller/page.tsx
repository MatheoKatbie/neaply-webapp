'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SellerAnalytics } from '@/components/ui/seller-analytics'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JsonInput } from '@/components/ui/json-input'
import { ImageUpload } from '@/components/ui/image-upload'
import { FileUpload } from '@/components/ui/file-upload'
import { MultiSelect } from '@/components/ui/multi-select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category, Tag } from '@/types/workflow'

// Validation rules based on Zod schema from API
type ValidationRule =
  | { minLength: number; maxLength: number; required: boolean }
  | { min: number; max: number; required: boolean }
  | { required: boolean }
  | { minArrayLength: number; required: boolean }

const validationRules: Record<string, ValidationRule> = {
  title: {
    minLength: 3,
    maxLength: 100,
    required: true,
  },
  shortDesc: {
    minLength: 10,
    maxLength: 200,
    required: true,
  },
  longDescMd: {
    minLength: 50,
    maxLength: 5000,
    required: false,
  },
  basePriceCents: {
    min: 0, // €0.00 (free)
    max: 100000, // €1000.00
    required: true,
  },
  jsonContent: {
    required: true,
  },
  documentationUrl: {
    required: true,
  },
  n8nMinVersion: {
    required: true,
  },
  n8nMaxVersion: {
    required: false,
  },
  categoryIds: {
    minArrayLength: 1,
    required: true,
  },
  tagIds: {
    minArrayLength: 1,
    required: true,
  },
}

// Field name mapping for better error messages
const fieldNames: Record<string, string> = {
  title: 'Title',
  shortDesc: 'Short description',
  longDescMd: 'Detailed description',
  basePriceCents: 'Price',
  jsonContent: 'Workflow JSON',
  documentationUrl: 'Documentation',
  n8nMinVersion: 'Minimum n8n version',
  n8nMaxVersion: 'Maximum n8n version',
  categoryIds: 'Categories',
  tagIds: 'Tags',
}

// Validation hook
const useFormValidation = (formData: WorkflowFormData) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback(
    (field: string, value: any): string | null => {
      const rules = validationRules[field as keyof typeof validationRules]
      if (!rules) return null

      const fieldName = fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1)

      if (rules.required && (value === undefined || value === null || (typeof value === 'string' && !value.trim()))) {
        return `${fieldName} is required`
      }

      if (typeof value === 'string' && value.trim()) {
        if ('minLength' in rules && value.length < rules.minLength) {
          return `${fieldName} must be at least ${rules.minLength} characters`
        }
        if ('maxLength' in rules && value.length > rules.maxLength) {
          return `${fieldName} cannot exceed ${rules.maxLength} characters`
        }
      }

      if (field === 'basePriceCents' && typeof value === 'number') {
        if ('min' in rules && value < rules.min) {
          return `Price cannot be negative`
        }
        if ('max' in rules && value > rules.max) {
          return `Price cannot exceed €${(rules.max / 100).toFixed(2)}`
        }
      }

      if (field === 'jsonContent' && rules.required && !value) {
        return 'Workflow JSON is required'
      }

      if (field === 'documentationUrl' && rules.required) {
        // Check if we have either a URL or a selected file
        const hasUrl = value && value.trim() && !value.startsWith('blob:')
        const hasSelectedFile = formData.documentationFile
        if (!hasUrl && !hasSelectedFile) {
          return 'Documentation is required'
        }
        // If we have a blob URL, we must have a selected file
        if (value && value.startsWith('blob:') && !hasSelectedFile) {
          return 'Documentation is required'
        }
        // If we have a valid URL (not blob), it's considered valid
        if (hasUrl) {
          return null
        }
      }

      if (field === 'n8nMinVersion' && rules.required && !value) {
        return 'Minimum n8n version is required'
      }

      if (field === 'n8nMinVersion' && value && value.trim()) {
        const versionRegex = /^\d+\.\d+\.\d+$/
        if (!versionRegex.test(value)) {
          return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
        }
      }

      if (field === 'n8nMaxVersion' && value && value.trim()) {
        const versionRegex = /^\d+\.\d+\.\d+$/
        if (!versionRegex.test(value)) {
          return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
        }
      }

      if (field === 'n8nMaxVersion' && value && value.trim()) {
        const minVersion = formData.n8nMinVersion || '0.0.0'
        const maxVersion = value

        // Compare semantic versions properly
        const minParts = minVersion.split('.').map(Number)
        const maxParts = maxVersion.split('.').map(Number)

        // Pad arrays to same length
        while (minParts.length < maxParts.length) minParts.push(0)
        while (maxParts.length < minParts.length) maxParts.push(0)

        // Compare each part
        for (let i = 0; i < minParts.length; i++) {
          if (maxParts[i] > minParts[i]) break
          if (maxParts[i] < minParts[i]) {
            return 'Maximum n8n version must be greater than minimum n8n version'
          }
        }
      }

      // Validate array fields (categories and tags)
      if (Array.isArray(value)) {
        if ('minArrayLength' in rules && value.length < rules.minArrayLength) {
          return `${fieldName} must have at least ${rules.minArrayLength} selection`
        }
      }

      return null
    },
    [formData]
  )

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    Object.keys(validationRules).forEach((field) => {
      const value = formData[field as keyof WorkflowFormData]
      const error = validateField(field, value)
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, validateField])

  const markFieldAsTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const getFieldError = useCallback(
    (field: string): string | null => {
      if (!touched[field]) return null
      return errors[field] || null
    },
    [errors, touched]
  )

  // Reset touched state when opening create form
  const resetTouchedState = useCallback(() => {
    setTouched({})
  }, [])

  const isFormValid = useMemo(() => {
    return validateForm()
  }, [validateForm])

  return {
    errors,
    touched,
    validateField,
    validateForm,
    markFieldAsTouched,
    getFieldError,
    isFormValid,
    resetTouchedState,
  }
}

interface Workflow {
  id: string
  title: string
  slug: string
  shortDesc: string
  heroImageUrl?: string
  documentationUrl?: string
  status: 'draft' | 'published' | 'unlisted' | 'disabled'
  basePriceCents: number
  currency: string
  salesCount: number
  ratingAvg: number
  ratingCount: number
  createdAt: string
  updatedAt: string
  categories?: {
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
  tags?: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  versions?: {
    id: string
    semver: string
    n8nMinVersion?: string
    n8nMaxVersion?: string
    jsonContent?: any
    isLatest: boolean
    createdAt: string
  }[]
  _count: {
    reviews: number
    favorites: number
    orderItems: number
  }
}

interface WorkflowFormData {
  title: string
  shortDesc: string
  longDescMd: string
  heroImageUrl: string
  heroImageFile?: File
  documentationUrl: string
  documentationFile?: File
  basePriceCents: number
  currency: string
  status: 'draft' | 'published' | 'unlisted' | 'disabled'
  jsonContent?: any
  jsonFile?: File
  n8nMinVersion?: string
  n8nMaxVersion?: string
  categoryIds?: string[]
  tagIds?: string[]
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
    basePriceCents: 0, // €0.00 default (free)
    currency: 'EUR',
    status: 'draft',
    jsonContent: undefined,
    jsonFile: undefined,
    n8nMinVersion: '',
    n8nMaxVersion: '',
    categoryIds: [],
    tagIds: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingDocumentation, setUploadingDocumentation] = useState(false)
  const [loadingWorkflowData, setLoadingWorkflowData] = useState(false)

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

      // Temporarily disable auto-cleanup to avoid re-renders
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

  useEffect(() => {
    if (user?.isSeller) {
      fetchWorkflows()
      fetchCategories()
      fetchTags()
    }
  }, [user?.isSeller, fetchWorkflows, fetchCategories, fetchTags])

  // Force validation when documentation file changes
  useEffect(() => {
    if (touched.documentationUrl) {
      validateField('documentationUrl', formData.documentationUrl)
    }
  }, [formData.documentationFile, formData.documentationUrl, touched.documentationUrl, validateField])

  // Force validation when editing workflow with existing documentation
  useEffect(() => {
    if (editingWorkflow && formData.documentationUrl && !formData.documentationFile) {
      // When editing, if we have a documentation URL but no file, mark as touched and validate
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
      // When editing, if we have a min version but no max version, mark as touched and validate
      markFieldAsTouched('n8nMaxVersion')
      validateField('n8nMaxVersion', formData.n8nMaxVersion)
    }
  }, [editingWorkflow, formData.n8nMinVersion, formData.n8nMaxVersion, markFieldAsTouched, validateField])

  // Helper function to delete image from bucket
  const deleteImageFromBucket = async (imageUrl: string) => {
    try {
      if (!imageUrl || imageUrl.startsWith('blob:')) return

      // Extract filename from URL
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

      // Extract filename from URL
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
      // Try to fetch the image to see if it exists
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (response.ok) {
        return imageUrl // Image exists
      } else {
        console.warn('Image not found, cleaning up URL:', imageUrl)
        return null // Image doesn't exist
      }
    } catch (error) {
      console.warn('Error checking image:', error)
      return null // Assume it doesn't exist if we can't check
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
      // Don't set error here as it's handled in the calling function
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched and validate
    Object.keys(validationRules).forEach((field) => {
      markFieldAsTouched(field)
    })

    // Force validation check
    const isValid = validateForm()
    if (!isValid) {
      setError('Please fix the validation errors before submitting')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let finalHeroImageUrl = formData.heroImageUrl

      // Handle image upload/deletion if needed
      if (formData.heroImageFile && formData.heroImageUrl.startsWith('blob:')) {
        // New image to upload
        setUploadingThumbnail(true)

        // Delete old image if we're editing and there was an old image
        if (editingWorkflow && editingWorkflow.heroImageUrl) {
          await deleteImageFromBucket(editingWorkflow.heroImageUrl)
        }

        // Upload new image
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
        // Image was removed, delete the old one
        await deleteImageFromBucket(editingWorkflow.heroImageUrl)
        finalHeroImageUrl = ''
      }

      // Handle documentation upload/deletion if needed
      let finalDocumentationUrl = formData.documentationUrl

      if (formData.documentationFile && formData.documentationUrl.startsWith('blob:')) {
        // New documentation to upload
        setUploadingDocumentation(true)

        // Delete old documentation if we're editing and there was an old documentation
        if (editingWorkflow && editingWorkflow.documentationUrl) {
          await deleteDocumentationFromBucket(editingWorkflow.documentationUrl)
        }

        // Upload new documentation
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
        // Documentation was removed, delete the old one
        await deleteDocumentationFromBucket(editingWorkflow.documentationUrl)
        finalDocumentationUrl = ''
      }

      const url = editingWorkflow ? `/api/workflows/${editingWorkflow.id}` : '/api/workflows'
      const method = editingWorkflow ? 'PUT' : 'POST'

      // Nettoyer les données avant l'envoi
      const cleanFormData = {
        ...formData,
        longDescMd: formData.longDescMd.trim() || undefined,
        heroImageUrl: finalHeroImageUrl, // Garder la valeur exacte (même si c'est '' pour supprimer)
        documentationUrl: finalDocumentationUrl, // Garder la valeur exacte (même si c'est '' pour supprimer)
      }

      console.log('Sending data:', cleanFormData) // Debug

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
          // Si on a des détails de validation, les afficher
          const validationErrors = data.details.map((detail: any) => `${detail.field}: ${detail.message}`).join(', ')
          throw new Error(`Validation failed: ${validationErrors}`)
        }
        throw new Error(data.error || 'An error occurred')
      }

      // Reset form and refresh workflows
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
        categoryIds: [],
        tagIds: [],
      })
      setShowCreateForm(false)
      setEditingWorkflow(null)
      setLoadingWorkflowData(false)
      await fetchWorkflows()

      // Show success toast
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

    // Just update form data with preview URL and file
    // Actual upload will happen on form submission
    setFormData((prev) => ({
      ...prev,
      heroImageUrl: previewUrl || '',
      heroImageFile: file,
    }))
  }, [])

  // Handle thumbnail image removal (preview only, no deletion)
  const handleHeroImageRemove = useCallback(() => {
    // Just clear form data, actual deletion will happen on form submission
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

      // Just update form data with preview URL and file
      // Actual upload will happen on form submission
      setFormData((prev) => ({
        ...prev,
        documentationUrl: previewUrl || '',
        documentationFile: file,
      }))

      // Mark the field as touched to trigger validation
      markFieldAsTouched('documentationUrl')

      // Force immediate validation
      setTimeout(() => {
        validateField('documentationUrl', previewUrl || '')
      }, 0)
    },
    [markFieldAsTouched, validateField]
  )

  // Handle documentation file removal (preview only, no deletion)
  const handleDocumentationRemove = useCallback(() => {
    // Just clear form data, actual deletion will happen on form submission
    setFormData((prev) => ({
      ...prev,
      documentationUrl: '',
      documentationFile: undefined,
    }))
    // Mark the field as touched to trigger validation
    markFieldAsTouched('documentationUrl')
  }, [markFieldAsTouched])

  // Handle workflow deletion
  const handleDelete = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return
    }

    try {
      // First, get the workflow details to find the image
      const workflowToDelete = workflows.find((w) => w.id === workflowId)

      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete workflow')
      }

      // Delete the thumbnail image and documentation from bucket if they exist
      if (workflowToDelete) {
        // Fetch full details to get heroImageUrl and documentationUrl
        const fullWorkflow = await fetchWorkflowDetails(workflowId)
        if (fullWorkflow?.heroImageUrl) {
          await deleteImageFromBucket(fullWorkflow.heroImageUrl)
        }
        if (fullWorkflow?.documentationUrl) {
          await deleteDocumentationFromBucket(fullWorkflow.documentationUrl)
        }
      }

      await fetchWorkflows()
    } catch (err: any) {
      setError(err.message)
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
      // Fetch full details
      const fullWorkflow = await fetchWorkflowDetails(workflow.id)
      if (fullWorkflow) {
        const latestVersion = fullWorkflow.versions?.[0]

        // Temporarily disable auto-cleanup during edit to avoid re-renders
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
          jsonContent: latestVersion?.jsonContent,
          jsonFile: undefined,
          n8nMinVersion: latestVersion?.n8nMinVersion || '',
          n8nMaxVersion: latestVersion?.n8nMaxVersion || '',
          categoryIds: fullWorkflow.categories?.map((cat: any) => cat.category.id.toString()) || [],
          tagIds: fullWorkflow.tags?.map((tag: any) => tag.tag.id.toString()) || [],
        })
      } else {
        // Fallback to basic data if fetch fails
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
          jsonContent: undefined,
          jsonFile: undefined,
          n8nMinVersion: '',
          n8nMaxVersion: '',
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

  // Format price
  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'unlisted':
        return 'bg-gray-100 text-gray-800'
      case 'disabled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs skeleton */}
          <div className="bg-white rounded-lg border">
            <div className="border-b p-1">
              <div className="flex space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-9 bg-gray-200 rounded w-36 animate-pulse"></div>
              </div>

              {/* Workflow cards skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      {/* Image placeholder */}
                      <div className="w-40 h-32 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>

                        {/* Tags skeleton */}
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                          ))}
                        </div>

                        {/* Stats skeleton */}
                        <div className="flex space-x-6">
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user?.isSeller) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your workflows and track your sales</p>
        </div>

        {error && (
          <div className="mb-6 border-red-200 bg-red-50 border px-4 py-3 rounded">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflows.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflows.filter((w) => w.status === 'published').length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflows.reduce((sum, w) => sum + w._count.orderItems, 0)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(
                      workflows.reduce((sum, w) => sum + w._count.orderItems * w.basePriceCents, 0),
                      'EUR'
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest workflow updates</CardDescription>
              </CardHeader>
              <CardContent>
                {workflows.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No workflows yet</p>
                    <Button
                      onClick={() => {
                        resetTouchedState()
                        setShowCreateForm(true)
                        setActiveTab('workflows')
                      }}
                    >
                      Create Your First Workflow
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflows.slice(0, 5).map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Thumbnail Preview */}
                          <div className="flex-shrink-0">
                            {workflow.heroImageUrl ? (
                              <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-100 border">
                                <img
                                  src={workflow.heroImageUrl}
                                  alt={workflow.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    target.parentElement!.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                      </div>
                                    `
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-16 rounded-md bg-gray-100 border flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  ></path>
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div>
                            <h3 className="font-medium">{workflow.title}</h3>
                            <p className="text-sm text-gray-500">{workflow.shortDesc}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                              <span className="text-sm text-gray-500">{workflow._count.orderItems} sales</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatPrice(workflow.basePriceCents, workflow.currency)}</div>
                          <div className="text-sm text-gray-500">
                            Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Workflows</h2>
              {!showCreateForm && (
                <Button
                  onClick={async () => {
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
                      categoryIds: [],
                      tagIds: [],
                    })
                    setShowCreateForm(true)
                    // Refresh workflows when switching to create mode
                    await fetchWorkflows()
                  }}
                >
                  Add New Workflow
                </Button>
              )}
            </div>

            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}</CardTitle>
                  <CardDescription>
                    {editingWorkflow ? 'Update your workflow details' : 'Add a new workflow to your store'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingWorkflowData ? (
                    <div className="space-y-6">
                      {/* Title and Price skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>

                      {/* Short Description skeleton */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>

                      {/* Long Description skeleton */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-3 w-48" />
                      </div>

                      {/* JSON Input skeleton */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-48 w-full" />
                      </div>

                      {/* n8n Versions skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>

                      {/* Image Upload skeleton */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-32 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>

                      {/* Status skeleton */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>

                      {/* Categories & Tags skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>

                      {/* Buttons skeleton */}
                      <div className="flex gap-4 pt-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-20" />
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            onBlur={() => markFieldAsTouched('title')}
                            placeholder="e.g., Advanced Email Automation"
                            required
                            maxLength={100}
                            className={getFieldError('title') ? 'border-red-500' : ''}
                          />
                          {getFieldError('title') && <p className="text-xs text-red-500">{getFieldError('title')}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="basePriceCents">Price (€) *</Label>
                          <Input
                            id="basePriceCents"
                            name="basePriceCents"
                            type="number"
                            min="0"
                            max="1000"
                            step="0.01"
                            value={formData.basePriceCents / 100}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                basePriceCents: Math.round(parseFloat(e.target.value || '0') * 100),
                              })
                            }
                            onBlur={() => markFieldAsTouched('basePriceCents')}
                            placeholder="5.00"
                            required
                            className={getFieldError('basePriceCents') ? 'border-red-500' : ''}
                          />
                          {getFieldError('basePriceCents') && (
                            <p className="text-xs text-red-500">{getFieldError('basePriceCents')}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shortDesc">Short Description *</Label>
                        <Input
                          id="shortDesc"
                          name="shortDesc"
                          value={formData.shortDesc}
                          onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                          onBlur={() => markFieldAsTouched('shortDesc')}
                          placeholder="Brief description of your workflow..."
                          required
                          maxLength={200}
                          className={getFieldError('shortDesc') ? 'border-red-500' : ''}
                        />
                        <p className="text-xs text-gray-500">{formData.shortDesc.length}/200 characters</p>
                        {getFieldError('shortDesc') && (
                          <p className="text-xs text-red-500">{getFieldError('shortDesc')}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="longDescMd">Detailed Description</Label>
                        <textarea
                          id="longDescMd"
                          name="longDescMd"
                          className={`flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            getFieldError('longDescMd') ? 'border-red-500' : ''
                          }`}
                          value={formData.longDescMd}
                          onChange={(e) => setFormData({ ...formData, longDescMd: e.target.value })}
                          onBlur={() => markFieldAsTouched('longDescMd')}
                          placeholder="Detailed description with features, requirements, etc..."
                          maxLength={5000}
                          rows={6}
                        />
                        <p className="text-xs text-gray-500">
                          {formData.longDescMd.length}/5000 characters. Supports markdown.
                        </p>
                        {getFieldError('longDescMd') && (
                          <p className="text-xs text-red-500">{getFieldError('longDescMd')}</p>
                        )}
                      </div>

                      {/* JSON Workflow Input */}
                      <div className="space-y-2">
                        <Label>Workflow JSON *</Label>
                        <JsonInput
                          value={formData.jsonContent}
                          onChange={(jsonContent, isValid) => {
                            setFormData({ ...formData, jsonContent })
                            // Mark as touched when JSON is changed
                            if (!touched.jsonContent) {
                              markFieldAsTouched('jsonContent')
                            }
                          }}
                          onFileSelect={(file) => {
                            setFormData({ ...formData, jsonFile: file })
                          }}
                          placeholder="Paste your n8n workflow JSON here..."
                          error={getFieldError('jsonContent') || undefined}
                        />
                        {getFieldError('jsonContent') && (
                          <p className="text-xs text-red-500">{getFieldError('jsonContent')}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="n8nMinVersion">Minimum n8n Version *</Label>
                          <Input
                            id="n8nMinVersion"
                            name="n8nMinVersion"
                            value={formData.n8nMinVersion || ''}
                            onChange={(e) => setFormData({ ...formData, n8nMinVersion: e.target.value })}
                            onBlur={() => markFieldAsTouched('n8nMinVersion')}
                            placeholder="e.g., 1.0.0"
                            className={getFieldError('n8nMinVersion') ? 'border-red-500' : ''}
                            required
                          />
                          {getFieldError('n8nMinVersion') && (
                            <p className="text-xs text-red-500">{getFieldError('n8nMinVersion')}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Format: X.Y.Z (e.g., 1.0.0, 0.234.0)</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="n8nMaxVersion">Maximum n8n Version (Optional)</Label>
                          <Input
                            id="n8nMaxVersion"
                            name="n8nMaxVersion"
                            value={formData.n8nMaxVersion || ''}
                            onChange={(e) => setFormData({ ...formData, n8nMaxVersion: e.target.value })}
                            onBlur={() => markFieldAsTouched('n8nMaxVersion')}
                            placeholder="e.g., 1.99.99"
                            className={getFieldError('n8nMaxVersion') ? 'border-red-500' : ''}
                          />
                          {getFieldError('n8nMaxVersion') && (
                            <p className="text-xs text-red-500">{getFieldError('n8nMaxVersion')}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Format: X.Y.Z (e.g., 1.99.99) - Must be greater than minimum version
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Thumbnail Image</Label>
                          <div className="max-w-sm">
                            <ImageUpload
                              value={formData.heroImageUrl}
                              onChange={handleHeroImageUpload}
                              onRemove={handleHeroImageRemove}
                              disabled={isSubmitting || uploadingThumbnail}
                              maxSizeMB={2}
                              aspectRatio="thumbnail"
                              placeholder="Upload a thumbnail image (300x200px recommended)"
                              className="w-full"
                              key={`image-upload-${editingWorkflow?.id || 'new'}`}
                            />
                          </div>
                          {uploadingThumbnail && (
                            <p className="text-sm text-muted-foreground">Uploading thumbnail...</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Recommended: 300x200px (3:2 ratio) • Max 2MB • JPG, PNG, WebP
                            {formData.heroImageFile && formData.heroImageUrl.startsWith('blob:') && (
                              <span className="block text-orange-600 mt-1">
                                ⚠️ Image will be uploaded when you save the workflow
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Documentation *</Label>
                          <div className="max-w-sm">
                            <FileUpload
                              value={formData.documentationUrl}
                              onChange={handleDocumentationUpload}
                              onRemove={handleDocumentationRemove}
                              disabled={isSubmitting || uploadingDocumentation}
                              maxSizeMB={10}
                              acceptedTypes={['.pdf', '.docx', '.doc', '.txt', '.md', '.rtf']}
                              placeholder="Upload documentation (PDF, DOCX, etc.)"
                              className="w-full"
                              required={true}
                              selectedFile={formData.documentationFile}
                              hasError={!!getFieldError('documentationUrl')}
                              onBlur={() => markFieldAsTouched('documentationUrl')}
                              key={`doc-upload-${editingWorkflow?.id || 'new'}`}
                            />
                          </div>
                          {uploadingDocumentation && (
                            <p className="text-sm text-muted-foreground">Uploading documentation...</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Required • Max 10MB • PDF, DOCX, DOC, TXT, MD, RTF
                            {formData.documentationFile && formData.documentationUrl.startsWith('blob:') && (
                              <span className="block text-orange-600 mt-1">
                                ⚠️ Document will be uploaded when you save the workflow
                              </span>
                            )}
                          </p>
                          {getFieldError('documentationUrl') && (
                            <p className="text-xs text-red-500">{getFieldError('documentationUrl')}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as any,
                            })
                          }
                          onBlur={() => markFieldAsTouched('status')}
                          className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            getFieldError('status') ? 'border-red-500' : ''
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        {getFieldError('status') && <p className="text-xs text-red-500">{getFieldError('status')}</p>}
                      </div>

                      {/* Categories & Tags Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <MultiSelect
                            label="Categories *"
                            options={categories}
                            selected={formData.categoryIds || []}
                            onChange={(selected) => {
                              setFormData({ ...formData, categoryIds: selected })
                              markFieldAsTouched('categoryIds')
                            }}
                            placeholder="Select at least one category..."
                            disabled={categoriesLoading}
                            className="w-full"
                          />
                          {getFieldError('categoryIds') && (
                            <p className="text-xs text-red-500">{getFieldError('categoryIds')}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <MultiSelect
                            label="Tags *"
                            options={tags}
                            selected={formData.tagIds || []}
                            onChange={(selected) => {
                              setFormData({ ...formData, tagIds: selected })
                              markFieldAsTouched('tagIds')
                            }}
                            placeholder="Select at least one tag..."
                            disabled={tagsLoading}
                            className="w-full"
                          />
                          {getFieldError('tagIds') && <p className="text-xs text-red-500">{getFieldError('tagIds')}</p>}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={isSubmitting || !isFormValid} className="flex-1">
                          {isSubmitting ? 'Saving...' : editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            setShowCreateForm(false)
                            setEditingWorkflow(null)
                            setLoadingWorkflowData(false)
                            // Refresh workflows to show any changes made
                            await fetchWorkflows()
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
              {workflows
                .filter((workflow) => !editingWorkflow || workflow.id !== editingWorkflow.id)
                .map((workflow) => (
                  <Card key={workflow.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Thumbnail Preview */}
                          <div className="flex-shrink-0">
                            {workflow.heroImageUrl ? (
                              <div className="w-40 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                                <img
                                  src={workflow.heroImageUrl}
                                  alt={workflow.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    target.parentElement!.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                                              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                  `
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-40 h-32 rounded-lg bg-gray-100 border flex items-center justify-center">
                                <svg
                                  className="w-10 h-10 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  ></path>
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{workflow.title}</h3>
                              <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                            </div>
                            <p className="text-gray-600 mb-4">{workflow.shortDesc}</p>

                            {/* Categories and Tags */}
                            <div className="space-y-2 mb-4">
                              {workflow.categories && workflow.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {workflow.categories.map((cat: any) => (
                                    <Badge key={cat.category.id} variant="secondary" className="text-xs">
                                      {cat.category.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {workflow.tags && workflow.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {workflow.tags.map((tag: any) => (
                                    <Badge key={tag.tag.id} variant="outline" className="text-xs text-gray-500">
                                      #{tag.tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span>Price: {formatPrice(workflow.basePriceCents, workflow.currency)}</span>
                              <span>Sales: {workflow._count.orderItems}</span>
                              <span>Favorites: {workflow._count.favorites}</span>
                              <span>Reviews: {workflow._count.reviews}</span>
                              {workflow.versions && workflow.versions.length > 0 && workflow.versions[0] && (
                                <>
                                  {workflow.versions[0].n8nMinVersion && (
                                    <span>Min n8n: {workflow.versions[0].n8nMinVersion}</span>
                                  )}
                                  {workflow.versions[0].n8nMaxVersion && (
                                    <span>Max n8n: {workflow.versions[0].n8nMaxVersion}</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(workflow)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(workflow.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {workflows.length === 0 && !showCreateForm && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No workflows yet</h3>
                      <p className="text-gray-500">Get started by creating your first workflow.</p>
                      <Button onClick={() => setShowCreateForm(true)}>Create Your First Workflow</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SellerAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
