'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useRef, useState } from 'react'

interface JsonInputProps {
  value?: any
  onChange: (jsonContent: any, isValid: boolean) => void
  onFileSelect?: (file: File) => void
  placeholder?: string
  error?: string
}

export function JsonInput({ value, onChange, onFileSelect, placeholder, error }: JsonInputProps) {
  const [textContent, setTextContent] = useState<string>(value ? JSON.stringify(value, null, 2) : '')
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const [dragOver, setDragOver] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update text content when value prop changes
  useEffect(() => {
    if (value) {
      const formattedJson = JSON.stringify(value, null, 2)
      setTextContent(formattedJson)
      setParseError(null)
    } else {
      setTextContent('')
      setParseError(null)
    }
  }, [value])

  const validateAndParseJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setParseError(null)
      onChange(null, true)
      return
    }

    try {
      const parsed = JSON.parse(jsonString)

      // Basic validation - just check it's a valid object
      if (parsed && typeof parsed === 'object') {
        if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
          setParseError('Invalid n8n workflow: missing or invalid "nodes" array')
          onChange(parsed, false)
          return
        }

        if (!parsed.connections || typeof parsed.connections !== 'object') {
          setParseError('Invalid n8n workflow: missing or invalid "connections" object')
          onChange(parsed, false)
          return
        }

        setParseError(null)
        onChange(parsed, true)
      } else {
        setParseError('JSON must be an object')
        onChange(parsed, false)
      }
    } catch (err) {
      setParseError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      onChange(null, false)
    }
  }

  const handleTextChange = (newText: string) => {
    setTextContent(newText)
    validateAndParseJson(newText)
  }

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setParseError('Please select a valid JSON file')
      setUploadedFileName(null)
      setUploadSuccess(false)
      return
    }

    setIsUploading(true)
    setUploadedFileName(file.name)
    setUploadSuccess(false)
    setParseError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTextContent(content)
      
      // Valider et parser le JSON, puis appeler onChange directement
      try {
        const parsed = JSON.parse(content)
        if (parsed && typeof parsed === 'object') {
          setParseError(null)
          onChange(parsed, true)
        } else {
          setParseError('JSON must be an object')
          onChange(null, false)
        }
      } catch (err) {
        setParseError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
        onChange(null, false)
      }
      
      if (onFileSelect) {
        onFileSelect(file)
      }
      setIsUploading(false)
      setUploadSuccess(true)
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setUploadSuccess(false), 3000)
    }
    reader.onerror = () => {
      setParseError('Error reading file')
      setIsUploading(false)
      setUploadSuccess(false)
      setUploadedFileName(null)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const jsonFile = files.find((file) => file.type === 'application/json' || file.name.endsWith('.json'))

    if (jsonFile) {
      handleFileUpload(jsonFile)
    } else {
      setParseError('Please drop a valid JSON file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(textContent)
      const formatted = JSON.stringify(parsed, null, 2)
      setTextContent(formatted)
    } catch (err) {
      // Ignore formatting errors
    }
  }

  const clearContent = () => {
    setTextContent('')
    setParseError(null)
    setUploadedFileName(null)
    setUploadSuccess(false)
    onChange(null, true)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'paste' | 'upload')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste JSON</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paste n8n Workflow JSON</CardTitle>
              <CardDescription>Copy and paste your n8n workflow JSON content directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={textContent}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={placeholder || 'Paste your n8n workflow JSON here...'}
                className="w-full h-64 font-mono text-sm border border-[#9DA2B3]/25 bg-[#1E1E24] text-[#EDEFF7] placeholder-[#9DA2B3] rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={formatJson}
                  disabled={!textContent || parseError !== null}
                >
                  Format JSON
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={clearContent} disabled={!textContent}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload n8n Workflow File</CardTitle>
              <CardDescription>Upload a .json file exported from n8n</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-500/10' : uploadSuccess ? 'border-green-500 bg-green-500/10' : 'border-[#9DA2B3]/25 hover:border-[#9DA2B3]/50 bg-[#1E1E24]'
                } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                />

                <div className="space-y-2">
                  {isUploading ? (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-blue-500 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <p className="text-sm text-blue-400 font-aeonikpro">
                        Loading <span className="font-medium">{uploadedFileName}</span>...
                      </p>
                    </>
                  ) : uploadSuccess && uploadedFileName ? (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-green-400 font-aeonikpro">
                        <span className="font-medium">{uploadedFileName}</span> loaded successfully!
                      </p>
                      <p className="text-xs text-[#9DA2B3] font-aeonikpro">Click to upload a different file</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-[#9DA2B3]"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm text-[#9DA2B3] font-aeonikpro">
                        <span className="font-medium text-[#EDEFF7]">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-[#9DA2B3] font-aeonikpro">JSON files only</p>
                    </>
                  )}
                </div>
              </div>

              {/* Fichier chargé - feedback persistant */}
              {uploadedFileName && !isUploading && textContent && (
                <div className="flex items-center justify-between p-3 bg-[#2A2D3A] rounded-lg border border-[#9DA2B3]/25">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-[#EDEFF7] font-aeonikpro">{uploadedFileName}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearContent()
                    }}
                    className="text-[#9DA2B3] hover:text-red-400"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  )
}
