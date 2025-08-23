// Utility functions for workflow downloads

export async function downloadWorkflowAsZip(workflowId: string, title: string) {
  try {
    const response = await fetch(`/api/workflows/${workflowId}/download?format=zip`)
    
    if (!response.ok) {
      throw new Error('Failed to download workflow')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_workflow.zip`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

export async function copyWorkflowToClipboard(workflowId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/workflows/${workflowId}/download?format=json`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow')
    }
    
    const data = await response.json()
    const jsonString = JSON.stringify(data.workflow, null, 2)
    
    await navigator.clipboard.writeText(jsonString)
    return true
  } catch (error) {
    console.error('Copy to clipboard error:', error)
    return false
  }
}
