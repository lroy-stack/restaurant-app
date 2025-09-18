import { ReactNode } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'

interface PublicRouteLayoutProps {
  children: ReactNode
}

/**
 * Public Route Group Layout
 * 
 * Este layout se aplica a todas las páginas públicas dentro del Route Group (public)
 * Incluye: navbar flotante, footer, y estructura básica pública
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
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  )
}