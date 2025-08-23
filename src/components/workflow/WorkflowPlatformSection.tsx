'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { JsonInput } from '@/components/ui/json-input'
import { PlatformSelect } from '@/components/ui/platform-select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, CheckCircle, AlertCircle } from 'lucide-react'

interface WorkflowPlatformSectionProps {
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

// Platform-specific validation and version requirements
const platformConfig = {
  n8n: {
    name: 'n8n',
    minVersion: '0.234.0',
    maxVersion: '1.99.99',
    versionLabel: 'n8n Version',
    jsonValidation: (json: any) => {
      if (!json || typeof json !== 'object') {
        return { isValid: false, error: 'JSON must be a valid object' }
      }

      if (!json.nodes || !Array.isArray(json.nodes)) {
        return { isValid: false, error: 'Invalid n8n workflow: missing or invalid "nodes" array' }
      }

      if (!json.connections || typeof json.connections !== 'object') {
        return { isValid: false, error: 'Invalid n8n workflow: missing or invalid "connections" object' }
      }

      if (json.nodes.length === 0) {
        return { isValid: false, error: 'n8n workflow must contain at least one node' }
      }

      return { isValid: true, error: null }
    },
    placeholder: 'Paste your n8n workflow JSON here...',
    description: 'n8n workflow JSON with nodes and connections',
  },
  zapier: {
    name: 'Zapier',
    minVersion: '1.0.0',
    maxVersion: '999.999.999',
    versionLabel: 'Zapier Version',
    jsonValidation: (json: any) => {
      if (!json || typeof json !== 'object') {
        return { isValid: false, error: 'JSON must be a valid object' }
      }

      if (!json.zap || typeof json.zap !== 'object') {
        return { isValid: false, error: 'Invalid Zapier workflow: missing "zap" object' }
      }

      if (!json.zap.steps || !Array.isArray(json.zap.steps)) {
        return { isValid: false, error: 'Invalid Zapier workflow: missing or invalid "steps" array' }
      }

      return { isValid: true, error: null }
    },
    placeholder: 'Paste your Zapier workflow JSON here...',
    description: 'Zapier workflow JSON with zap configuration',
  },
  make: {
    name: 'Make',
    minVersion: '1.0.0',
    maxVersion: '999.999.999',
    versionLabel: 'Make Version',
    jsonValidation: (json: any) => {
      if (!json || typeof json !== 'object') {
        return { isValid: false, error: 'JSON must be a valid object' }
      }

      if (!json.scenario || typeof json.scenario !== 'object') {
        return { isValid: false, error: 'Invalid Make workflow: missing "scenario" object' }
      }

      if (!json.scenario.modules || !Array.isArray(json.scenario.modules)) {
        return { isValid: false, error: 'Invalid Make workflow: missing or invalid "modules" array' }
      }

      return { isValid: true, error: null }
    },
    placeholder: 'Paste your Make workflow JSON here...',
    description: 'Make workflow JSON with scenario configuration',
  },
  airtable_script: {
    name: 'Airtable Script',
    minVersion: '1.0.0',
    maxVersion: '999.999.999',
    versionLabel: 'Airtable Script Version',
    jsonValidation: (content: any) => {
      if (!content || typeof content !== 'string') {
        return { isValid: false, error: 'JavaScript code must be a valid string' }
      }

      if (content.trim().length === 0) {
        return { isValid: false, error: 'JavaScript code cannot be empty' }
      }

      // Basic JavaScript validation - check for function keyword
      if (!content.includes('function') && !content.includes('=>')) {
        return { isValid: false, error: 'JavaScript code should contain a function or arrow function' }
      }

      return { isValid: true, error: null }
    },
    placeholder: 'Paste your Airtable JavaScript code here...',
    description: 'Airtable JavaScript code for automation',
  },
}

export function WorkflowPlatformSection({
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
}: WorkflowPlatformSectionProps) {
  const [jsonValidation, setJsonValidation] = useState<{ isValid: boolean; error: string | null }>({
    isValid: true,
    error: null,
  })
  const [showVersionInfo, setShowVersionInfo] = useState(false)

  const currentPlatform = platformConfig[platform as keyof typeof platformConfig]

  // Validate JSON when platform or content changes
  useEffect(() => {
    if (platform && jsonContent) {
      const validation = currentPlatform?.jsonValidation(jsonContent)
      setJsonValidation(validation || { isValid: true, error: null })
    } else {
      setJsonValidation({ isValid: true, error: null })
    }
  }, [platform, jsonContent, currentPlatform])

  const handleJsonChange = (content: any, isValid: boolean) => {
    onUpdate('jsonContent', content)

    // Additional platform-specific validation
    if (platform && content) {
      const validation = currentPlatform?.jsonValidation(content)
      setJsonValidation(validation || { isValid: true, error: null })
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

      {/* JSON Workflow Input - Only show when platform is selected */}
      {platform && (
        <div className="space-y-2">
          <Label className={touched.jsonContent && errors.jsonContent ? 'text-red-500' : ''}>
            {currentPlatform?.name === 'Airtable Script'
              ? 'JavaScript Code'
              : `${currentPlatform?.name || 'Workflow'} JSON`}{' '}
            *
          </Label>
          <JsonInput
            value={jsonContent}
            onChange={handleJsonChange}
            onFileSelect={(file) => {
              onUpdate('jsonFile', file)
            }}
            placeholder={currentPlatform?.placeholder || 'Paste your workflow JSON here...'}
            error={errors.jsonContent || jsonValidation.error || undefined}
          />

          {/* Platform-specific validation feedback */}
          {jsonContent && (
            <div className="flex items-center gap-2 mt-2">
              {jsonValidation.isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Valid{' '}
                    {currentPlatform?.name === 'Airtable Script'
                      ? 'JavaScript code'
                      : `${currentPlatform?.name} workflow format`}
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

      {/* Version Requirements - Only show when platform is selected */}
      {platform && currentPlatform && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Version Requirements</Label>
            <button
              type="button"
              onClick={() => setShowVersionInfo(!showVersionInfo)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showVersionInfo ? 'Hide' : 'Show'} version info
            </button>
          </div>

          {showVersionInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Minimum Version:</strong> {currentPlatform.minVersion}
                  </p>
                  <p>
                    <strong>Maximum Version:</strong> {currentPlatform.maxVersion}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Specify the version range that your workflow is compatible with.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor={getVersionFieldName()}
                className={touched[getVersionFieldName()] && errors[getVersionFieldName()] ? 'text-red-500' : ''}
              >
                Minimum {currentPlatform.versionLabel} *
              </Label>
              <Input
                id={getVersionFieldName()}
                name={getVersionFieldName()}
                value={getVersionFieldValue()}
                onChange={(e) => onUpdate(getVersionFieldName(), e.target.value)}
                onBlur={() => onBlur(getVersionFieldName())}
                placeholder={`e.g., ${currentPlatform.minVersion}`}
                className={touched[getVersionFieldName()] && errors[getVersionFieldName()] ? 'border-red-500' : ''}
                required
              />
              {touched[getVersionFieldName()] && errors[getVersionFieldName()] && (
                <p className="text-xs text-red-500">{errors[getVersionFieldName()]}</p>
              )}
              <p className="text-xs text-muted-foreground">Format: X.Y.Z (e.g., {currentPlatform.minVersion})</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={getMaxVersionFieldName()}>Maximum {currentPlatform.versionLabel} (Optional)</Label>
              <Input
                id={getMaxVersionFieldName()}
                name={getMaxVersionFieldName()}
                value={getMaxVersionFieldValue()}
                onChange={(e) => onUpdate(getMaxVersionFieldName(), e.target.value)}
                onBlur={() => onBlur(getMaxVersionFieldName())}
                placeholder={`e.g., ${currentPlatform.maxVersion}`}
                className={
                  touched[getMaxVersionFieldName()] && errors[getMaxVersionFieldName()] ? 'border-red-500' : ''
                }
              />
              {touched[getMaxVersionFieldName()] && errors[getMaxVersionFieldName()] && (
                <p className="text-xs text-red-500">{errors[getMaxVersionFieldName()]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: X.Y.Z (e.g., {currentPlatform.maxVersion}) - Must be greater than minimum version
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform-specific badges */}
      {platform && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {currentPlatform?.name || platform}
          </Badge>
          {currentPlatform && (
            <Badge variant="secondary" className="text-xs">
              Min: {currentPlatform.minVersion}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
