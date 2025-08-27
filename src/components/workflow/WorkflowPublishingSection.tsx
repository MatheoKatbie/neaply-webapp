'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { CategorySelect } from '@/components/ui/category-select'
import { TagSelect } from '@/components/ui/tag-select'
import { FileUpload } from '@/components/ui/file-upload'
import { Info, Upload, X } from 'lucide-react'
import { useState } from 'react'
import type { Category, Tag } from '@/types/workflow'

interface WorkflowPublishingSectionProps {
  heroImageUrl: string
  heroImageFile?: File
  documentationUrl: string
  documentationFile?: File
  status: 'draft' | 'published' | 'unlisted' | 'disabled'
  categoryIds: string[]
  tagIds: string[]
  categories: Category[]
  tags: Tag[]
  onUpdate: (field: string, value: any) => void
  onHeroImageUpload: (file: File | null, previewUrl?: string) => void
  onHeroImageRemove: () => void
  onDocumentationUpload: (file: File | null, previewUrl?: string) => void
  onDocumentationRemove: () => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  onBlur: (field: string) => void
  isSubmitting: boolean
  uploadingThumbnail: boolean
  uploadingDocumentation: boolean
  categoriesLoading: boolean
  tagsLoading: boolean
}

export function WorkflowPublishingSection({
  heroImageUrl,
  heroImageFile,
  documentationUrl,
  documentationFile,
  status,
  categoryIds,
  tagIds,
  categories,
  tags,
  onUpdate,
  onHeroImageUpload,
  onHeroImageRemove,
  onDocumentationUpload,
  onDocumentationRemove,
  errors,
  touched,
  onBlur,
  isSubmitting,
  uploadingThumbnail,
  uploadingDocumentation,
  categoriesLoading,
  tagsLoading,
}: WorkflowPublishingSectionProps) {
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  return (
    <div className="space-y-6">
      {/* Status Selection */}
      <div className="space-y-2">
        <Label htmlFor="status" className={touched.status && errors.status ? 'text-red-500' : ''}>
          Workflow Status *
        </Label>
        <Select
          value={status}
          onValueChange={(value) => {
            onUpdate('status', value)
            if (!touched.status) {
              onBlur('status')
            }
          }}
        >
          <SelectTrigger className={touched.status && errors.status ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select workflow status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft - Save for later</SelectItem>
            <SelectItem value="published">Published - Make available for purchase</SelectItem>
            <SelectItem value="unlisted">Unlisted - Only available via direct link</SelectItem>
          </SelectContent>
        </Select>
        {touched.status && errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
      </div>

      {/* Categories - Required */}
      <div className="space-y-2">
        <Label className={touched.categoryIds && errors.categoryIds ? 'text-red-500' : ''}>
          Categories *
        </Label>
        {categoriesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <CategorySelect
            value={categoryIds}
            onValueChange={(selectedCategories) => {
              onUpdate('categoryIds', selectedCategories)
              if (!touched.categoryIds) {
                onBlur('categoryIds')
              }
            }}
            categories={categories}
            placeholder="Select categories..."
            error={errors.categoryIds}
            required={true}
          />
        )}
        {touched.categoryIds && errors.categoryIds && <p className="text-xs text-red-500">{errors.categoryIds}</p>}
        <p className="text-xs text-muted-foreground">Select at least one category to help users find your workflow</p>
      </div>

      {/* Hero Image - Optional but recommended */}
      <div className="space-y-2">
        <Label htmlFor="heroImage" className={touched.heroImageUrl && errors.heroImageUrl ? 'text-red-500' : ''}>
          Hero Image (Optional)
        </Label>
        <div className="space-y-4">
          {heroImageUrl ? (
            <div className="relative">
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onHeroImageRemove}
                disabled={uploadingThumbnail}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <ImageUpload
              value={heroImageUrl}
              onChange={(file, url) => {
                onHeroImageUpload(file);
                if (file) onUpdate('heroImageFile', file);
                if (url) onUpdate('heroImageUrl', url);
              }}
              placeholder="Upload hero image or paste URL"
              maxSizeMB={5}
            />
          )}
          {touched.heroImageUrl && errors.heroImageUrl && <p className="text-xs text-red-500">{errors.heroImageUrl}</p>}
          <p className="text-xs text-muted-foreground">
            Recommended: 1200x630px image. Will be displayed on your workflow page.
          </p>
        </div>
      </div>

      {/* Optional Fields Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Additional Settings</Label>
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showOptionalFields ? 'Hide' : 'Show'} optional fields
        </button>
      </div>

      {/* Optional Fields */}
      {showOptionalFields && (
        <div className="space-y-6 border-l-2 border-gray-200 pl-4">
          {/* Tags - Optional */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            {tagsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <TagSelect
                value={tagIds}
                onValueChange={(selectedTags) => {
                  onUpdate('tagIds', selectedTags)
                  if (!touched.tagIds) {
                    onBlur('tagIds')
                  }
                }}
                tags={tags}
                placeholder="Add tags to improve discoverability..."
                error={errors.tagIds}
              />
            )}
            {touched.tagIds && errors.tagIds && <p className="text-xs text-red-500">{errors.tagIds}</p>}
            <p className="text-xs text-muted-foreground">Add relevant tags to help users find your workflow</p>
          </div>

          {/* Documentation - Optional */}
          <div className="space-y-2">
            <Label htmlFor="documentation" className={touched.documentationUrl && errors.documentationUrl ? 'text-red-500' : ''}>
              Documentation (Optional)
            </Label>
            <div className="space-y-4">
              {documentationUrl ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documentation uploaded</p>
                    <p className="text-xs text-muted-foreground">{documentationUrl}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDocumentationRemove}
                    disabled={uploadingDocumentation}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <FileUpload
                  value={documentationUrl}
                  onChange={(file, url) => {
                    onDocumentationUpload(file);
                    if (file) onUpdate('documentationFile', file);
                    if (url) onUpdate('documentationUrl', url);
                  }}
                  placeholder="Upload documentation file or paste URL"
                  maxSizeMB={10}
                  acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.md']}
                />
              )}
              {touched.documentationUrl && errors.documentationUrl && (
                <p className="text-xs text-red-500">{errors.documentationUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload documentation to help users understand and use your workflow
              </p>
            </div>
          </div>


        </div>
      )}

      {/* Publishing Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Publishing Guidelines:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• Ensure your workflow has a clear title and description</li>
            <li>• Upload a hero image to make your workflow stand out</li>
            <li>• Select appropriate categories and tags for discoverability</li>
            <li>• Test your workflow before publishing</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
