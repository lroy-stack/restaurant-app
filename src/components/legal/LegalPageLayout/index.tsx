// components/legal/LegalPageLayout/index.tsx
// Legal Page Layout Component - Database-driven with Version Control
// PRP Implementation: Complete GDPR/AEPD 2025 Legal Page Management

import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  FileText,
  Clock,
  Languages,
  Download,
  ArrowLeft,
  ExternalLink,
  Scale
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TableOfContents } from './TableOfContents'
// import { VersionSelector } from './VersionSelector' // Temporarily disabled due to SSR conflicts
import { PrintButton } from './PrintButton'
import type {
  LegalContent,
  LegalDocumentType,
  Language,
  LEGAL_CONSTANTS
} from '@/types/legal'

// ============================================
// COMPONENT INTERFACES
// ============================================

interface LegalPageLayoutProps {
  content: LegalContent
  language: Language
  className?: string
  children?: ReactNode
  showTableOfContents?: boolean
  showVersionSelector?: boolean
  showPrintButton?: boolean
  backUrl?: string
}

interface LegalPageMetadata {
  title: string
  description: string
  effectiveDate: string
  version: string
  documentType: LegalDocumentType
  language: Language
}

// ============================================
// DOCUMENT TYPE MAPPING
// ============================================

const DOCUMENT_TYPE_INFO: Record<LegalDocumentType, {
  icon: typeof Shield
  colorClass: string
  title: { es: string; en: string }
  description: { es: string; en: string }
}> = {
  privacy_policy: {
    icon: Shield,
    colorClass: 'text-blue-600',
    title: {
      es: 'Política de Privacidad',
      en: 'Privacy Policy'
    },
    description: {
      es: 'Información sobre el tratamiento de datos personales',
      en: 'Information about personal data processing'
    }
  },
  terms_conditions: {
    icon: FileText,
    colorClass: 'text-green-600',
    title: {
      es: 'Términos y Condiciones',
      en: 'Terms and Conditions'
    },
    description: {
      es: 'Condiciones de uso de nuestros servicios',
      en: 'Terms of use for our services'
    }
  },
  cookie_policy: {
    icon: Shield,
    colorClass: 'text-orange-600',
    title: {
      es: 'Política de Cookies',
      en: 'Cookie Policy'
    },
    description: {
      es: 'Información sobre el uso de cookies en nuestro sitio web',
      en: 'Information about cookie usage on our website'
    }
  },
  legal_notice: {
    icon: Scale,
    colorClass: 'text-purple-600',
    title: {
      es: 'Aviso Legal',
      en: 'Legal Notice'
    },
    description: {
      es: 'Información legal y datos identificativos',
      en: 'Legal information and identification data'
    }
  },
  gdpr_rights: {
    icon: Shield,
    colorClass: 'text-red-600',
    title: {
      es: 'Derechos GDPR',
      en: 'GDPR Rights'
    },
    description: {
      es: 'Tus derechos bajo el Reglamento General de Protección de Datos',
      en: 'Your rights under the General Data Protection Regulation'
    }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LegalPageLayout({
  content,
  language,
  className,
  children,
  showTableOfContents = true,
  showVersionSelector = true,
  showPrintButton = true,
  backUrl = language === 'es' ? '/' : '/en'
}: LegalPageLayoutProps) {
  const docInfo = DOCUMENT_TYPE_INFO[content.document_type]
  const IconComponent = docInfo.icon

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'es'
      ? date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
  }

  // Extract sections from content for TOC
  const sections = content.content?.sections || []

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-8 sm:py-12 -mt-16 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href={backUrl}>
              <Button variant="ghost" className="mb-4 hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'es' ? 'Volver' : 'Back'}
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Document Type Badge */}
            <Badge variant="outline" className="mb-4">
              <IconComponent className={cn("h-3 w-3 mr-1", docInfo.colorClass)} />
              {docInfo.title[language]}
            </Badge>

            {/* Title */}
            <h1 className="enigma-hero-title mb-4">
              {content.title}
            </h1>

            {/* Description */}
            <p className="enigma-hero-subtitle mb-6">
              {docInfo.description[language]}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <div className="font-medium">
                    {language === 'es' ? 'Vigente desde' : 'Effective from'}
                  </div>
                  <div>{formatDate(content.effective_date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <div>
                  <div className="font-medium">
                    {language === 'es' ? 'Versión' : 'Version'}
                  </div>
                  <div>{content.version}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Languages className="h-4 w-4" />
                <div>
                  <div className="font-medium">
                    {language === 'es' ? 'Idioma' : 'Language'}
                  </div>
                  <div>{language === 'es' ? 'Español' : 'English'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <div>
                  <div className="font-medium">
                    {language === 'es' ? 'Cumplimiento' : 'Compliance'}
                  </div>
                  <div>GDPR/AEPD 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                {/* Table of Contents */}
                {showTableOfContents && sections.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        {language === 'es' ? 'Índice de Contenidos' : 'Table of Contents'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-0 pb-6">
                      <TableOfContents
                        sections={sections}
                        language={language}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Version Selector */}
                {showVersionSelector && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        {language === 'es' ? 'Versiones' : 'Versions'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* VersionSelector temporarily disabled due to SSR conflicts */}
                      <div className="text-center text-muted-foreground text-xs">
                        {language === 'es' ? 'Versión actual' : 'Current version'}: {content.version}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      {language === 'es' ? 'Acciones' : 'Actions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Print Button */}
                    {showPrintButton && (
                      <PrintButton
                        content={content}
                        language={language}
                        className="w-full"
                      />
                    )}

                    {/* Language Toggle */}
                    <Link
                      href={language === 'es'
                        ? `/legal/${getSpanishSlug(content.document_type)}/en`
                        : `/legal/${getSpanishSlug(content.document_type)}`
                      }
                    >
                      <Button variant="outline" className="w-full">
                        <Languages className="h-4 w-4 mr-2" />
                        {language === 'es' ? 'English' : 'Español'}
                      </Button>
                    </Link>

                    {/* Contact for Legal Questions */}
                    <Link href={language === 'es' ? '/contacto' : '/en/contact'}>
                      <Button variant="ghost" className="w-full text-xs">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        {language === 'es' ? 'Consultas legales' : 'Legal inquiries'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Compliance Notice */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div className="text-xs text-muted-foreground">
                        <div className="font-semibold mb-1">
                          {language === 'es' ? 'Cumplimiento GDPR' : 'GDPR Compliance'}
                        </div>
                        <p>
                          {language === 'es'
                            ? 'Este documento cumple con el GDPR y las directrices AEPD 2025.'
                            : 'This document complies with GDPR and AEPD 2025 guidelines.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Main Content */}
              <main className="lg:col-span-3">
                <Card className="shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    {/* Last Updated Notice */}
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                      <p className="text-sm text-muted-foreground">
                        <strong>
                          {language === 'es' ? 'Última actualización:' : 'Last updated:'}
                        </strong>
                        {' '}{formatDate(content.updated_at)}
                      </p>
                    </div>

                    {/* Dynamic Content */}
                    {children}

                    {/* Footer */}
                    <Separator className="my-8" />
                    <div className="text-xs text-muted-foreground text-center">
                      <p>
                        {language === 'es'
                          ? `© ${new Date().getFullYear()} Enigma Cocina Con Alma. Documento versión ${content.version} efectivo desde ${formatDate(content.effective_date)}.`
                          : `© ${new Date().getFullYear()} Enigma Cocina Con Alma. Document version ${content.version} effective from ${formatDate(content.effective_date)}.`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </main>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getEnglishSlug(documentType: LegalDocumentType): string {
  const slugMap: Record<LegalDocumentType, string> = {
    privacy_policy: 'privacy-policy',
    terms_conditions: 'terms-conditions',
    cookie_policy: 'cookie-policy',
    legal_notice: 'legal-notice',
    gdpr_rights: 'gdpr-rights'
  }
  return slugMap[documentType]
}

function getSpanishSlug(documentType: LegalDocumentType): string {
  const slugMap: Record<LegalDocumentType, string> = {
    privacy_policy: 'politica-privacidad',
    terms_conditions: 'terminos-condiciones',
    cookie_policy: 'politica-cookies',
    legal_notice: 'aviso-legal',
    gdpr_rights: 'derechos-gdpr'
  }
  return slugMap[documentType]
}

// ============================================
// METADATA GENERATION HELPER
// ============================================

export function generateLegalPageMetadata(
  content: LegalContent,
  language: Language
): Metadata {
  const docInfo = DOCUMENT_TYPE_INFO[content.document_type]

  const baseUrl = language === 'es'
    ? 'https://enigmaconalma.com'
    : 'https://enigmaconalma.com/en'

  const path = language === 'es'
    ? `/legal/${getSpanishSlug(content.document_type)}`
    : `/legal/${getEnglishSlug(content.document_type)}`

  return {
    title: `${content.title} - Enigma Cocina Con Alma`,
    description: docInfo.description[language],
    keywords: [
      language === 'es' ? 'legal' : 'legal',
      language === 'es' ? 'términos' : 'terms',
      language === 'es' ? 'privacidad' : 'privacy',
      'GDPR',
      'AEPD',
      'Enigma Cocina Con Alma',
      'restaurante Calpe'
    ],
    openGraph: {
      title: content.title,
      description: docInfo.description[language],
      url: `${baseUrl}${path}`,
      type: 'article',
      publishedTime: content.effective_date,
      modifiedTime: content.updated_at
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        es: `https://enigmaconalma.com/legal/${getSpanishSlug(content.document_type)}`,
        en: `https://enigmaconalma.com/en/legal/${getEnglishSlug(content.document_type)}`
      }
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export default LegalPageLayout