'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Workflow } from '@/types/workflow'
import { formatPrice, getStatusColor, STATUS_LABELS } from '@/types/workflow'

interface WorkflowCardProps {
    workflow: Workflow
    onEdit: (workflow: Workflow) => void
    onDelete: (workflowId: string, workflowTitle: string) => void
    isEditing?: boolean
}

export function WorkflowCard({ workflow, onEdit, onDelete, isEditing = false }: WorkflowCardProps) {
    if (isEditing) {
        return null // Don't render if this workflow is being edited
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                        {/* Thumbnail Preview */}
                        <div className="flex-shrink-0">
                            {workflow.heroImageUrl ? (
                                <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted border">
                                    <img
                                        src={workflow.heroImageUrl}
                                        alt={workflow.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to placeholder if image fails to load
                                            const target = e.target as HTMLImageElement
                                            target.style.display = 'none'
                                            target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-muted text-gray-400">
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      `
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-24 rounded-lg bg-muted border flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        ></path>
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1.5">
                                <h3 className="text-lg font-semibold">{workflow.title}</h3>
                                <Badge className={getStatusColor(workflow.status)}>
                                    {STATUS_LABELS[workflow.status] || workflow.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{workflow.shortDesc}</p>

                            {/* Categories and Tags */}
                            <div className="space-y-1.5 mb-3">
                                {workflow.categories && workflow.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {workflow.categories.map((cat: any) => (
                                            <Badge key={cat.category.id} variant="secondary" className="text-xs">
                                                {cat.category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {workflow.tags && workflow.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {workflow.tags.map((tag: any) => (
                                            <Badge key={tag.tag.id} variant="outline" className="text-xs text-muted-foreground">
                                                #{tag.tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <span>Price: {formatPrice(workflow.basePriceCents, workflow.currency)}</span>
                                <span>Sales: {workflow._count.orderItems}</span>
                                <span>Favorites: {workflow._count.favorites}</span>
                                <span>Reviews: {workflow._count.reviews}</span>
                                {workflow.versions && workflow.versions.length > 0 && workflow.versions[0] && (
                                    <>
                                        {workflow.versions[0].n8nMinVersion && (
                                            <span>Min n8n: {workflow.versions[0].n8nMinVersion}</span>
                                        )}
                                        {workflow.versions[0].n8nMaxVersion && (
                                            <span>Max n8n: {workflow.versions[0].n8nMaxVersion}</span>
                                        )}
                                        {workflow.versions[0].zapierMinVersion && (
                                            <span>Min Zapier: {workflow.versions[0].zapierMinVersion}</span>
                                        )}
                                        {workflow.versions[0].zapierMaxVersion && (
                                            <span>Max Zapier: {workflow.versions[0].zapierMaxVersion}</span>
                                        )}
                                        {workflow.versions[0].makeMinVersion && (
                                            <span>Min Make: {workflow.versions[0].makeMinVersion}</span>
                                        )}
                                        {workflow.versions[0].makeMaxVersion && (
                                            <span>Max Make: {workflow.versions[0].makeMaxVersion}</span>
                                        )}
                                        {workflow.versions[0].airtableScriptMinVersion && (
                                            <span>Min Airtable Script: {workflow.versions[0].airtableScriptMinVersion}</span>
                                        )}
                                        {workflow.versions[0].airtableScriptMaxVersion && (
                                            <span>Max Airtable Script: {workflow.versions[0].airtableScriptMaxVersion}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => onEdit(workflow)}>
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(workflow.id, workflow.title)}
                            className="text-red-600 hover:text-red-700"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
