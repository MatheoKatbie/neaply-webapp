'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

interface ImageUploadProps {
  value?: string // Current image URL
  onChange: (file: File | null, url?: string) => void
  onRemove?: () => void
  className?: string
  disabled?: boolean
  maxSizeMB?: number
  aspectRatio?: 'square' | 'video' | 'auto' | 'thumbnail'
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  disabled = false,
  maxSizeMB = 2,
  aspectRatio = 'auto',
  placeholder = 'Drag and drop an image here, or click to select',
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        return `File size must be less than ${maxSizeMB}MB`
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return 'Only JPG, PNG, GIF, and WebP files are allowed'
      }

      return null
    },
    [maxSizeMB]
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null)

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      onChange(file, previewUrl)
    },
    [onChange, validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith('image/'))

      if (imageFile) {
        handleFileSelect(imageFile)
      } else {
        setError('Please drop a valid image file')
      }
    },
    [disabled, handleFileSelect]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
        // Reset input to allow uploading the same file again
        e.target.value = ''
      }
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(() => {
    setError(null)
    onChange(null)
    onRemove?.()
  }, [onChange, onRemove])

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case 'thumbnail':
        return 'aspect-[3/2]' // Perfect for thumbnails (300x200px)
      case 'auto':
        return '' // No fixed aspect ratio, height will be determined by content or min-height
      default:
        return 'aspect-[3/2]' // Default to thumbnail ratio
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          getAspectRatioClass(),
          'min-h-[120px] flex items-center justify-center cursor-pointer',
          {
            'border-primary bg-primary/5': isDragOver && !disabled,
            'border-border hover:border-gray-400': !isDragOver && !disabled && !value,
            'border-border': disabled,
            'cursor-not-allowed opacity-50': disabled,
          }
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {value ? (
          <div className="relative w-full h-full group">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClick()
                  }}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Change
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP up to {maxSizeMB}MB</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {uploading && <div className="text-sm text-muted-foreground">Uploading image...</div>}
    </div>
  )
}
