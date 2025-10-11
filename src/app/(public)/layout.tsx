import { ReactNode } from 'react'
import Script from 'next/script'
import { PublicLayout } from '@/components/layout/public-layout'
import { QueryProvider } from '@/providers/query-provider'
import { getLocalBusinessSchema } from '@/lib/metadata'

interface PublicRouteLayoutProps {
  children: ReactNode
}

/**
 * Public Route Group Layout
 *
 * Este layout se aplica a todas las páginas públicas dentro del Route Group (public)
 * Incluye: navbar flotante, footer, estructura básica pública y JSON-LD schema
 *
 * Páginas afectadas:
 * - / (homepage)
 * - /historia
 * - /menu
 * - /galeria
 * - /contacto
 * - /reservas
 */
export default function PublicRouteLayout({ children }: PublicRouteLayoutProps) {
  const schema = getLocalBusinessSchema()

  return (
    <>
      {/* JSON-LD Schema for LocalBusiness SEO */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <QueryProvider>
        <PublicLayout>
          {children}
        </PublicLayout>
      </QueryProvider>
    </>
  )
}