'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { WorkflowBasicInfo } from './WorkflowBasicInfo'
import { WorkflowContentSection } from '@/components/workflow/WorkflowContentSection'
import { WorkflowPublishingSection } from '@/components/workflow/WorkflowPublishingSection'
import type { Category, Tag } from '@/types/workflow'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  platform?: string
  jsonContent?: any
  jsonFile?: File
  n8nMinVersion?: string
  n8nMaxVersion?: string
  zapierMinVersion?: string
  zapierMaxVersion?: string
  makeMinVersion?: string
  makeMaxVersion?: string
  airtableScriptMinVersion?: string
  airtableScriptMaxVersion?: string
  categoryIds?: string[]
  tagIds?: string[]
}

interface WorkflowFormProps {
  formData: WorkflowFormData
  onUpdate: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  onBlur: (field: string) => void
  isSubmitting: boolean
  isFormValid: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  categories: Category[]
  tags: Tag[]
  categoriesLoading: boolean
  tagsLoading: boolean
  uploadingThumbnail: boolean
  uploadingDocumentation: boolean
  onHeroImageUpload: (file: File | null, previewUrl?: string) => void
  onHeroImageRemove: () => void
  onDocumentationUpload: (file: File | null, previewUrl?: string) => void
  onDocumentationRemove: () => void
  editingWorkflow?: any
}

const tabs = ['basic', 'content', 'publishing'] as const

export function WorkflowForm({
  formData,
  onUpdate,
  errors,
  touched,
  onBlur,
  isSubmitting,
  isFormValid,
  onSubmit,
  onCancel,
  categories,
  tags,
  categoriesLoading,
  tagsLoading,
  uploadingThumbnail,
  uploadingDocumentation,
  onHeroImageUpload,
  onHeroImageRemove,
  onDocumentationUpload,
  onDocumentationRemove,
  editingWorkflow,
}: WorkflowFormProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const formRef = useRef<HTMLFormElement>(null)

  // Check if a tab is accessible based on form completion
  const isTabAccessible = (tabName: string) => {
    switch (tabName) {
      case 'basic':
        return true
      case 'content':
        return !!(formData.title && formData.shortDesc && formData.basePriceCents >= 0 && formData.platform)
      case 'publishing':
        return !!(formData.title && formData.shortDesc && formData.basePriceCents >= 0 && formData.platform && formData.jsonContent)
      default:
        return false
    }
  }

  // Get current tab index
  const currentTabIndex = tabs.indexOf(activeTab as (typeof tabs)[number])

  // Navigation functions
  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      const nextTab = tabs[currentTabIndex + 1]
      if (isTabAccessible(nextTab)) {
        setActiveTab(nextTab)
      }
    }
  }

  const goToPreviousTab = () => {
    if (currentTabIndex > 0) {
      const prevTab = tabs[currentTabIndex - 1]
      setActiveTab(prevTab)
    }
  }

  // Check if current tab is complete
  const isCurrentTabComplete = () => {
    switch (activeTab) {
      case 'basic':
        return !!(formData.title && formData.shortDesc && formData.basePriceCents >= 0 && formData.platform)
      case 'content':
        return !!(formData.platform && formData.jsonContent)
      case 'publishing':
        return !!(formData.categoryIds && formData.categoryIds.length > 0)
      default:
        return false
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {/* Error Display at Top */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <span className="font-medium">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</span> {error}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="text-xs">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs" disabled={!isTabAccessible('content')}>
            Workflow Content
          </TabsTrigger>
          <TabsTrigger value="publishing" className="text-xs" disabled={!isTabAccessible('publishing')}>
            Publishing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the essential details about your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowBasicInfo
                title={formData.title}
                shortDesc={formData.shortDesc}
                longDescMd={formData.longDescMd}
                basePriceCents={formData.basePriceCents}
                currency={formData.currency}
                platform={formData.platform || ''}
                onUpdate={onUpdate}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Content</CardTitle>
              <CardDescription>Upload your workflow JSON or code</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowContentSection
                platform={formData.platform || ''}
                jsonContent={formData.jsonContent}
                n8nMinVersion={formData.n8nMinVersion || ''}
                n8nMaxVersion={formData.n8nMaxVersion || ''}
                zapierMinVersion={formData.zapierMinVersion || ''}
                zapierMaxVersion={formData.zapierMaxVersion || ''}
                makeMinVersion={formData.makeMinVersion || ''}
                makeMaxVersion={formData.makeMaxVersion || ''}
                airtableScriptMinVersion={formData.airtableScriptMinVersion || ''}
                airtableScriptMaxVersion={formData.airtableScriptMaxVersion || ''}
                onUpdate={onUpdate}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>Add media, categories, and publish your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowPublishingSection
                heroImageUrl={formData.heroImageUrl}
                heroImageFile={formData.heroImageFile}
                documentationUrl={formData.documentationUrl}
                documentationFile={formData.documentationFile}
                status={formData.status}
                categoryIds={formData.categoryIds || []}
                tagIds={formData.tagIds || []}
                categories={categories}
                tags={tags}
                onUpdate={onUpdate}
                onHeroImageUpload={onHeroImageUpload}
                onHeroImageRemove={onHeroImageRemove}
                onDocumentationUpload={onDocumentationUpload}
                onDocumentationRemove={onDocumentationRemove}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
                isSubmitting={isSubmitting}
                uploadingThumbnail={uploadingThumbnail}
                uploadingDocumentation={uploadingDocumentation}
                categoriesLoading={categoriesLoading}
                tagsLoading={tagsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousTab}
            disabled={currentTabIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentTabIndex === tabs.length - 1 ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                if (Object.keys(errors).length > 0 && formRef.current) {
                  formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              {isSubmitting ? 'Saving...' : editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={goToNextTab}
              disabled={!isCurrentTabComplete()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {currentTabIndex + 1} of {tabs.length}
        </span>
        <span>
          Form completion: {Math.round(((tabs.length - Object.keys(errors).length) / tabs.length) * 100)}%
        </span>
      </div>
    </form>
  )
}
