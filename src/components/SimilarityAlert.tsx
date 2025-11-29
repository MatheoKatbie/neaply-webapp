'use client'

import { AlertTriangle, AlertCircle, Info, ExternalLink, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SimilarWorkflow {
  title: string
  slug: string
  sellerName: string
  similarityScore: number
}

interface SimilarityAlertProps {
  similarityScore: number
  warning?: string
  matchedWorkflows: SimilarWorkflow[]
  onDismiss?: () => void
  onConfirm?: () => void
  showActions?: boolean
}

export function SimilarityAlert({
  similarityScore,
  warning,
  matchedWorkflows,
  onDismiss,
  onConfirm,
  showActions = true,
}: SimilarityAlertProps) {
  // Determine severity based on similarity score
  const severity = similarityScore >= 90 ? 'critical' : similarityScore >= 70 ? 'warning' : 'info'
  
  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      bgClass: 'bg-red-500/10 border-red-500/50',
      iconClass: 'text-red-500',
      titleClass: 'text-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-yellow-500/10 border-yellow-500/50',
      iconClass: 'text-yellow-500',
      titleClass: 'text-yellow-500',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-500/10 border-blue-500/50',
      iconClass: 'text-blue-500',
      titleClass: 'text-blue-500',
    },
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <Alert className={`${config.bgClass} relative`}>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
      
      <Icon className={`h-5 w-5 ${config.iconClass}`} />
      
      <AlertTitle className={`${config.titleClass} font-semibold`}>
        {severity === 'critical' && 'Workflow très similaire détecté'}
        {severity === 'warning' && 'Similarités détectées'}
        {severity === 'info' && 'Points communs détectés'}
      </AlertTitle>
      
      <AlertDescription className="mt-2 space-y-3">
        {warning && <p className="text-gray-300">{warning}</p>}
        
        {matchedWorkflows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Workflows similaires :</p>
            <ul className="space-y-1">
              {matchedWorkflows.slice(0, 3).map((workflow, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">
                    "{workflow.title}" par {workflow.sellerName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      workflow.similarityScore >= 90 
                        ? 'bg-red-500/20 text-red-400' 
                        : workflow.similarityScore >= 70 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {workflow.similarityScore}%
                    </span>
                    <Link 
                      href={`/workflow/${workflow.slug}`}
                      target="_blank"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {severity === 'critical' && (
          <p className="text-sm text-red-400/80 mt-2">
            ⚠️ La publication de contenu copié peut entraîner la suspension de votre compte.
          </p>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            {onConfirm && (
              <Button
                variant="outline"
                size="sm"
                onClick={onConfirm}
                className={severity === 'critical' ? 'border-red-500/50 hover:bg-red-500/10' : ''}
              >
                {severity === 'critical' 
                  ? "Je confirme que c'est mon travail original"
                  : "Continuer quand même"
                }
              </Button>
            )}
            {onDismiss && severity === 'critical' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
              >
                Modifier mon workflow
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Compact version for inline display
 */
export function SimilarityBadge({ similarityScore }: { similarityScore: number }) {
  if (similarityScore < 50) return null

  const severity = similarityScore >= 90 ? 'critical' : similarityScore >= 70 ? 'warning' : 'info'
  
  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      bgClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.bgClass}`}>
      <Icon className="h-3 w-3" />
      <span>{similarityScore}% similaire</span>
    </span>
  )
}
