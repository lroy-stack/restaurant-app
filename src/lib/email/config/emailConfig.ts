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
 * Todas las URLs y branding en un solo lugar
 */
export function getEmailConfig(): EmailConfig {
  // 🔧 DEVELOPMENT: Use current port instead of NEXT_PUBLIC_SITE_URL
  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseUrl = isDevelopment
    ? 'http://localhost:3001'  // Use current development port
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://enigmaconalma.com')

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
 * Helper para generar URLs de tokens con parámetros
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