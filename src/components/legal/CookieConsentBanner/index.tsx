'use client'

// components/legal/CookieConsentBanner/index.tsx
// AEPD 2025 Compliant Cookie Consent Banner
// PRP Implementation: Complete GDPR Article 7 & AEPD Cookie Compliance

import { useEffect, useRef, useState } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import {
  ConsentMethod,
  CookiePreferences,
  LEGAL_CONSTANTS
} from '@/types/legal'
import { cn } from '@/lib/utils'
import 'vanilla-cookieconsent/dist/cookieconsent.css'

// ============================================
// COOKIE CATEGORIES (AEPD 2025 COMPLIANT)
// ============================================

const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  FUNCTIONALITY: 'functionality',
  SECURITY: 'security'
} as const

const COOKIE_SERVICES = {
  ANALYTICS_STORAGE: 'analytics_storage',
  AD_STORAGE: 'ad_storage',
  FUNCTIONALITY_STORAGE: 'functionality_storage',
  SECURITY_STORAGE: 'security_storage',
  PERSONALIZATION_STORAGE: 'personalization_storage'
} as const

// ============================================
// COMPONENT INTERFACES
// ============================================

interface CookieConsentBannerProps {
  language?: 'es' | 'en'
  customerId?: string
  sessionId?: string
  onConsentChange?: (preferences: CookiePreferences) => void
  className?: string
}

interface ConsentConfig {
  autoShow: boolean
  revision: number
  mode: 'opt-in' | 'opt-out'
  manageScriptTags: boolean
  hideFromBots: boolean
  disablePageInteraction: boolean
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CookieConsentBanner({
  language = 'es',
  customerId,
  sessionId,
  onConsentChange,
  className
}: CookieConsentBannerProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [consentId, setConsentId] = useState<string | null>(null)
  const configRef = useRef<any>(null)

  // ============================================
  // CONSENT CONFIGURATION (AEPD 2025)
  // ============================================

  const getConsentConfig = (): any => ({
    // Core Configuration
    autoShow: true,
    revision: 1,
    mode: 'opt-in' as const, // AEPD requires opt-in
    manageScriptTags: true,
    hideFromBots: true,
    disablePageInteraction: false,

    // UI Configuration (AEPD 2025 Equal Prominence)
    guiOptions: {
      consentModal: {
        layout: 'box wide',
        position: 'bottom center',
        equalWeightButtons: true, // AEPD 2025 requirement
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        position: 'right',
        equalWeightButtons: true,
        flipButtons: false
      }
    },

    // Event Handlers
    onFirstConsent: () => {
      handleFirstConsent()
      // Dispatch event for announcement system
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cookieConsentResolved'))
      }
    },
    onConsent: () => {
      handleConsentChange()
      // Dispatch event for announcement system
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cookieConsentResolved'))
      }
    },
    onChange: handleConsentChange,

    // Categories (AEPD 2025 Standard Categories)
    categories: {
      [COOKIE_CATEGORIES.NECESSARY]: {
        enabled: true,
        readOnly: true, // Cannot be disabled per AEPD
        autoClear: {
          cookies: [
            { name: /^cc_/ }, // Our consent cookies
            { name: 'next-auth.session-token' },
            { name: 'next-auth.csrf-token' }
          ]
        }
      },
      [COOKIE_CATEGORIES.ANALYTICS]: {
        enabled: false,
        autoClear: {
          cookies: [
            { name: /^_ga/ },
            { name: '_gid' },
            { name: /^_gtag/ }
          ]
        },
        services: {
          [COOKIE_SERVICES.ANALYTICS_STORAGE]: {
            label: language === 'es'
              ? 'Almacenamiento relacionado con análisis como duración de visitas'
              : 'Storage related to analytics such as visit duration'
          }
        }
      },
      [COOKIE_CATEGORIES.MARKETING]: {
        enabled: false,
        autoClear: {
          cookies: [
            { name: /^_fbp/ },
            { name: /^_fbc/ },
            { name: /^fr/ }
          ]
        },
        services: {
          [COOKIE_SERVICES.AD_STORAGE]: {
            label: language === 'es'
              ? 'Almacenamiento relacionado con publicidad'
              : 'Storage related to advertising'
          }
        }
      },
      [COOKIE_CATEGORIES.FUNCTIONALITY]: {
        enabled: false,
        services: {
          [COOKIE_SERVICES.FUNCTIONALITY_STORAGE]: {
            label: language === 'es'
              ? 'Almacenamiento que soporta la funcionalidad del sitio web'
              : 'Storage that supports website functionality'
          },
          [COOKIE_SERVICES.PERSONALIZATION_STORAGE]: {
            label: language === 'es'
              ? 'Almacenamiento para personalización como recomendaciones'
              : 'Storage for personalization such as recommendations'
          }
        }
      },
      [COOKIE_CATEGORIES.SECURITY]: {
        enabled: false,
        services: {
          [COOKIE_SERVICES.SECURITY_STORAGE]: {
            label: language === 'es'
              ? 'Almacenamiento esencial para seguridad y prevención de fraude'
              : 'Storage essential for security and fraud prevention'
          }
        }
      }
    },

    // Translations
    language: {
      default: language,
      translations: {
        es: getSpanishTranslations(),
        en: getEnglishTranslations()
      }
    }
  })

  // ============================================
  // EVENT HANDLERS
  // ============================================

  async function handleFirstConsent() {
    try {
      const preferences = getCookiePreferences()
      const newConsentId = generateConsentId()

      await persistConsentToDatabase(preferences, newConsentId, 'banner_accept_all')

      setConsentId(newConsentId)
      setHasConsent(true)
      onConsentChange?.(preferences)
    } catch (error) {
      console.error('Error handling first consent:', error)
    }
  }

  async function handleConsentChange() {
    try {
      if (!consentId) return

      const preferences = getCookiePreferences()
      await updateConsentInDatabase(preferences)

      onConsentChange?.(preferences)
    } catch (error) {
      console.error('Error handling consent change:', error)
    }
  }

  // ============================================
  // CONSENT MANAGEMENT
  // ============================================

  function getCookiePreferences(): CookiePreferences {
    return {
      necessary: true, // Always true per AEPD
      analytics: CookieConsent.acceptedCategory(COOKIE_CATEGORIES.ANALYTICS),
      marketing: CookieConsent.acceptedCategory(COOKIE_CATEGORIES.MARKETING),
      functionality: CookieConsent.acceptedCategory(COOKIE_CATEGORIES.FUNCTIONALITY),
      security: CookieConsent.acceptedCategory(COOKIE_CATEGORIES.SECURITY)
    }
  }

  function generateConsentId(): string {
    return 'cc_' + crypto.randomUUID()
  }

  async function persistConsentToDatabase(
    preferences: CookiePreferences,
    newConsentId: string,
    method: ConsentMethod
  ): Promise<void> {
    try {
      // Calculate expiry date (24 months max per AEPD)
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + LEGAL_CONSTANTS.MAX_CONSENT_DURATION_MONTHS)

      const consentData = {
        session_id: sessionId || null,
        customer_id: customerId || null,
        consent_id: newConsentId,
        necessary_cookies: preferences.necessary,
        analytics_cookies: preferences.analytics,
        marketing_cookies: preferences.marketing,
        functionality_cookies: preferences.functionality,
        security_cookies: preferences.security,
        consent_method: method,
        expiry_timestamp: expiryDate.toISOString(),
        ip_address: await getClientIpAddress(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        referrer: document.referrer || null,
        policy_version: LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
      }

      // Call API to store consent
      await fetch('/api/legal/cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: customerId,
          sessionId: sessionId || generateSessionId(),
          consentMethod: method,
          analyticsConsent: preferences.analytics,
          marketingConsent: preferences.marketing,
          functionalConsent: preferences.functionality,
          userAgent: navigator.userAgent,
          language: language
        })
      })

      // Store consent ID in localStorage for future reference
      localStorage.setItem(LEGAL_CONSTANTS.COOKIE_CONSENT_STORAGE_KEY, newConsentId)
    } catch (error) {
      console.error('Error persisting consent to database:', error)
    }
  }

  async function updateConsentInDatabase(preferences: CookiePreferences): Promise<void> {
    try {
      if (!consentId) return

      const updateData = {
        analytics_cookies: preferences.analytics,
        marketing_cookies: preferences.marketing,
        functionality_cookies: preferences.functionality,
        security_cookies: preferences.security
      }

      // Call API to update consent
      await fetch('/api/legal/cookies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consentId,
          analyticsConsent: preferences.analytics,
          marketingConsent: preferences.marketing,
          functionalConsent: preferences.functionality
        })
      })
    } catch (error) {
      console.error('Error updating consent in database:', error)
    }
  }

  function generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  async function getClientIpAddress(): Promise<string> {
    try {
      // In production, this would be provided by the server or IP geolocation service
      return '127.0.0.1' // Placeholder for local development
    } catch (error) {
      return '127.0.0.1'
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    if (isInitialized) return

    const initializeCookieConsent = async () => {
      const existingConsentId = localStorage.getItem(LEGAL_CONSTANTS.COOKIE_CONSENT_STORAGE_KEY)

      if (existingConsentId) {
        try {
          // Validate existing consent before proceeding
          const response = await fetch(`/api/legal/cookies?consentId=${existingConsentId}`)
          const data = await response.json()

          if (data.success && data.consent && !data.consent.withdrawal_timestamp &&
              new Date(data.consent.expiry_timestamp) > new Date()) {
            // Valid consent found - skip popup
            setConsentId(existingConsentId)
            setHasConsent(true)
            setIsInitialized(true)
            return // Do not run CookieConsent.run()
          } else {
            // Invalid or expired consent - clear localStorage
            localStorage.removeItem(LEGAL_CONSTANTS.COOKIE_CONSENT_STORAGE_KEY)
          }
        } catch (error) {
          console.error('Error validating existing consent:', error)
          // On error, clear localStorage and show popup
          localStorage.removeItem(LEGAL_CONSTANTS.COOKIE_CONSENT_STORAGE_KEY)
        }
      }

      // No valid consent found - initialize cookie consent popup
      const config = getConsentConfig()
      configRef.current = config

      CookieConsent.run(config)
      setIsInitialized(true)
    }

    initializeCookieConsent()

    return () => {
      // Cleanup if needed
      try {
        CookieConsent.reset()
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }, [language, customerId, sessionId])

  // ============================================
  // CONSENT UTILITIES
  // ============================================

  const showPreferences = () => {
    CookieConsent.showPreferences()
  }

  const canUseCookies = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return true
    return CookieConsent.acceptedCategory(
      COOKIE_CATEGORIES[category.toUpperCase() as keyof typeof COOKIE_CATEGORIES]
    )
  }

  // ============================================
  // COMPONENT CONTEXT
  // ============================================

  const contextValue = {
    isInitialized,
    hasConsent,
    consentId,
    showPreferences,
    canUseCookies,
    getCookiePreferences
  }

  // Provide context to child components
  return (
    <div className={cn('cookie-consent-provider', className)} data-consent-initialized={isInitialized}>
      {/* Cookie consent UI is handled by vanilla-cookieconsent */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.cookieConsentContext = ${JSON.stringify(contextValue)};
          `
        }}
      />
    </div>
  )
}

// ============================================
// TRANSLATION FUNCTIONS
// ============================================

function getSpanishTranslations() {
  return {
    consentModal: {
      title: 'Utilizamos cookies',
      description: 'Este sitio web utiliza cookies esenciales para su correcto funcionamiento y cookies de seguimiento para entender cómo interactúas con él. Estas últimas se establecerán solo después del consentimiento.',
      acceptAllBtn: 'Aceptar todas',
      acceptNecessaryBtn: 'Rechazar todas',
      showPreferencesBtn: 'Gestionar preferencias individuales',
      footer: `
        <a href="/legal/politica-cookies">Política de Cookies</a>
        <a href="/legal/politica-privacidad">Política de Privacidad</a>
      `
    },
    preferencesModal: {
      title: 'Gestionar preferencias de cookies',
      acceptAllBtn: 'Aceptar todas',
      acceptNecessaryBtn: 'Rechazar todas',
      savePreferencesBtn: 'Aceptar selección actual',
      closeIconLabel: 'Cerrar modal',
      serviceCounterLabel: 'Servicio|Servicios',
      sections: [
        {
          title: 'Uso de cookies',
          description: 'Utilizamos cookies para garantizar las funcionalidades básicas del sitio web y mejorar tu experiencia online.'
        },
        {
          title: 'Cookies estrictamente necesarias',
          description: 'Estas cookies son esenciales para el correcto funcionamiento del sitio web.',
          linkedCategory: COOKIE_CATEGORIES.NECESSARY
        },
        {
          title: 'Cookies de análisis',
          description: 'Las cookies de análisis nos ayudan a entender cómo los usuarios interactúan con el sitio web.',
          linkedCategory: COOKIE_CATEGORIES.ANALYTICS,
          cookieTable: {
            headers: {
              name: 'Nombre',
              domain: 'Servicio',
              description: 'Descripción',
              expiration: 'Expiración'
            },
            body: [
              {
                name: '_ga',
                domain: 'Google Analytics',
                description: 'Cookie establecida por Google Analytics',
                expiration: 'Expira después de 12 días'
              },
              {
                name: '_gid',
                domain: 'Google Analytics',
                description: 'Cookie establecida por Google Analytics',
                expiration: 'Sesión'
              }
            ]
          }
        },
        {
          title: 'Cookies de marketing',
          description: 'Las cookies de marketing se utilizan para rastrear visitantes en sitios web para mostrar anuncios relevantes.',
          linkedCategory: COOKIE_CATEGORIES.MARKETING
        },
        {
          title: 'Cookies de funcionalidad',
          description: 'Las cookies de funcionalidad permiten recordar las elecciones que haces para proporcionarte funciones mejoradas.',
          linkedCategory: COOKIE_CATEGORIES.FUNCTIONALITY
        },
        {
          title: 'Cookies de seguridad',
          description: 'Las cookies de seguridad ayudan a identificar e impedir riesgos de seguridad.',
          linkedCategory: COOKIE_CATEGORIES.SECURITY
        },
        {
          title: 'Más información',
          description: 'Para cualquier consulta relacionada con la política de cookies y tus opciones, por favor <a href="/contacto">contáctanos</a>.'
        }
      ]
    }
  }
}

function getEnglishTranslations() {
  return {
    consentModal: {
      title: 'We use cookies',
      description: 'This website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent.',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      showPreferencesBtn: 'Manage individual preferences',
      footer: `
        <a href="/en/legal/cookie-policy">Cookie Policy</a>
        <a href="/en/legal/privacy-policy">Privacy Policy</a>
      `
    },
    preferencesModal: {
      title: 'Manage cookie preferences',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      savePreferencesBtn: 'Accept current selection',
      closeIconLabel: 'Close modal',
      serviceCounterLabel: 'Service|Services',
      sections: [
        {
          title: 'Cookie usage',
          description: 'We use cookies to ensure the basic functionalities of the website and to enhance your online experience.'
        },
        {
          title: 'Strictly necessary cookies',
          description: 'These cookies are essential for the proper functioning of the website.',
          linkedCategory: COOKIE_CATEGORIES.NECESSARY
        },
        {
          title: 'Analytics cookies',
          description: 'Analytics cookies help us understand how users interact with the website.',
          linkedCategory: COOKIE_CATEGORIES.ANALYTICS,
          cookieTable: {
            headers: {
              name: 'Name',
              domain: 'Service',
              description: 'Description',
              expiration: 'Expiration'
            },
            body: [
              {
                name: '_ga',
                domain: 'Google Analytics',
                description: 'Cookie set by Google Analytics',
                expiration: 'Expires after 12 days'
              },
              {
                name: '_gid',
                domain: 'Google Analytics',
                description: 'Cookie set by Google Analytics',
                expiration: 'Session'
              }
            ]
          }
        },
        {
          title: 'Marketing cookies',
          description: 'Marketing cookies are used to track visitors across websites to display relevant ads.',
          linkedCategory: COOKIE_CATEGORIES.MARKETING
        },
        {
          title: 'Functionality cookies',
          description: 'Functionality cookies allow remembering choices you make to provide you with enhanced features.',
          linkedCategory: COOKIE_CATEGORIES.FUNCTIONALITY
        },
        {
          title: 'Security cookies',
          description: 'Security cookies help identify and prevent security risks.',
          linkedCategory: COOKIE_CATEGORIES.SECURITY
        },
        {
          title: 'More information',
          description: 'For any queries in relation to the policy on cookies and your choices, please <a href="/contact">contact us</a>.'
        }
      ]
    }
  }
}

// ============================================
// CONTEXT HOOK FOR CHILD COMPONENTS
// ============================================

export const useCookieConsent = () => {
  if (typeof window === 'undefined') {
    return {
      isInitialized: false,
      hasConsent: false,
      consentId: null,
      showPreferences: () => {},
      canUseCookies: () => false,
      getCookiePreferences: () => ({
        necessary: true,
        analytics: false,
        marketing: false,
        functionality: false,
        security: false
      }),
      consentService: null
    }
  }

  return (window as any).cookieConsentContext || {
    isInitialized: false,
    hasConsent: false,
    consentId: null,
    showPreferences: () => {},
    canUseCookies: () => false,
    getCookiePreferences: () => ({
      necessary: true,
      analytics: false,
      marketing: false,
      functionality: false,
      security: false
    }),
    consentService: null
  }
}

export default CookieConsentBanner