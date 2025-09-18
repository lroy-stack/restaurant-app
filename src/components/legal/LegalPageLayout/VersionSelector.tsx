// components/legal/LegalPageLayout/VersionSelector.tsx
// Version Selector Component for Legal Documents
// PRP Implementation: Policy version history and management

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Calendar,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import type {
  LegalDocumentType,
  Language,
  LegalContent
} from '@/types/legal'

// ============================================
// COMPONENT INTERFACES
// ============================================

interface VersionSelectorProps {
  documentType: LegalDocumentType
  language: Language
  currentVersion: string
  className?: string
  maxVersions?: number
}

interface VersionInfo {
  id: string
  version: string
  title: string
  effectiveDate: string
  isActive: boolean
  isCurrent: boolean
}

// ============================================
// MAIN COMPONENT
// ============================================

export function VersionSelector({
  documentType,
  language,
  currentVersion,
  className,
  maxVersions = 10
}: VersionSelectorProps) {
  const [versions, setVersions] = useState<VersionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch version history
  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch version history from API
        const response = await fetch(`/api/legal/content?type=${documentType}&language=${language}&includeInactive=true`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch version history')
        }

        const versionHistory = data.contents || []

        // Transform to VersionInfo format
        const versionInfos: VersionInfo[] = versionHistory
          .slice(0, maxVersions) // Limit displayed versions
          .map((content: LegalContent) => ({
            id: content.id,
            version: content.version,
            title: content.title,
            effectiveDate: content.effective_date,
            isActive: content.is_active,
            isCurrent: content.version === currentVersion
          }))

        setVersions(versionInfos)
      } catch (err) {
        console.error('Error fetching version history:', err)
        setError(language === 'es'
          ? 'Error al cargar el historial de versiones'
          : 'Error loading version history'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchVersionHistory()
  }, [documentType, language, currentVersion, maxVersions])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'es'
      ? date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
  }

  // Generate version URL
  const getVersionUrl = (version: VersionInfo) => {
    const slugMap: Record<LegalDocumentType, { es: string; en: string }> = {
      privacy_policy: { es: 'politica-privacidad', en: 'privacy-policy' },
      terms_conditions: { es: 'terminos-condiciones', en: 'terms-conditions' },
      cookie_policy: { es: 'politica-cookies', en: 'cookie-policy' },
      legal_notice: { es: 'aviso-legal', en: 'legal-notice' },
      gdpr_rights: { es: 'derechos-gdpr', en: 'gdpr-rights' }
    }

    const slug = slugMap[documentType][language]
    const basePath = language === 'es' ? '/legal' : '/en/legal'

    // For now, return current page since we don't have version-specific routes
    // In the future, this could be `/legal/${slug}?version=${version.version}`
    return `${basePath}/${slug}`
  }

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center text-muted-foreground", className)}>
        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
        <p className="text-xs">{error}</p>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className={cn("text-center text-muted-foreground", className)}>
        <FileText className="h-4 w-4 mx-auto mb-2" />
        <p className="text-xs">
          {language === 'es'
            ? 'No hay versiones disponibles'
            : 'No versions available'
          }
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn("h-[200px] w-full", className)}>
      <div className="space-y-3">
        {versions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            language={language}
            documentType={documentType}
            onVersionSelect={(versionInfo) => {
              // For now, just refresh the page
              // In the future, this could navigate to version-specific URL
              window.location.reload()
            }}
          />
        ))}

        {versions.length >= maxVersions && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                // TODO: Implement "show more" functionality
                console.log('Show more versions')
              }}
            >
              {language === 'es' ? 'Ver más versiones' : 'Show more versions'}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// ============================================
// VERSION ITEM COMPONENT
// ============================================

interface VersionItemProps {
  version: VersionInfo
  language: Language
  documentType: LegalDocumentType
  onVersionSelect: (version: VersionInfo) => void
}

function VersionItem({
  version,
  language,
  documentType,
  onVersionSelect
}: VersionItemProps) {
  const handleSelect = () => {
    if (!version.isCurrent) {
      onVersionSelect(version)
    }
  }

  return (
    <div
      className={cn(
        "p-3 border rounded-lg transition-colors cursor-pointer",
        version.isCurrent
          ? "bg-primary/5 border-primary/20"
          : "bg-background hover:bg-muted/30 border-border"
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Version Number & Status */}
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={version.isCurrent ? "default" : "outline"}
              className="text-xs px-2 py-0.5"
            >
              {version.version}
            </Badge>

            {version.isActive && (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            )}

            {version.isCurrent && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {language === 'es' ? 'Actual' : 'Current'}
              </Badge>
            )}
          </div>

          {/* Effective Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {language === 'es' ? 'Desde' : 'From'} {formatDate(version.effectiveDate)}
            </span>
          </div>
        </div>

        {/* External Link Icon for non-current versions */}
        {!version.isCurrent && (
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        )}
      </div>

      {/* Version Title (truncated) */}
      <p className="text-xs text-muted-foreground mt-2 truncate">
        {version.title}
      </p>
    </div>
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function compareVersions(a: string, b: string): number {
  // Simple version comparison (assumes semantic versioning)
  const parseVersion = (version: string) => {
    return version.replace(/^v/, '').split('.').map(Number)
  }

  const versionA = parseVersion(a)
  const versionB = parseVersion(b)

  for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
    const partA = versionA[i] || 0
    const partB = versionB[i] || 0

    if (partA > partB) return 1
    if (partA < partB) return -1
  }

  return 0
}

export default VersionSelector