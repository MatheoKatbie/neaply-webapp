'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkflowForm } from '@/components/workflow/WorkflowForm'
import { WorkflowCard } from '@/components/workflow/WorkflowCard'
import type { Category, Tag, Workflow } from '@/types/workflow'
import type { WorkflowFormData } from '@/hooks/useFormValidation'

interface SellerWorkflowsTabProps {
    workflows: Workflow[]
    showCreateForm: boolean
    editingWorkflow: Workflow | null
    loadingWorkflowData: boolean
    formData: WorkflowFormData
    errors: Record<string, string>
    touched: Record<string, boolean>
    isSubmitting: boolean
    isFormValid: boolean
    categories: Category[]
    tags: Tag[]
    categoriesLoading: boolean
    tagsLoading: boolean
    uploadingThumbnail: boolean
    uploadingDocumentation: boolean
    onUpdateFormData: (field: string, value: any) => void
    onMarkFieldAsTouched: (field: string) => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    onEdit: (workflow: Workflow) => void
    onDelete: (workflowId: string, workflowTitle: string) => void
    onHeroImageUpload: (file: File | null, previewUrl?: string) => void
    onHeroImageRemove: () => void
    onDocumentationUpload: (file: File | null, previewUrl?: string) => void
    onDocumentationRemove: () => void
    onCreateWorkflow: () => void
}

export function SellerWorkflowsTab({
    workflows,
    showCreateForm,
    editingWorkflow,
    loadingWorkflowData,
    formData,
    errors,
    touched,
    isSubmitting,
    isFormValid,
    categories,
    tags,
    categoriesLoading,
    tagsLoading,
    uploadingThumbnail,
    uploadingDocumentation,
    onUpdateFormData,
    onMarkFieldAsTouched,
    onSubmit,
    onCancel,
    onEdit,
    onDelete,
    onHeroImageUpload,
    onHeroImageRemove,
    onDocumentationUpload,
    onDocumentationRemove,
    onCreateWorkflow,
}: SellerWorkflowsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Workflows</h2>
                {!showCreateForm && (
                    <Button onClick={onCreateWorkflow}>
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

                                {/* Zapier Versions skeleton */}
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

                                {/* Make Versions skeleton */}
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

                                {/* Airtable Script Versions skeleton */}
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
                            <WorkflowForm
                                formData={formData}
                                onUpdate={onUpdateFormData}
                                errors={errors}
                                touched={touched}
                                onBlur={onMarkFieldAsTouched}
                                isSubmitting={isSubmitting}
                                isFormValid={isFormValid}
                                onSubmit={onSubmit}
                                onCancel={onCancel}
                                categories={categories}
                                tags={tags}
                                categoriesLoading={categoriesLoading}
                                tagsLoading={tagsLoading}
                                uploadingThumbnail={uploadingThumbnail}
                                uploadingDocumentation={uploadingDocumentation}
                                onHeroImageUpload={onHeroImageUpload}
                                onHeroImageRemove={onHeroImageRemove}
                                onDocumentationUpload={onDocumentationUpload}
                                onDocumentationRemove={onDocumentationRemove}
                                editingWorkflow={editingWorkflow}
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
                {workflows
                    .filter((workflow) => !editingWorkflow || workflow.id !== editingWorkflow.id)
                    .map((workflow) => (
                        <WorkflowCard
                            key={workflow.id}
                            workflow={workflow}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isEditing={editingWorkflow?.id === workflow.id}
                        />
                    ))}

                {workflows.length === 0 && !showCreateForm && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="space-y-4">
                                <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No workflows yet</h3>
                                <p className="text-muted-foreground">Get started by creating your first workflow.</p>
                                <Button onClick={onCreateWorkflow}>Create Your First Workflow</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
