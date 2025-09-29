// hooks/use-legal-image.ts
// Centralized hook for legal pages image - GDPR compliant hero image
// PRP Implementation: Consistent branding across all legal documentation

import { useMemo } from 'react'

interface LegalImageConfig {
  src: string
  alt: string
  priority: boolean
  className: string
  sizes: string
}

export function useLegalImage(): LegalImageConfig {
  return useMemo(() => ({
    src: 'https://ik.imagekit.io/insomnialz/enigma_logo.jpg?updatedAt=1758793897667',
    alt: 'Enigma Cocina Con Alma - Logo oficial para documentos legales',
    priority: true,
    className: 'w-auto h-16 md:h-20 object-contain mx-auto mb-6',
    sizes: '(max-width: 768px) 200px, 250px'
  }), [])
}

export default useLegalImage