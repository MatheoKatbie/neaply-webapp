'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JsonInput } from '@/components/ui/json-input'
import { WorkflowPreview } from '@/components/ui/workflow-preview'
import { WorkflowDiagram } from '@/components/ui/workflow-diagram'
import { MultiSelect } from '@/components/ui/multi-select'
import type { Category, Tag } from '@/types/workflow'

interface Workflow {
  id: string
  title: string
  slug: string
  shortDesc: string
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
    basePriceCents: 500, // €5.00 default
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

  // Redirect if not a seller
  useEffect(() => {
    if (!loading && (!user || !user.isSeller)) {
      router.push('/become-seller')
    }
  }, [user, loading, router])

  // Fetch workflows
  const fetchWorkflows = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/workflows')

      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }

      const data = await response.json()
      setWorkflows(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
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
  }

  // Fetch tags
  const fetchTags = async () => {
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
  }

  useEffect(() => {
    if (user?.isSeller) {
      fetchWorkflows()
      fetchCategories()
      fetchTags()
    }
  }, [user])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const url = editingWorkflow ? `/api/workflows/${editingWorkflow.id}` : '/api/workflows'
      const method = editingWorkflow ? 'PUT' : 'POST'

      // Nettoyer les données avant l'envoi
      const cleanFormData = {
        ...formData,
        longDescMd: formData.longDescMd.trim() || undefined,
        heroImageUrl: formData.heroImageUrl.trim() || undefined,
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
        basePriceCents: 500,
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
      await fetchWorkflows()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle workflow deletion
  const handleDelete = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete workflow')
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
    setEditingWorkflow(workflow)
    setShowCreateForm(true)

    // Fetch full details
    const fullWorkflow = await fetchWorkflowDetails(workflow.id)
    if (fullWorkflow) {
      const latestVersion = fullWorkflow.versions?.[0]
      setFormData({
        title: fullWorkflow.title,
        shortDesc: fullWorkflow.shortDesc,
        longDescMd: fullWorkflow.longDescMd || '',
        heroImageUrl: fullWorkflow.heroImageUrl || '',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading your seller dashboard...</div>
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
                        <div>
                          <h3 className="font-medium">{workflow.title}</h3>
                          <p className="text-sm text-gray-500">{workflow.shortDesc}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                            <span className="text-sm text-gray-500">{workflow._count.orderItems} sales</span>
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
              <Button
                onClick={() => {
                  setEditingWorkflow(null)
                  setFormData({
                    title: '',
                    shortDesc: '',
                    longDescMd: '',
                    heroImageUrl: '',
                    basePriceCents: 500,
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
                }}
              >
                Add New Workflow
              </Button>
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Advanced Email Automation"
                          required
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="basePriceCents">Price (€) *</Label>
                        <Input
                          id="basePriceCents"
                          name="basePriceCents"
                          type="number"
                          min="1"
                          max="1000"
                          step="0.01"
                          value={formData.basePriceCents / 100}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              basePriceCents: Math.round(parseFloat(e.target.value || '0') * 100),
                            })
                          }
                          placeholder="5.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDesc">Short Description *</Label>
                      <Input
                        id="shortDesc"
                        name="shortDesc"
                        value={formData.shortDesc}
                        onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                        placeholder="Brief description of your workflow..."
                        required
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500">{formData.shortDesc.length}/200 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longDescMd">Detailed Description</Label>
                      <textarea
                        id="longDescMd"
                        name="longDescMd"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.longDescMd}
                        onChange={(e) => setFormData({ ...formData, longDescMd: e.target.value })}
                        placeholder="Detailed description with features, requirements, etc..."
                        maxLength={5000}
                        rows={6}
                      />
                      <p className="text-xs text-gray-500">
                        {formData.longDescMd.length}/5000 characters. Supports markdown.
                      </p>
                    </div>

                    {/* JSON Workflow Input */}
                    <JsonInput
                      value={formData.jsonContent}
                      onChange={(jsonContent, isValid) => {
                        setFormData({ ...formData, jsonContent })
                      }}
                      onFileSelect={(file) => {
                        setFormData({ ...formData, jsonFile: file })
                      }}
                      placeholder="Paste your n8n workflow JSON here..."
                    />

                    {/* Workflow Preview */}
                    {formData.jsonContent && (
                      <div className="space-y-4">
                        <Tabs defaultValue="diagram" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="diagram">Visual Diagram</TabsTrigger>
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                          </TabsList>
                          <TabsContent value="diagram">
                            <WorkflowDiagram workflow={formData.jsonContent} />
                          </TabsContent>
                          <TabsContent value="analysis">
                            <WorkflowPreview workflow={formData.jsonContent} />
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="n8nMinVersion">Minimum n8n Version</Label>
                        <Input
                          id="n8nMinVersion"
                          name="n8nMinVersion"
                          value={formData.n8nMinVersion || ''}
                          onChange={(e) => setFormData({ ...formData, n8nMinVersion: e.target.value })}
                          placeholder="e.g., 1.0.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="n8nMaxVersion">Maximum n8n Version</Label>
                        <Input
                          id="n8nMaxVersion"
                          name="n8nMaxVersion"
                          value={formData.n8nMaxVersion || ''}
                          onChange={(e) => setFormData({ ...formData, n8nMaxVersion: e.target.value })}
                          placeholder="e.g., 1.99.99"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                        <Input
                          id="heroImageUrl"
                          name="heroImageUrl"
                          type="url"
                          value={formData.heroImageUrl}
                          onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
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
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>

                    {/* Categories & Tags Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <MultiSelect
                        label="Categories"
                        options={categories}
                        selected={formData.categoryIds || []}
                        onChange={(selected) => setFormData({ ...formData, categoryIds: selected })}
                        placeholder="Select categories..."
                        disabled={categoriesLoading}
                        className="w-full"
                      />

                      <MultiSelect
                        label="Tags"
                        options={tags}
                        selected={formData.tagIds || []}
                        onChange={(selected) => setFormData({ ...formData, tagIds: selected })}
                        placeholder="Select tags..."
                        disabled={tagsLoading}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? 'Saving...' : editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false)
                          setEditingWorkflow(null)
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
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
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Performance</CardTitle>
                <CardDescription>Track your workflow performance and sales metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-500">
                    We're working on detailed analytics to help you track your workflow performance, sales trends, and
                    customer insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
