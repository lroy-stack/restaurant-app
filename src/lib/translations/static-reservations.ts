/**
 * Static translations for reservation page hero section
 * Provides instant load time (0ms latency) for critical above-the-fold content
 * Synced with database: page_translations table (page_key='reservations', section_key='hero')
 */

export const HERO_TRANSLATIONS = {
  es: {
    badge: 'Reserva Online',
    title: 'Reservar Mesa',
    subtitle: 'Reserva tu experiencia culinaria en el corazón del casco antiguo de Calpe. Cocina mediterránea con productos locales y vistas a las callejuelas históricas.',
    connection_live: 'En vivo',
    connection_offline: 'Sin conexión',
    trustSignals_confirmation: 'Confirmación inmediata',
    trustSignals_gdpr: 'Cumplimiento GDPR',
    trustSignals_cancellation: 'Cancelación gratuita'
  },
  en: {
    badge: 'Online Booking',
    title: 'Book a Table',
    subtitle: 'Reserve your culinary experience in the heart of Calpe old town. Mediterranean cuisine with local products and views of historic streets.',
    connection_live: 'Live',
    connection_offline: 'Offline',
    trustSignals_confirmation: 'Instant confirmation',
    trustSignals_gdpr: 'GDPR compliant',
    trustSignals_cancellation: 'Free cancellation'
  },
  de: {
    badge: 'Online Reservierung',
    title: 'Tisch reservieren',
    subtitle: 'Reservieren Sie Ihr kulinarisches Erlebnis im Herzen der Altstadt von Calpe. Mediterrane Küche mit lokalen Produkten und Blick auf historische Gassen.',
    connection_live: 'Live',
    connection_offline: 'Offline',
    trustSignals_confirmation: 'Sofortige Bestätigung',
    trustSignals_gdpr: 'DSGVO-konform',
    trustSignals_cancellation: 'Kostenlose Stornierung'
  }
} as const

export type Language = 'es' | 'en' | 'de'

export function getHeroTranslation(language: Language, key: string, fallback: string = ''): string {
  const translations = HERO_TRANSLATIONS[language]
  return (translations as any)[key] || fallback
}
