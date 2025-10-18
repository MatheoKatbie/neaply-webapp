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

      // Basic validation for n8n workflow structure
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
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTextContent(content)
      validateAndParseJson(content)
      if (onFileSelect) {
        onFileSelect(file)
      }
    }
    reader.onerror = () => {
      setParseError('Error reading file')
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
                className="w-full h-64 font-mono text-sm border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-gray-400'
                }`}
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
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON files only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  )
}
