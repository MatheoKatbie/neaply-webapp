'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { JsonInput } from '@/components/ui/json-input'
import { Label } from '@/components/ui/label'
import { PlatformSelect } from '@/components/ui/platform-select'
import { SimilarityAlert } from '@/components/SimilarityAlert'
import { useSimilarityCheck } from '@/hooks/useSimilarityCheck'
import { AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'

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
  showErrors?: boolean
  workflowId?: string // For edit mode - exclude from similarity check
  onSimilarityWarning?: (hasSimilarity: boolean) => void // Callback when similarity is detected
  onSimilarityCheckingChange?: (isChecking: boolean) => void // Callback when similarity check starts/ends
  onSimilarityConfirmed?: (score: number, severity: string, matchedWorkflows: { workflowId: string; workflowTitle: string; workflowSlug: string; similarityScore: number }[]) => void // Callback when user confirms despite similarity
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
  showErrors = false,
  workflowId,
  onSimilarityWarning,
  onSimilarityCheckingChange,
  onSimilarityConfirmed,
}: WorkflowContentSectionProps) {
  const [jsonValidation, setJsonValidation] = useState<{ isValid: boolean; error: string | null }>({
    isValid: true,
    error: null,
  })
  const [showVersions, setShowVersions] = useState(false)
  const [similarityDismissed, setSimilarityDismissed] = useState(false)
  const [similarityConfirmed, setSimilarityConfirmed] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { checkSimilarity, isChecking, result: similarityResult, clearResult } = useSimilarityCheck()

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

  // Check similarity when JSON content changes (debounced)
  useEffect(() => {
    // Only check for n8n workflows with valid JSON
    if (platform !== 'n8n' || !jsonContent || typeof jsonContent !== 'object') {
      clearResult()
      return
    }

    // Reset dismissed/confirmed state when content changes
    setSimilarityDismissed(false)
    setSimilarityConfirmed(false)

    // Debounce the similarity check
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      checkSimilarity(jsonContent, workflowId)
    }, 1500) // Wait 1.5s after user stops typing

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [platform, jsonContent, workflowId, checkSimilarity, clearResult])

  // Notify parent about similarity warning
  useEffect(() => {
    if (onSimilarityWarning) {
      const hasSimilarity = similarityResult?.isSimilar && !similarityConfirmed
      onSimilarityWarning(hasSimilarity || false)
    }
  }, [similarityResult, similarityConfirmed, onSimilarityWarning])

  // Notify parent about similarity checking state
  useEffect(() => {
    if (onSimilarityCheckingChange) {
      onSimilarityCheckingChange(isChecking)
    }
  }, [isChecking, onSimilarityCheckingChange])

  // Helper to determine severity based on score
  const getSeverity = (score: number): string => {
    if (score >= 90) return 'critical'
    if (score >= 70) return 'warning'
    if (score >= 50) return 'info'
    return 'none'
  }

  const handleJsonChange = (content: any, isValid: boolean) => {
    onUpdate('jsonContent', content)
    
    // Marquer le champ comme touché pour déclencher la validation
    if (!touched.jsonContent) {
      onBlur('jsonContent')
    }

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
        <Alert variant={"default"}>
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
              // Marquer jsonContent comme touché après upload de fichier
              if (!touched.jsonContent) {
                onBlur('jsonContent')
              }
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
                  {isChecking && (
                    <span className="flex items-center gap-1 text-sm text-gray-400 ml-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking for similarities...
                    </span>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{jsonValidation.error}</span>
                </>
              )}
            </div>
          )}

          {/* Similarity Alert */}
          {platform === 'n8n' && similarityResult && similarityResult.similarityScore >= 50 && !similarityDismissed && (
            <div className="mt-4">
              <SimilarityAlert
                similarityScore={similarityResult.similarityScore}
                warning={similarityResult.warning}
                matchedWorkflows={similarityResult.matchedWorkflows}
                onDismiss={() => setSimilarityDismissed(true)}
                onConfirm={() => {
                  setSimilarityConfirmed(true)
                  setSimilarityDismissed(true)
                  // Notify parent about confirmed similarity for database storage
                  if (onSimilarityConfirmed) {
                    const severity = getSeverity(similarityResult.similarityScore)
                    onSimilarityConfirmed(
                      similarityResult.similarityScore,
                      severity,
                      similarityResult.matchedWorkflows.map(w => ({
                        workflowId: w.id,
                        workflowTitle: w.title,
                        workflowSlug: w.slug,
                        similarityScore: w.similarityScore,
                      }))
                    )
                  }
                }}
                showActions={similarityResult.isSimilar}
              />
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
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
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
                  className={
                    touched[getMaxVersionFieldName()] && errors[getMaxVersionFieldName()] ? 'border-red-500' : ''
                  }
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
