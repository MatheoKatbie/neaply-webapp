'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkflowBasicInfo } from './WorkflowBasicInfo'
import { WorkflowPlatformSection } from './WorkflowPlatformSection'
import { WorkflowMediaSection } from './WorkflowMediaSection'
import { WorkflowCategoriesSection } from './WorkflowCategoriesSection'
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

const tabs = ['basic', 'platform', 'media', 'categories'] as const

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

  // Check if a tab is accessible based on form completion
  const isTabAccessible = (tabName: string) => {
    switch (tabName) {
      case 'basic':
        return true
      case 'platform':
        return !!(formData.title && formData.shortDesc && formData.basePriceCents >= 0)
      case 'media':
        // Check if platform is selected and content exists and is valid
        if (!formData.platform || !formData.jsonContent) {
          return false
        }

        // For Airtable Script, check if it's a valid string
        if (formData.platform === 'airtable_script') {
          return typeof formData.jsonContent === 'string' && formData.jsonContent.trim().length > 0
        }

        // For other platforms, check if it's a valid JSON object
        return typeof formData.jsonContent === 'object' && formData.jsonContent !== null
      case 'categories':
        return !!formData.documentationUrl
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
        return !!(formData.title && formData.shortDesc && formData.basePriceCents >= 0)
      case 'platform':
        // Check if platform is selected and JSON content exists
        if (!formData.platform || !formData.jsonContent) {
          return false
        }

        // For Airtable Script, check if it's a string (JavaScript code)
        if (formData.platform === 'airtable_script') {
          return typeof formData.jsonContent === 'string' && formData.jsonContent.trim().length > 0
        }

        // For other platforms, check if it's a valid JSON object
        return typeof formData.jsonContent === 'object' && formData.jsonContent !== null
      case 'media':
        return !!formData.documentationUrl
      case 'categories':
        return !!(
          formData.categoryIds &&
          formData.categoryIds.length > 0 &&
          formData.tagIds &&
          formData.tagIds.length > 0
        )
      default:
        return false
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="text-xs">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="platform" className="text-xs" disabled={!isTabAccessible('platform')}>
            Platform & JSON
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs" disabled={!isTabAccessible('media')}>
            Media & Status
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs" disabled={!isTabAccessible('categories')}>
            Categories & Tags
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
                onUpdate={onUpdate}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform & Workflow</CardTitle>
              <CardDescription>Select your platform and upload the workflow JSON</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowPlatformSection
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

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media & Status</CardTitle>
              <CardDescription>Upload images and documentation, set workflow status</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowMediaSection
                heroImageUrl={formData.heroImageUrl}
                heroImageFile={formData.heroImageFile}
                documentationUrl={formData.documentationUrl}
                documentationFile={formData.documentationFile}
                status={formData.status}
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
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
              <CardDescription>Help users discover your workflow with proper categorization</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowCategoriesSection
                categoryIds={formData.categoryIds || []}
                tagIds={formData.tagIds || []}
                categories={categories}
                tags={tags}
                onUpdate={onUpdate}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
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

          <Button
            type="button"
            variant="outline"
            onClick={goToNextTab}
            disabled={currentTabIndex === tabs.length - 1 || !isCurrentTabComplete()}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? 'Saving...' : editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {currentTabIndex + 1} of {tabs.length}
        </span>
        <span>
          {Object.keys(errors).length > 0 && (
            <span className="text-red-500">
              {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} to fix
            </span>
          )}
        </span>
      </div>
    </form>
  )
}
