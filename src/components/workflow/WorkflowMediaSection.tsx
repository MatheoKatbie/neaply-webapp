'use client'

import { FileUpload } from '@/components/ui/file-upload'
import { ImageUpload } from '@/components/ui/image-upload'
import { Label } from '@/components/ui/label'

interface WorkflowMediaSectionProps {
  heroImageUrl: string
  heroImageFile?: File
  documentationUrl: string
  documentationFile?: File
  status: string
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
}

export function WorkflowMediaSection({
  heroImageUrl,
  heroImageFile,
  documentationUrl,
  documentationFile,
  status,
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
}: WorkflowMediaSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thumbnail Image */}
        <div className="space-y-2">
          <Label>Thumbnail Image</Label>
          <div className="max-w-sm">
            <ImageUpload
              value={heroImageUrl}
              onChange={(file, previewUrl) => onHeroImageUpload(file, previewUrl)}
              onRemove={onHeroImageRemove}
              disabled={isSubmitting || uploadingThumbnail}
              maxSizeMB={2}
              aspectRatio="thumbnail"
              placeholder="Upload a thumbnail image (300x200px recommended)"
              className="w-full"
            />
          </div>
          {uploadingThumbnail && <p className="text-sm text-muted-foreground">Uploading thumbnail...</p>}
          <p className="text-xs text-muted-foreground">
            Recommended: 300x200px (3:2 ratio) • Max 2MB • JPG, PNG, WebP
            {heroImageFile && heroImageUrl.startsWith('blob:') && (
              <span className="block text-orange-600 mt-1">⚠️ Image will be uploaded when you save the workflow</span>
            )}
          </p>
        </div>

        {/* Documentation */}
        <div className="space-y-2">
          <Label className={touched.documentationUrl && errors.documentationUrl ? 'text-red-500' : ''}>
            Documentation
          </Label>
          <div className="max-w-sm">
            <FileUpload
              value={documentationUrl}
              onChange={(file, previewUrl) => onDocumentationUpload(file, previewUrl)}
              onRemove={onDocumentationRemove}
              disabled={isSubmitting || uploadingDocumentation}
              maxSizeMB={10}
              acceptedTypes={['.pdf', '.docx', '.doc', '.txt', '.md', '.rtf']}
              placeholder="Upload documentation (PDF, DOCX, etc.)"
              className="w-full"
              required={false}
              selectedFile={documentationFile}
              hasError={!!errors.documentationUrl}
              onBlur={() => onBlur('documentationUrl')}
            />
          </div>
          {uploadingDocumentation && <p className="text-sm text-muted-foreground">Uploading documentation...</p>}
          <p className="text-xs text-muted-foreground">
            Optional • Max 10MB • PDF, DOCX, DOC, TXT, MD, RTF
            {documentationFile && documentationUrl.startsWith('blob:') && (
              <span className="block text-orange-600 mt-1">
                ⚠️ Document will be uploaded when you save the workflow
              </span>
            )}
          </p>
          {touched.documentationUrl && errors.documentationUrl && (
            <p className="text-xs text-red-500">{errors.documentationUrl}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={status || 'draft'}
          onChange={(e) => onUpdate('status', e.target.value)}
          onBlur={() => onBlur('status')}
          className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.status ? 'border-red-500' : ''
            }`}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unlisted">Unlisted</option>
          <option value="disabled">Disabled</option>

        </select>
        {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
        <p className="text-xs text-muted-foreground">
          Draft: Only you can see it • Published: Available in marketplace • Unlisted: Hidden from search • Disabled:
          Temporarily unavailable
        </p>
      </div>
    </div>
  )
}
