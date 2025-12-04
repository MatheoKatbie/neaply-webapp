'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Upload,
  Trash2,
  ImageIcon,
  Loader2,
  Store,
  Camera,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoreAssetsData {
  logoUrl: string | null
  bannerUrl: string | null
  storeName: string
  storeSlug: string
}

interface StoreCustomizationProps {
  initialData: StoreAssetsData
  onUpdate?: (data: Partial<StoreAssetsData>) => void
}

export function StoreCustomization({ initialData, onUpdate }: StoreCustomizationProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData.logoUrl)
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialData.bannerUrl)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [deletingLogo, setDeletingLogo] = useState(false)
  const [deletingBanner, setDeletingBanner] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'banner',
    setUploading: (v: boolean) => void,
    setUrl: (v: string | null) => void
  ) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, GIF, or WebP.')
      return
    }

    // Validate file size
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    const maxSizeLabel = type === 'logo' ? '2MB' : '5MB'
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeLabel}`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload/store-assets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setUrl(data.url)
      onUpdate?.({ [type === 'logo' ? 'logoUrl' : 'bannerUrl']: data.url })
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (
    type: 'logo' | 'banner',
    setDeleting: (v: boolean) => void,
    setUrl: (v: string | null) => void
  ) => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/upload/store-assets?type=${type}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      setUrl(null)
      onUpdate?.({ [type === 'logo' ? 'logoUrl' : 'bannerUrl']: null })
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} deleted successfully!`)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  // Generate a preview for the store based on current settings
  const generatePlaceholderBanner = () => {
    const hash = initialData.storeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue1 = (hash * 137.5) % 360
    const hue2 = (hue1 + 60) % 360
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 65%), hsl(${hue2}, 60%, 70%))`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#EDEFF7] font-aeonikpro">
            Store Customization
          </h2>
          <p className="text-sm text-[#9DA2B3] mt-1">
            Customize your store's appearance with a logo and banner image.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="gap-2"
        >
          <Link href={`/store/${initialData.storeSlug}`} target="_blank">
            <Store className="w-4 h-4" />
            View my store
            <ExternalLink className="w-3 h-3" />
          </Link>
        </Button>
      </div>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-[#9DA2B3]/15" style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}>
        <p className="text-xs text-[#9DA2B3] px-4 py-2 border-b border-[#9DA2B3]/15">
          Store Preview
        </p>
        
        {/* Banner Preview */}
        <div className="relative h-40 overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Store banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: generatePlaceholderBanner() }}
            />
          )}
          
          {/* Logo overlay */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-20 h-20 rounded-xl border-4 border-[#08080A] overflow-hidden bg-[#1A1A1D]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Store logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#40424D] to-[#2A2A2D]">
                  <Store className="w-8 h-8 text-[#9DA2B3]" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Store name preview */}
        <div className="pt-12 pb-4 px-6">
          <h3 className="text-lg font-semibold text-[#EDEFF7] font-aeonikpro">
            {initialData.storeName}
          </h3>
        </div>
      </div>

      {/* Upload sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="rounded-xl border border-[#9DA2B3]/15 p-5" style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#40424D]/50 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#9DA2B3]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#EDEFF7]">Store Logo</h3>
              <p className="text-xs text-[#9DA2B3]">Square image, max 2MB</p>
            </div>
          </div>

          {/* Current logo preview */}
          <div className="mb-4">
            <div className="w-24 h-24 rounded-xl border border-[#9DA2B3]/15 overflow-hidden bg-[#1A1A1D]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Current logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#9DA2B3]/50" />
                </div>
              )}
            </div>
          </div>

          {/* Upload/Delete buttons */}
          <div className="flex gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file, 'logo', setUploadingLogo, setLogoUrl)
                }
                e.target.value = ''
              }}
            />
            
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#40424D] text-[#EDEFF7] hover:bg-[#50525D] transition-colors disabled:opacity-50 text-sm"
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{logoUrl ? 'Change' : 'Upload'}</span>
                </>
              )}
            </button>

            {logoUrl && (
              <button
                onClick={() => handleDelete('logo', setDeletingLogo, setLogoUrl)}
                disabled={deletingLogo}
                className="flex items-center justify-center p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                title="Delete logo"
              >
                {deletingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Recommendations */}
          <div className="mt-3 flex items-start gap-2 text-xs text-[#9DA2B3]">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Recommended: 400x400px, JPG/PNG format</span>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="rounded-xl border border-[#9DA2B3]/15 p-5" style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#40424D]/50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#9DA2B3]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#EDEFF7]">Store Banner</h3>
              <p className="text-xs text-[#9DA2B3]">Wide image, max 5MB</p>
            </div>
          </div>

          {/* Current banner preview */}
          <div className="mb-4">
            <div className="w-full h-24 rounded-xl border border-[#9DA2B3]/15 overflow-hidden bg-[#1A1A1D]">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Current banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: generatePlaceholderBanner() }}
                >
                  <span className="text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
                    Default gradient
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload/Delete buttons */}
          <div className="flex gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file, 'banner', setUploadingBanner, setBannerUrl)
                }
                e.target.value = ''
              }}
            />
            
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#40424D] text-[#EDEFF7] hover:bg-[#50525D] transition-colors disabled:opacity-50 text-sm"
            >
              {uploadingBanner ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{bannerUrl ? 'Change' : 'Upload'}</span>
                </>
              )}
            </button>

            {bannerUrl && (
              <button
                onClick={() => handleDelete('banner', setDeletingBanner, setBannerUrl)}
                disabled={deletingBanner}
                className="flex items-center justify-center p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                title="Delete banner"
              >
                {deletingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Recommendations */}
          <div className="mt-3 flex items-start gap-2 text-xs text-[#9DA2B3]">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Recommended: 1920x400px, JPG/PNG format</span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  Upload,
  Trash2,
  ImageIcon,
  Loader2,
  Store,
  Camera,
  AlertCircle,
} from 'lucide-react'

interface StoreAssetsData {
  logoUrl: string | null
  bannerUrl: string | null
  storeName: string
}

interface StoreCustomizationProps {
  initialData: StoreAssetsData
  onUpdate?: (data: Partial<StoreAssetsData>) => void
}

export function StoreCustomization({ initialData, onUpdate }: StoreCustomizationProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData.logoUrl)
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialData.bannerUrl)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [deletingLogo, setDeletingLogo] = useState(false)
  const [deletingBanner, setDeletingBanner] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'banner',
    setUploading: (v: boolean) => void,
    setUrl: (v: string | null) => void
  ) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, GIF, or WebP.')
      return
    }

    // Validate file size
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    const maxSizeLabel = type === 'logo' ? '2MB' : '5MB'
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeLabel}`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload/store-assets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setUrl(data.url)
      onUpdate?.({ [type === 'logo' ? 'logoUrl' : 'bannerUrl']: data.url })
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (
    type: 'logo' | 'banner',
    setDeleting: (v: boolean) => void,
    setUrl: (v: string | null) => void
  ) => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/upload/store-assets?type=${type}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      setUrl(null)
      onUpdate?.({ [type === 'logo' ? 'logoUrl' : 'bannerUrl']: null })
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} deleted successfully!`)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  // Generate a preview for the store based on current settings
  const generatePlaceholderBanner = () => {
    const hash = initialData.storeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue1 = (hash * 137.5) % 360
    const hue2 = (hue1 + 60) % 360
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 65%), hsl(${hue2}, 60%, 70%))`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#EDEFF7] font-aeonikpro">
          Store Customization
        </h2>
        <p className="text-sm text-[#9DA2B3] mt-1">
          Customize your store's appearance with a logo and banner image.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-[#9DA2B3]/15" style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}>
        <p className="text-xs text-[#9DA2B3] px-4 py-2 border-b border-[#9DA2B3]/15">
          Store Preview
        </p>
        
        {/* Banner Preview */}
        <div className="relative h-40 overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Store banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: generatePlaceholderBanner() }}
            />
          )}
          
          {/* Logo overlay */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-20 h-20 rounded-xl border-4 border-[#08080A] overflow-hidden bg-[#1A1A1D]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Store logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#40424D] to-[#2A2A2D]">
                  <Store className="w-8 h-8 text-[#9DA2B3]" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Store name preview */}
        <div className="pt-12 pb-4 px-6">
          <h3 className="text-lg font-semibold text-[#EDEFF7] font-aeonikpro">
            {initialData.storeName}
          </h3>
        </div>
      </div>

      {/* Upload sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="rounded-xl border border-[#9DA2B3]/15 p-5" style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#40424D]/50 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#9DA2B3]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#EDEFF7]">Store Logo</h3>
              <p className="text-xs text-[#9DA2B3]">Square image, max 2MB</p>
            </div>
          </div>

          {/* Current logo preview */}
          <div className="mb-4">
            <div className="w-24 h-24 rounded-xl border border-[#9DA2B3]/15 overflow-hidden bg-[#1A1A1D]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Current logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#9DA2B3]/50" />
                </div>
              )}
            </div>
          </div>

          {/* Upload/Delete buttons */}
          <div className="flex gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file, 'logo', setUploadingLogo, setLogoUrl)
                }
                e.target.value = ''
              }}
            />
            
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#40424D] text-[#EDEFF7] hover:bg-[#50525D] transition-colors disabled:opacity-50 text-sm"
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{logoUrl ? 'Change' : 'Upload'}</span>
                </>
              )}
            </button>

            {logoUrl && (
              <button
                onClick={() => handleDelete('logo', setDeletingLogo, setLogoUrl)}
                disabled={deletingLogo}
                className="flex items-center justify-center p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                title="Delete logo"
              >
                {deletingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Recommendations */}
          <div className="mt-3 flex items-start gap-2 text-xs text-[#9DA2B3]">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Recommended: 400x400px, JPG/PNG format</span>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="rounded-xl border border-[#9DA2B3]/15 p-5" style={{ backgroundColor: 'rgba(64, 66, 77, 0.15)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#40424D]/50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#9DA2B3]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#EDEFF7]">Store Banner</h3>
              <p className="text-xs text-[#9DA2B3]">Wide image, max 5MB</p>
            </div>
          </div>

          {/* Current banner preview */}
          <div className="mb-4">
            <div className="w-full h-24 rounded-xl border border-[#9DA2B3]/15 overflow-hidden bg-[#1A1A1D]">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Current banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: generatePlaceholderBanner() }}
                >
                  <span className="text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
                    Default gradient
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload/Delete buttons */}
          <div className="flex gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file, 'banner', setUploadingBanner, setBannerUrl)
                }
                e.target.value = ''
              }}
            />
            
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#40424D] text-[#EDEFF7] hover:bg-[#50525D] transition-colors disabled:opacity-50 text-sm"
            >
              {uploadingBanner ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{bannerUrl ? 'Change' : 'Upload'}</span>
                </>
              )}
            </button>

            {bannerUrl && (
              <button
                onClick={() => handleDelete('banner', setDeletingBanner, setBannerUrl)}
                disabled={deletingBanner}
                className="flex items-center justify-center p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                title="Delete banner"
              >
                {deletingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Recommendations */}
          <div className="mt-3 flex items-start gap-2 text-xs text-[#9DA2B3]">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Recommended: 1920x400px, JPG/PNG format</span>
          </div>
        </div>
      </div>
    </div>
  )
}
