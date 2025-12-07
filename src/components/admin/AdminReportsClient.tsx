'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flag } from 'lucide-react'
import { ReportActionButtons } from './ReportActionButtons'
import { useRouter } from 'next/navigation'

interface Report {
  id: string
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed'
  reason: string
  description?: string | null
  createdAt: Date
  resolvedAt?: Date | null
  workflowId?: string | null
  storeId?: string | null
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
}

interface AdminReportsClientProps {
  initialReports: Report[]
  totalCount: number
}

export function AdminReportsClient({ initialReports, totalCount }: AdminReportsClientProps) {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>(initialReports)

  const handleStatusChange = (reportId: string, newStatus: string) => {
    if (newStatus === 'deleted') {
      // Remove the report from the list
      setReports(prev => prev.filter(report => report.id !== reportId))
    } else {
      // Update the report status
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                status: newStatus as Report['status'],
                resolvedAt: ['resolved', 'dismissed'].includes(newStatus) ? new Date() : undefined
              }
            : report
        )
      )
    }
    
    // Refresh the page to get updated data from server
    router.refresh()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">Open</Badge>
      case 'reviewing':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Reviewing</Badge>
      case 'resolved':
        return <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Resolved</Badge>
      case 'dismissed':
        return <Badge className="bg-[#40424D]/30 text-[#9DA2B3] border border-[#9DA2B3]/30">Dismissed</Badge>
      default:
        return <Badge variant="outline" className="bg-[#40424D]/30 text-[#9DA2B3]">{status}</Badge>
    }
  }

  return (
    <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-2xl">
          <Flag className="h-6 w-6 text-red-400" />
          <span>All Reports ({reports.length})</span>
        </CardTitle>
        <CardDescription className="text-[#9DA2B3]/70 text-base">
          Review and take action on user-submitted reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-[#9DA2B3]">
              No reports found.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-[#9DA2B3]/20 rounded-lg hover:border-[#9DA2B3]/40 hover:bg-[#40424D]/20 transition-all duration-200"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-[#EDEFF7] font-aeonikpro">Report #{report.id.slice(0, 8)}</h3>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-[#9DA2B3] flex-wrap">
                    <span>Reporter: <span className="text-[#EDEFF7]">{report.reporter?.displayName || 'Unknown'}</span></span>
                    <span>•</span>
                    <span className="text-[#9DA2B3]/70">{report.reporter?.email || 'No email'}</span>
                    <span>•</span>
                    <span className="font-medium">Type: {report.reason}</span>
                  </div>

                  <div className="text-sm text-[#9DA2B3]">
                    <span className="font-medium text-[#EDEFF7]">
                      {report.workflowId ? 'Workflow' : 'Store'}: 
                    </span>
                    <span className="ml-1 text-[#EDEFF7]">
                      {report.workflowId 
                        ? report.workflow?.title || 'Unknown workflow'
                        : report.store?.storeName || 'Unknown store'
                      }
                    </span>
                    {report.workflowId && report.workflow?.seller?.displayName && (
                      <span className="text-[#9DA2B3]"> by {report.workflow.seller.displayName}</span>
                    )}
                    {report.storeId && report.store?.user?.displayName && (
                      <span className="text-[#9DA2B3]"> by {report.store.user.displayName}</span>
                    )}
                  </div>

                  {report.description && (
                    <div className="text-sm text-[#9DA2B3]">
                      <span className="font-medium text-[#EDEFF7]">Description: </span>
                      <span>{report.description}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-[#9DA2B3]/60">
                    <span>Reported: {formatDate(report.createdAt)}</span>
                    {report.status === 'resolved' && report.resolvedAt && (
                      <>
                        <span>•</span>
                        <span>Resolved: {formatDate(report.resolvedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <ReportActionButtons 
                    report={report} 
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
