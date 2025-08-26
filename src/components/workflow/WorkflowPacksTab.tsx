'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { PlatformSelect } from '@/components/ui/platform-select'
import { MultiSelect } from '@/components/ui/multi-select'
import { WorkflowMultiSelect } from '@/components/ui/workflow-multi-select'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { usePagination } from '@/hooks/usePagination'
import { Package, Plus, Edit, Trash2, Eye, Star, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import type { Category, Tag } from '@/types/workflow'

// Types for workflow packs
interface WorkflowPack {
    id: string
    title: string
    slug: string
    shortDesc: string
    longDescMd?: string
    heroImageUrl?: string
    platform?: 'n8n' | 'zapier' | 'make' | 'airtable_script'
    status: 'draft' | 'published' | 'unlisted' | 'disabled'
    basePriceCents: number
    currency: string
    salesCount: number
    ratingAvg: number
    ratingCount: number
    createdAt: string
    updatedAt: string
    workflows: Array<{
        id: string
        workflowId: string
        sortOrder: number
        workflow: {
            id: string
            title: string
            shortDesc: string
            heroImageUrl?: string
            ratingAvg: number
            ratingCount: number
            salesCount: number
            basePriceCents: number
            currency: string
        }
    }>
    categories: Array<{
        category: {
            id: string
            name: string
            slug: string
        }
    }>
    tags: Array<{
        tag: {
            id: string
            name: string
            slug: string
        }
    }>
    _count: {
        reviews: number
        favorites: number
    }
}

interface WorkflowPackFormData {
    title: string
    shortDesc: string
    longDescMd: string
    platform?: 'n8n' | 'zapier' | 'make' | 'airtable_script'
    basePriceCents: number
    currency: string
    status: 'draft' | 'published' | 'unlisted' | 'disabled'
    categoryIds: string[]
    tagIds: string[]
    workflowIds: string[]
}

interface Workflow {
    id: string
    title: string
    shortDesc: string
    heroImageUrl?: string
    basePriceCents: number
    currency: string
    salesCount: number
    ratingAvg: number
    ratingCount: number
}

interface WorkflowPacksTabProps {
    categories: Category[]
    tags: Tag[]
    workflows: Workflow[]
    workflowPacks: WorkflowPack[]
    isLoadingPacks: boolean
    onTabChange?: (tab: string) => void
    onRefreshPacks?: () => void
}

export function WorkflowPacksTab({
    categories,
    tags,
    workflows,
    workflowPacks,
    isLoadingPacks,
    onTabChange,
    onRefreshPacks
}: WorkflowPacksTabProps) {
    const { user } = useAuth()
    const [showCreatePackForm, setShowCreatePackForm] = useState(false)
    const [editingPack, setEditingPack] = useState<WorkflowPack | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4 // Show 4 packs per page

    // Filter packs to exclude the one being edited
    const filteredPacks = workflowPacks.filter((pack) => !editingPack || pack.id !== editingPack.id)

    // Use pagination hook
    const {
        currentItems: paginatedPacks,
        currentPage: paginationPage,
        totalPages,
        goToPage,
    } = usePagination({
        items: filteredPacks,
        itemsPerPage,
        initialPage: currentPage,
    })

    // Update current page when pagination changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        goToPage(page)
    }
    const [packFormData, setPackFormData] = useState<WorkflowPackFormData>({
        title: '',
        shortDesc: '',
        longDescMd: '',
        platform: 'n8n',
        basePriceCents: 0,
        currency: 'EUR',
        status: 'draft',
        categoryIds: [],
        tagIds: [],
        workflowIds: [],
    })
    const [isSubmittingPack, setIsSubmittingPack] = useState(false)
    const [packDeleteModalOpen, setPackDeleteModalOpen] = useState(false)
    const [packToDelete, setPackToDelete] = useState<{ id: string; title: string } | null>(null)
    const [isDeletingPack, setIsDeletingPack] = useState(false)

    // Handle pack form submission
    const handlePackSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (packFormData.workflowIds.length === 0) {
            toast.error('Please select at least one workflow for the pack')
            return
        }

        if (packFormData.workflowIds.length > 10) {
            toast.error('Maximum 10 workflows allowed per pack')
            return
        }

        setIsSubmittingPack(true)
        try {
            const url = editingPack ? `/api/packs/${editingPack.id}` : '/api/packs'
            const method = editingPack ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packFormData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save workflow pack')
            }

            // Reset form and refresh packs
            setPackFormData({
                title: '',
                shortDesc: '',
                longDescMd: '',
                basePriceCents: 0,
                currency: 'EUR',
                status: 'draft',
                categoryIds: [],
                tagIds: [],
                workflowIds: [],
            })
            setShowCreatePackForm(false)
            setEditingPack(null)
            if (onRefreshPacks) {
                await onRefreshPacks()
            }

            toast.success(
                editingPack ? 'Workflow pack updated successfully!' : 'Workflow pack created successfully!',
                {
                    description: `"${packFormData.title}" has been ${editingPack ? 'updated' : 'added'} to your store.`,
                }
            )
        } catch (err: any) {
            toast.error('Failed to save workflow pack', {
                description: err.message,
            })
        } finally {
            setIsSubmittingPack(false)
        }
    }

    // Handle pack deletion
    const handlePackDeleteClick = (packId: string, packTitle: string) => {
        setPackToDelete({ id: packId, title: packTitle })
        setPackDeleteModalOpen(true)
    }

    const handlePackDeleteConfirm = async () => {
        if (!packToDelete) return

        setIsDeletingPack(true)
        try {
            const response = await fetch(`/api/packs/${packToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete workflow pack')
            }

            await onRefreshPacks?.()
            toast.success('Workflow pack deleted successfully!', {
                description: `"${packToDelete.title}" has been removed from your store.`,
            })
        } catch (err: any) {
            toast.error('Failed to delete workflow pack', {
                description: err.message,
            })
        } finally {
            setIsDeletingPack(false)
            setPackDeleteModalOpen(false)
            setPackToDelete(null)
        }
    }

    // Handle edit pack
    const handleEditPack = (pack: WorkflowPack) => {
        setEditingPack(pack)
        setPackFormData({
            title: pack.title,
            shortDesc: pack.shortDesc,
            longDescMd: pack.longDescMd || '',
            platform: pack.platform || 'n8n',
            basePriceCents: pack.basePriceCents,
            currency: pack.currency,
            status: pack.status,
            categoryIds: pack.categories.map(cat => cat.category.id),
            tagIds: pack.tags.map(tag => tag.tag.id),
            workflowIds: pack.workflows.map(w => w.workflowId),
        })
        setShowCreatePackForm(true)
    }

    // Handle create new pack
    const handleCreatePack = () => {
        setEditingPack(null)
        setPackFormData({
            title: '',
            shortDesc: '',
            longDescMd: '',
            platform: 'n8n',
            basePriceCents: 0,
            currency: 'EUR',
            status: 'draft',
            categoryIds: [],
            tagIds: [],
            workflowIds: [],
        })
        setShowCreatePackForm(true)
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
                return 'bg-muted text-gray-800'
            case 'disabled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-muted text-gray-800'
        }
    }

    // Human-friendly labels for statuses
    const STATUS_LABELS: Record<string, string> = {
        published: 'Published',
        draft: 'Draft',
        unlisted: 'Unlisted',
        disabled: 'Disabled',
        pack_only: 'Pack Only',
    }

    if (isLoadingPacks) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Your Workflow Packs</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-40 h-32 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                        <div className="flex space-x-2">
                                            {[1, 2, 3].map((j) => (
                                                <div key={j} className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Workflow Packs </h2>
                {!showCreatePackForm && (
                    <Button
                        onClick={handleCreatePack}
                        disabled={workflows.length === 0}
                        title={workflows.length === 0 ? "You need to create at least one workflow before creating a pack" : ""}
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Create New Pack
                    </Button>
                )}
            </div>

            {showCreatePackForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingPack ? 'Edit Workflow Pack' : 'Create New Workflow Pack'}</CardTitle>
                        <CardDescription>
                            {editingPack ? 'Update your workflow pack details' : 'Create a new pack with up to 10 workflows'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePackSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="packTitle">Pack Title *</Label>
                                <Input
                                    id="packTitle"
                                    value={packFormData.title}
                                    onChange={(e) => setPackFormData({ ...packFormData, title: e.target.value })}
                                    placeholder="Enter a descriptive title for your workflow pack..."
                                    required
                                />
                                <p className="text-xs text-muted-foreground">3-100 characters • Be descriptive and clear</p>
                            </div>

                            {/* Short Description */}
                            <div className="space-y-2">
                                <Label htmlFor="packShortDesc">Short Description *</Label>
                                <Textarea
                                    id="packShortDesc"
                                    value={packFormData.shortDesc}
                                    onChange={(e) => setPackFormData({ ...packFormData, shortDesc: e.target.value })}
                                    placeholder="Brief description of what this pack contains..."
                                    rows={3}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">10-200 characters • This appears in search results and cards</p>
                            </div>

                            {/* Platform */}
                            <PlatformSelect
                                value={packFormData.platform || 'n8n'}
                                onValueChange={(value) => setPackFormData({ ...packFormData, platform: value as any })}
                                placeholder="Select primary platform for this pack"
                                required
                            />

                            {/* Long Description */}
                            <div className="space-y-2">
                                <Label htmlFor="packLongDesc">Detailed Description (Optional)</Label>
                                <Textarea
                                    id="packLongDesc"
                                    value={packFormData.longDescMd}
                                    onChange={(e) => setPackFormData({ ...packFormData, longDescMd: e.target.value })}
                                    placeholder="Detailed explanation of the pack contents, setup instructions, requirements..."
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    50-5000 characters • Markdown supported • Include setup instructions and requirements
                                </p>
                            </div>

                            {/* Price and Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="packPrice">Price (€) *</Label>
                                    <Input
                                        id="packPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1000"
                                        value={(packFormData.basePriceCents / 100).toFixed(2)}
                                        onChange={(e) => {
                                            const price = parseFloat(e.target.value)
                                            const cents = isNaN(price) ? 0 : Math.round(price * 100)
                                            setPackFormData({ ...packFormData, basePriceCents: cents })
                                        }}
                                        placeholder="0.00"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">€0.00 - €1000.00 • Set to 0 for free packs</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="packCurrency">Currency</Label>
                                    <Select
                                        value={packFormData.currency || 'EUR'}
                                        onValueChange={(value) => setPackFormData({ ...packFormData, currency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Currency for pricing</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="packStatus">Status *</Label>
                                    <Select
                                        value={packFormData.status}
                                        onValueChange={(value) => setPackFormData({ ...packFormData, status: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="unlisted">Unlisted</SelectItem>
                                            <SelectItem value="disabled">Disabled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Draft: Private • Published: Public • Unlisted: Hidden from search • Disabled: Not available
                                    </p>
                                </div>
                            </div>

                            {/* Categories and Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Categories */}
                                <div className="space-y-2">
                                    <MultiSelect
                                        label="Categories *"
                                        options={categories}
                                        selected={packFormData.categoryIds || []}
                                        onChange={(selected) => {
                                            setPackFormData({
                                                ...packFormData,
                                                categoryIds: selected,
                                            })
                                        }}
                                        placeholder="Select at least one category..."
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Select categories that best describe your pack's purpose and functionality
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <MultiSelect
                                        label="Tags *"
                                        options={tags}
                                        selected={packFormData.tagIds || []}
                                        onChange={(selected) => {
                                            setPackFormData({
                                                ...packFormData,
                                                tagIds: selected,
                                            })
                                        }}
                                        placeholder="Select at least one tag..."
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Add relevant tags to help users discover your pack</p>
                                </div>
                            </div>

                            {/* Workflows Selection */}
                            <div className="space-y-2">
                                {workflows.length === 0 ? (
                                    <div className="border rounded-lg p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground">No workflows available</h3>
                                            <p className="text-muted-foreground">You need to create at least one workflow before creating a pack.</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowCreatePackForm(false)
                                                    setEditingPack(null)
                                                    // Navigate to workflows tab
                                                    onTabChange?.('workflows')
                                                    toast.info('Create your first workflow to create a pack')
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Your First Workflow
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <WorkflowMultiSelect
                                        label="Select Workflows * (Max 10)"
                                        workflows={workflows}
                                        selected={packFormData.workflowIds}
                                        onChange={(selected) => setPackFormData({ ...packFormData, workflowIds: selected })}
                                        placeholder="Select workflows to include in this pack..."
                                        maxSelection={10}
                                        className="w-full"
                                    />
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Select up to 10 workflows to include in this pack. Users will get access to all selected workflows.
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={isSubmittingPack}>
                                    {isSubmittingPack ? 'Saving...' : editingPack ? 'Update Pack' : 'Create Pack'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreatePackForm(false)
                                        setEditingPack(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Workflow Packs List */}
            <div className="grid grid-cols-1 gap-6">
                {paginatedPacks.map((pack) => (
                    <Card key={pack.id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4 flex-1">
                                    {/* Pack Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="w-40 h-32 rounded-lg bg-muted border flex items-center justify-center">
                                            <Package className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold">{pack.title}</h3>
                                            <Badge className={getStatusColor(pack.status)}>
                                                {STATUS_LABELS[pack.status] || pack.status}
                                            </Badge>
                                            {pack.platform && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {pack.platform}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground mb-4">{pack.shortDesc}</p>

                                        {/* Categories and Tags */}
                                        <div className="space-y-2 mb-4">
                                            {pack.categories && pack.categories.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {pack.categories.map((cat) => (
                                                        <Badge key={cat.category.id} variant="secondary" className="text-xs">
                                                            {cat.category.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {pack.tags && pack.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {pack.tags.map((tag) => (
                                                        <Badge key={tag.tag.id} variant="outline" className="text-xs text-muted-foreground">
                                                            #{tag.tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Pack Stats */}
                                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                            <span>Price: {formatPrice(pack.basePriceCents, pack.currency)}</span>
                                            <span>Workflows: {pack.workflows.length}/10</span>
                                            <span>Sales: {pack.salesCount}</span>
                                            <span>Favorites: {pack._count.favorites}</span>
                                            <span>Reviews: {pack._count.reviews}</span>
                                            {pack.ratingCount > 0 && (
                                                <span>★ {Number(pack.ratingAvg).toFixed(1)} ({pack.ratingCount})</span>
                                            )}
                                        </div>

                                        {/* Workflows in Pack */}
                                        {pack.workflows.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium mb-2">Workflows in this pack:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {pack.workflows.slice(0, 6).map((item) => (
                                                        <Badge key={item.id} variant="outline" className="text-xs">
                                                            {item.workflow.title}
                                                        </Badge>
                                                    ))}
                                                    {pack.workflows.length > 6 && (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                            +{pack.workflows.length - 6} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2 ml-4">
                                    <Button size="sm" variant="outline" onClick={() => handleEditPack(pack)}>
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handlePackDeleteClick(pack.id, pack.title)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredPacks.length === 0 && !showCreatePackForm && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="space-y-4">
                                <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No workflow packs yet</h3>
                                <p className="text-muted-foreground">
                                    {workflows.length === 0
                                        ? "You need to create at least one workflow before creating a pack."
                                        : "Create your first pack to bundle multiple workflows together."
                                    }
                                </p>
                                {workflows.length === 0 ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            onTabChange?.('workflows')
                                            toast.info('Redirecting to Workflows tab to create your first workflow')
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First Workflow
                                    </Button>
                                ) : (
                                    <Button onClick={handleCreatePack}>
                                        <Package className="w-4 h-4 mr-2" />
                                        Create Your First Pack
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            {filteredPacks.length > 0 && !showCreatePackForm && totalPages > 1 && (
                <PaginationControls
                    items={filteredPacks}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    className="mt-8"
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                open={packDeleteModalOpen}
                onOpenChange={setPackDeleteModalOpen}
                onConfirm={handlePackDeleteConfirm}
                title="Delete Workflow Pack"
                itemName={packToDelete?.title}
                isLoading={isDeletingPack}
            />
        </div>
    )
}
