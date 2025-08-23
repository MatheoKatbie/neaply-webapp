'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { File, FileText, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface FileUploadProps {
  value?: string // Current file URL
  onChange: (file: File | null, url?: string) => void
  onRemove?: () => void
  className?: string
  disabled?: boolean
  maxSizeMB?: number
  acceptedTypes?: string[]
  placeholder?: string
  required?: boolean
  selectedFile?: File // Add selected file prop for better display
  hasError?: boolean // Whether to show error styling
  onBlur?: () => void // Callback when field loses focus or is interacted with
}

export function FileUpload({
  value,
  onChange,
  onRemove,
  className,
  disabled = false,
  maxSizeMB = 10,
  acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'],
  placeholder = 'Drag and drop a document here, or click to select',
  required = false,
  selectedFile,
  hasError = false,
  onBlur,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        return `File size must be less than ${maxSizeMB}MB`
      }

      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!acceptedTypes.includes(fileExtension)) {
        return `Only ${acceptedTypes.join(', ')} files are allowed`
      }

      return null
    },
    [maxSizeMB, acceptedTypes]
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null)

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      // Create a blob URL for preview
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
      const file = files[0]

      if (file) {
        handleFileSelect(file)
      } else {
        setError('Please drop a valid document file')
      }

      if (onBlur) {
        onBlur()
      }
    },
    [disabled, handleFileSelect, onBlur]
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

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    },
    [handleFileSelect]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
    if (onBlur) {
      onBlur()
    }
  }, [onBlur])

  const handleRemove = useCallback(() => {
    onChange(null, '')
    if (onRemove) {
      onRemove()
    }
  }, [onChange, onRemove])

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-muted-foreground" />
      case 'docx':
      case 'doc':
        return <FileText className="h-8 w-8 text-muted-foreground" />
      case 'txt':
      case 'md':
        return <FileText className="h-8 w-8 text-muted-foreground" />
      default:
        return <File className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getFileName = (url: string) => {
    try {
      const urlParts = url.split('/')
      return urlParts[urlParts.length - 1].split('?')[0]
    } catch {
      return 'Document'
    }
  }

  // Get the file name to display (either from selectedFile or from URL)
  const getDisplayFileName = () => {
    if (selectedFile) {
      return selectedFile.name
    }
    if (value && !value.startsWith('blob:')) {
      return getFileName(value)
    }
    return null
  }

  // Get the display text for the file status
  const getFileStatusText = () => {
    if (selectedFile) {
      return 'Document selected'
    }
    if (value && !value.startsWith('blob:')) {
      return 'Document uploaded'
    }
    return 'Document selected'
  }

  // Check if we have a file to display
  const hasFile = selectedFile || (value && !value.startsWith('blob:'))

  // Check if the field is valid (has file or URL)
  // For required fields, we only show error state if there's no file AND the field has been interacted with
  const isValid = hasFile || !required

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          isDragOver && !disabled
            ? 'border-blue-500 bg-blue-50'
            : hasFile
            ? 'border-border hover:border-gray-400'
            : hasError && required && !isValid
            ? 'border-red-300 bg-red-50'
            : 'border-border hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={disabled ? undefined : handleClick}
      >
        {hasFile ? (
          <div className="relative p-4 group">
            <div className="flex items-center space-x-3">
              <div className="text-muted-foreground">{getFileIcon(getDisplayFileName() || 'document')}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{getDisplayFileName()}</p>
                <p className="text-xs text-muted-foreground">{getFileStatusText()}</p>
              </div>
            </div>
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
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground">
                {acceptedTypes.join(', ')} up to {maxSizeMB}MB
                {required && <span className="text-red-500 ml-1">*</span>}
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
          required={false}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {uploading && <div className="text-sm text-muted-foreground">Uploading document...</div>}
    </div>
  )
}
