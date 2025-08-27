'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { JsonInput } from '@/components/ui/json-input'
import { Label } from '@/components/ui/label'
import { PlatformSelect } from '@/components/ui/platform-select'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WorkflowContentSectionProps {
  platform: string
  jsonContent: any
  n8nMinVersion: string
  n8nMaxVersion: string
  zapierMinVersion?: string
  zapierMaxVersion?: string
  makeMinVersion?: string
  makeMaxVersion?: string
  airtableScriptMinVersion?: string
  airtableScriptMaxVersion?: string
  onUpdate: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  onBlur: (field: string) => void
}

// Simplified platform configuration
const platformConfig = {
  n8n: {
    name: 'n8n',
    placeholder: 'Paste your n8n workflow JSON here...',
    description: 'Upload your n8n workflow JSON file',
    contentType: 'json',
  },
  zapier: {
    name: 'Zapier',
    placeholder: 'Paste your Zapier workflow JSON here...',
    description: 'Upload your Zapier workflow JSON file',
    contentType: 'json',
  },
  make: {
    name: 'Make',
    placeholder: 'Paste your Make workflow JSON here...',
    description: 'Upload your Make workflow JSON file',
    contentType: 'json',
  },
  airtable_script: {
    name: 'Airtable Script',
    placeholder: 'Paste your Airtable JavaScript code here...',
    description: 'Upload your Airtable JavaScript code',
    contentType: 'javascript',
  },
}

export function WorkflowContentSection({
  platform,
  jsonContent,
  n8nMinVersion,
  n8nMaxVersion,
  zapierMinVersion,
  zapierMaxVersion,
  makeMinVersion,
  makeMaxVersion,
  airtableScriptMinVersion,
  airtableScriptMaxVersion,
  onUpdate,
  errors,
  touched,
  onBlur,
}: WorkflowContentSectionProps) {
  const [jsonValidation, setJsonValidation] = useState<{ isValid: boolean; error: string | null }>({
    isValid: true,
    error: null,
  })
  const [showVersions, setShowVersions] = useState(false)

  const currentPlatform = platformConfig[platform as keyof typeof platformConfig]

  // Simplified JSON validation
  const validateContent = (content: any, platformType: string) => {
    if (!content) {
      return { isValid: false, error: 'Content is required' }
    }

    if (platformType === 'javascript') {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return { isValid: false, error: 'JavaScript code cannot be empty' }
      }
    } else {
      if (typeof content !== 'object' || content === null) {
        return { isValid: false, error: 'Invalid JSON format' }
      }
    }

    return { isValid: true, error: null }
  }

  // Validate content when platform or content changes
  useEffect(() => {
    if (platform && jsonContent) {
      const contentType = currentPlatform?.contentType || 'json'
      const validation = validateContent(jsonContent, contentType)
      setJsonValidation(validation)
    } else {
      setJsonValidation({ isValid: true, error: null })
    }
  }, [platform, jsonContent, currentPlatform])

  const handleJsonChange = (content: any, isValid: boolean) => {
    onUpdate('jsonContent', content)

    if (platform && content) {
      const contentType = currentPlatform?.contentType || 'json'
      const validation = validateContent(content, contentType)
      setJsonValidation(validation)
    } else {
      setJsonValidation({ isValid: true, error: null })
    }
  }

  const getVersionFieldName = () => {
    if (!platform) return 'n8nMinVersion'
    return platform === 'n8n' ? 'n8nMinVersion' : `${platform}MinVersion`
  }

  const getVersionFieldValue = () => {
    if (!platform) return n8nMinVersion
    switch (platform) {
      case 'n8n':
        return n8nMinVersion
      case 'zapier':
        return zapierMinVersion || ''
      case 'make':
        return makeMinVersion || ''
      case 'airtable_script':
        return airtableScriptMinVersion || ''
      default:
        return n8nMinVersion
    }
  }

  const getMaxVersionFieldName = () => {
    if (!platform) return 'n8nMaxVersion'
    return platform === 'n8n' ? 'n8nMaxVersion' : `${platform}MaxVersion`
  }

  const getMaxVersionFieldValue = () => {
    if (!platform) return n8nMaxVersion
    switch (platform) {
      case 'n8n':
        return n8nMaxVersion
      case 'zapier':
        return zapierMaxVersion || ''
      case 'make':
        return makeMaxVersion || ''
      case 'airtable_script':
        return airtableScriptMaxVersion || ''
      default:
        return n8nMaxVersion
    }
  }

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div className="space-y-2">
        <PlatformSelect
          value={platform}
          onValueChange={(selectedPlatform) => {
            onUpdate('platform', selectedPlatform)
            if (!touched.platform) {
              onBlur('platform')
            }
          }}
          placeholder="Select the platform for your workflow..."
          error={errors.platform}
          required={true}
        />
      </div>

      {/* Platform-specific information */}
      {platform && currentPlatform && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{currentPlatform.name} Workflow</strong>
            <br />
            {currentPlatform.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Content Input - Only show when platform is selected */}
      {platform && (
        <div className="space-y-2">
          <Label className={touched.jsonContent && errors.jsonContent ? 'text-red-500' : ''}>
            {currentPlatform?.name === 'Airtable Script' ? 'JavaScript Code' : 'Workflow Content'} *
          </Label>
          <JsonInput
            value={jsonContent}
            onChange={handleJsonChange}
            onFileSelect={(file) => {
              onUpdate('jsonFile', file)
            }}
            placeholder={currentPlatform?.placeholder || 'Paste your workflow content here...'}
            error={errors.jsonContent || jsonValidation.error || undefined}
          />

          {/* Validation feedback */}
          {jsonContent && (
            <div className="flex items-center gap-2 mt-2">
              {jsonValidation.isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Valid {currentPlatform?.name === 'Airtable Script' ? 'JavaScript code' : 'workflow format'}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{jsonValidation.error}</span>
                </>
              )}
            </div>
          )}

          {touched.jsonContent && errors.jsonContent && <p className="text-xs text-red-500">{errors.jsonContent}</p>}
        </div>
      )}

      {/* Optional Version Requirements */}
      {platform && currentPlatform && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Version Requirements (Optional)</Label>
            <button
              type="button"
              onClick={() => setShowVersions(!showVersions)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showVersions ? 'Hide' : 'Show'} version settings
            </button>
          </div>

          {showVersions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={getVersionFieldName()}>Minimum Version (Optional)</Label>
                <Input
                  id={getVersionFieldName()}
                  name={getVersionFieldName()}
                  value={getVersionFieldValue()}
                  onChange={(e) => onUpdate(getVersionFieldName(), e.target.value)}
                  onBlur={() => onBlur(getVersionFieldName())}
                  placeholder="e.g., 1.0.0"
                  className={touched[getVersionFieldName()] && errors[getVersionFieldName()] ? 'border-red-500' : ''}
                />
                {touched[getVersionFieldName()] && errors[getVersionFieldName()] && (
                  <p className="text-xs text-red-500">{errors[getVersionFieldName()]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={getMaxVersionFieldName()}>Maximum Version (Optional)</Label>
                <Input
                  id={getMaxVersionFieldName()}
                  name={getMaxVersionFieldName()}
                  value={getMaxVersionFieldValue()}
                  onChange={(e) => onUpdate(getMaxVersionFieldName(), e.target.value)}
                  onBlur={() => onBlur(getMaxVersionFieldName())}
                  placeholder="e.g., 2.0.0"
                  className={touched[getMaxVersionFieldName()] && errors[getMaxVersionFieldName()] ? 'border-red-500' : ''}
                />
                {touched[getMaxVersionFieldName()] && errors[getMaxVersionFieldName()] && (
                  <p className="text-xs text-red-500">{errors[getMaxVersionFieldName()]}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform badge */}
      {platform && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {currentPlatform?.name || platform}
          </Badge>
        </div>
      )}
    </div>
  )
}
