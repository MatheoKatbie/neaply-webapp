'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Trash2,
  MoreHorizontal,
  Shield,
  ShieldOff
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'

interface Report {
  id: string
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed'
  reason: string
  description?: string | null
  createdAt: Date
  resolvedAt?: Date | null
  reporter?: {
    displayName: string
    email: string
  } | null
  workflow?: {
    title: string
    seller: {
      displayName: string
      sellerProfile?: {
        storeName: string
        status: string
      } | null
    }
  } | null
  store?: {
    storeName: string
    status: string
    user: {
      displayName: string
    }
  } | null
  workflowId?: string | null
  storeId?: string | null
}

interface ReportActionButtonsProps {
  report: Report
  onStatusChange?: (reportId: string, newStatus: string) => void
}

export function ReportActionButtons({ report, onStatusChange }: ReportActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isRestrictingSeller, setIsRestrictingSeller] = useState(false)

  const updateReportStatus = async (status: 'open' | 'reviewing' | 'resolved' | 'dismissed') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update report')
      }

      toast.success(`Report ${status === 'reviewing' ? 'is now under review' : status}`)

      // Call the callback to refresh the data
      onStatusChange?.(report.id, status)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update report')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete report')
      }

      toast.success('Report deleted successfully')

      // Call the callback to refresh the data
      onStatusChange?.(report.id, 'deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete report')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const restrictSeller = async (restrict: boolean) => {
    setIsRestrictingSeller(true)
    try {
      const response = await fetch(`/api/reports/${report.id}/restrict-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          restrict,
          reason: `Action taken based on report #${report.id.slice(0, 8)}: ${report.reason}`
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${restrict ? 'restrict' : 'unrestrict'} seller`)
      }

      const result = await response.json()
      toast.success(result.message)

      // Refresh the page to show updated seller status
      onStatusChange?.(report.id, 'seller_updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${restrict ? 'restrict' : 'unrestrict'} seller`)
    } finally {
      setIsRestrictingSeller(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>
      case 'reviewing':
        return <Badge variant="secondary">Reviewing</Badge>
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  const entityType = report.workflowId ? 'workflow' : 'store'
  const entityName = report.workflowId 
    ? report.workflow?.title 
    : report.store?.storeName

  // Check if this report involves a seller and get their current status
  const canRestrictSeller = !!(report.workflowId || report.storeId)
  const sellerName = report.workflowId 
    ? report.workflow?.seller?.displayName 
    : report.store?.user?.displayName
  
  // Get current seller status
  const currentSellerStatus = report.workflowId 
    ? report.workflow?.seller?.sellerProfile?.status || 'active'
    : report.store?.status || 'active'
  
  // Determine if seller is currently restricted
  const isSellerRestricted = currentSellerStatus === 'suspended'

  return (
    <div className="flex items-center space-x-2">
      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>Report #{report.id.slice(0, 8)}</span>
              {getStatusBadge(report.status)}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Reporter</h4>
                <p className="text-sm text-primary-foreground/70">
                  {report.reporter?.displayName || 'Unknown'}
                </p>
                <p className="text-xs text-primary-foreground/70">
                  {report.reporter?.email || 'No email'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Reported {entityType}</h4>
                <p className="text-sm text-primary-foreground/70">
                  {entityName || 'Unknown'}
                </p>
                {canRestrictSeller && (
                  <div className="text-xs space-y-1">
                    <p className="text-primary-foreground/70">
                      <span className="font-medium">Seller:</span> {sellerName}
                    </p>
                    <p className="flex items-center space-x-1">
                      <span className="font-medium">Status:</span>
                      {isSellerRestricted ? (
                        <span className="text-red-600 flex items-center space-x-1">
                          <ShieldOff className="h-3 w-3" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Reason</h4>
              <p className="text-sm text-primary-foreground/70">{report.reason}</p>
            </div>
            
            {report.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-primary-foreground/70">{report.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Reported:</span>
                <p className="text-primary-foreground/70">{formatDate(report.createdAt)}</p>
              </div>
              {report.resolvedAt && (
                <div>
                  <span className="font-medium">Resolved:</span>
                  <p className="text-muted-foreground">{formatDate(report.resolvedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Buttons based on status */}
      {report.status === 'open' && (
        <>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => updateReportStatus('reviewing')}
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 mr-1" />
            Start Review
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => updateReportStatus('resolved')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateReportStatus('dismissed')}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canRestrictSeller && (
                <>
                  {!isSellerRestricted ? (
                    <DropdownMenuItem 
                      onClick={() => restrictSeller(true)}
                      disabled={isLoading || isRestrictingSeller}
                      className="text-orange-600 focus:text-orange-600"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Restrict Seller ({sellerName})
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => restrictSeller(false)}
                      disabled={isLoading || isRestrictingSeller}
                      className="text-green-600 focus:text-green-600"
                    >
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Unrestrict Seller ({sellerName})
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {report.status === 'reviewing' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => updateReportStatus('resolved')}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateReportStatus('dismissed')}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canRestrictSeller && (
              <>
                {!isSellerRestricted ? (
                  <DropdownMenuItem 
                    onClick={() => restrictSeller(true)}
                    disabled={isLoading || isRestrictingSeller}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Restrict Seller ({sellerName})
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => restrictSeller(false)}
                    disabled={isLoading || isRestrictingSeller}
                    className="text-green-600 focus:text-green-600"
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Unrestrict Seller ({sellerName})
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {(report.status === 'resolved' || report.status === 'dismissed') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => updateReportStatus('open')}
              disabled={isLoading}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reopen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canRestrictSeller && (
              <>
                {!isSellerRestricted ? (
                  <DropdownMenuItem 
                    onClick={() => restrictSeller(true)}
                    disabled={isLoading || isRestrictingSeller}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Restrict Seller ({sellerName})
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => restrictSeller(false)}
                    disabled={isLoading || isRestrictingSeller}
                    className="text-green-600 focus:text-green-600"
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Unrestrict Seller ({sellerName})
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteReport}
        title="Delete Report"
        description="This action cannot be undone. This will permanently delete the report and remove it from the database."
        isLoading={isLoading}
      />
    </div>
  )
}
