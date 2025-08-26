'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkflowStatusFormProps {
    workflowId: string
    defaultStatus: 'draft' | 'published' | 'unlisted' | 'disabled' | 'pack_only'
    action: (formData: FormData) => void
}

export function WorkflowStatusForm({ workflowId, defaultStatus, action }: WorkflowStatusFormProps) {
    const [status, setStatus] = React.useState<WorkflowStatusFormProps['defaultStatus']>(defaultStatus)

    return (
        <form action={action} className="flex items-center space-x-2">
            <input type="hidden" name="workflowId" value={workflowId} />
            <input type="hidden" name="status" value={status} />
            <Select value={status} onValueChange={(v) => setStatus(v as WorkflowStatusFormProps['defaultStatus'])}>
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="pack_only">Pack Only</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" size="sm">Apply</Button>
        </form>
    )
}


