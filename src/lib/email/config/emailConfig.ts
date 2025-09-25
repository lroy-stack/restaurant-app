// Email Configuration - CENTRALIZADO
// SOLUCIÓN: Todas las URLs y configuración en un solo lugar

export interface EmailUrls {
  base: string
  menu: string
  reservas: string
  miReserva: string
  newsletter: string
  programaFidelidad: string
  tarjetasRegalo: string
  carta: string // legacy, redirects to menu

  // Social & External
  instagram: string
  facebook: string
  googleReviews: string
  tripadvisor: string
  googleMaps: string
}

export interface EmailConfig {
  urls: EmailUrls
  branding: {
    logo: string
    fonts: {
      googleFontsUrl: string
      primary: string
      secondary: string
      body: string
      elegant: string
    }
  }
  contact: {
    defaultReplyTo: string
    supportEmail: string
  }
}

/**
 * CONFIGURACIÓN CENTRALIZADA DE EMAILS
 * 🚨 CRITICAL: Email URLs ALWAYS point to production, regardless of environment
 * This ensures email links work from any development/staging environment
 */
export function getEmailConfig(): EmailConfig {
  // 🚨 EMAILS ALWAYS USE PRODUCTION URL - Never localhost/staging
  // Current: https://almaenigma.vercel.app (Vercel deployment)
  // Future: https://enigmaconalma.com (Final domain)
  // UNIFIED: Use same env var everywhere to avoid confusion
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL ||
                  process.env.NEXT_PUBLIC_SITE_URL ||
                  'https://almaenigma.vercel.app'

  return {
    urls: {
      base: baseUrl,
      menu: `${baseUrl}/menu`,
      reservas: `${baseUrl}/reservas`,
      miReserva: `${baseUrl}/mi-reserva`,
      newsletter: `${baseUrl}/newsletter`,
      programaFidelidad: `${baseUrl}/programa-fidelidad`,
      tarjetasRegalo: `${baseUrl}/tarjetas-regalo`,
      carta: `${baseUrl}/menu`, // Legacy redirect

      // Social & External
      instagram: 'https://instagram.com/enigmacocinacanalma',
      facebook: 'https://facebook.com/enigmacocinacanalma',
      googleReviews: 'https://g.page/r/enigmacocinacanalma/review',
      tripadvisor: 'https://tripadvisor.es/enigmacocinacanalma',
      googleMaps: 'https://maps.google.com/?q=enigma+cocina+con+alma+calpe+alicante'
    },

    branding: {
      logo: `${baseUrl}/logo512.png`,
      fonts: {
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Benaya:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Crimson+Text:wght@400;600&family=Inter:wght@300;400;500;600;700&display=swap',
        primary: 'Benaya, Georgia, serif',
        secondary: 'Playfair Display, Georgia, serif',
        body: 'Inter, system-ui, sans-serif',
        elegant: 'Crimson Text, Georgia, serif'
      }
    },

    contact: {
      defaultReplyTo: 'reservas@enigmaconalma.com',
      supportEmail: 'info@enigmaconalma.com'
    }
  }
}

/**
 * 🚨 CRITICAL: Helper para generar URLs de tokens - ALWAYS PRODUCTION
 * Email links must work regardless of development environment
 */
export function buildTokenUrl(token: string, action?: string): string {
  const config = getEmailConfig()
  let url = `${config.urls.miReserva}?token=${token}`

  if (action) {
    url += `&action=${action}`
  }

  return url
}

/**
 * 🚨 PRODUCTION-ONLY: URL builder specifically for emails
 * Used for any link that goes into customer emails
 */
export function buildProductionUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://almaenigma.vercel.app'
  let url = `${baseUrl}${path}`

  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  return url
}

/**
 * Helper para generar URLs con parámetros promocionales
 */
export function buildPromoUrl(path: string, promo?: string): string {
  const config = getEmailConfig()
  let url = `${config.urls.base}${path}`

  if (promo) {
    url += `?promo=${promo}`
  }

  return url
}