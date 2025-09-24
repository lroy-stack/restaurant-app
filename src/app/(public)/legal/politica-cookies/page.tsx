// app/(public)/legal/politica-cookies/page.tsx
// Cookie Policy Page (Spanish) - AEPD 2025 Compliant Cookie Information
// PRP Implementation: Complete AEPD 2025 Cookie Policy with Dynamic Consent Management

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPageLayout, generateLegalPageMetadata } from '@/components/legal/LegalPageLayout'
import { createLegalContentService } from '@/lib/services/legal/legalContentService'
import { processContentForTOC } from '@/lib/utils/legal-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, BarChart, Target, Wrench, Lock } from 'lucide-react'

// ============================================
// METADATA GENERATION
// ============================================

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalService = await createLegalContentService()
    const content = await legalService.getActiveContent('cookie_policy', 'es')

    if (!content) {
      return {
        title: 'Política de Cookies - Enigma Cocina Con Alma',
        description: 'Política de cookies de Enigma Cocina Con Alma - Información sobre el uso de cookies conforme AEPD 2025 y GDPR.'
      }
    }

    return generateLegalPageMetadata(content, 'es')
  } catch (error) {
    console.error('Error generating metadata for cookie policy:', error)
    return {
      title: 'Política de Cookies - Enigma Cocina Con Alma',
      description: 'Política de cookies de Enigma Cocina Con Alma - Información sobre el uso de cookies conforme AEPD 2025 y GDPR.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function PoliticaCookiesPage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch cookie policy content from database
    const content = await legalService.getActiveContent('cookie_policy', 'es')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'cookie_policy',
      'es',
      '127.0.0.1', // Server-side, would need middleware for real IP
      'Next.js SSR'
    )

    // Process content sections for TOC
    const sections = processContentForTOC(content.content)

    return (
      <LegalPageLayout
        content={content}
        language="es"
        showTableOfContents={sections.length > 0}
        showVersionSelector={true}
        showPrintButton={true}
        backUrl="/"
      >
        <CookiePolicyContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading cookie policy page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface CookiePolicyContentProps {
  content: any
}

function CookiePolicyContent({ content }: CookiePolicyContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default cookie policy
  if (sections.length === 0) {
    return <DefaultCookiePolicyContent />
  }

  return (
    <div className="legal-content space-y-6">
      {sections.map((section: any, index: number) => (
        <section
          key={section.id || `section-${index}`}
          id={section.id || `section-${index}`}
          className="scroll-mt-20"
        >
          <h2 className="enigma-section-title mb-4">
            {section.title}
          </h2>

          <div
            className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: section.content || section.text || ''
            }}
          />

          {/* Render subsections if they exist */}
          {section.subsections && section.subsections.length > 0 && (
            <div className="mt-4 ml-4 space-y-4">
              {section.subsections.map((subsection: any, subIndex: number) => (
                <div
                  key={subsection.id || `subsection-${index}-${subIndex}`}
                  id={subsection.id || `subsection-${index}-${subIndex}`}
                  className="scroll-mt-20"
                >
                  <h3 className="enigma-subsection-title mb-2">
                    {subsection.title}
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: subsection.content || subsection.text || ''
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

// ============================================
// DEFAULT CONTENT (AEPD 2025 COMPLIANT FALLBACK)
// ============================================

function DefaultCookiePolicyContent() {
  return (
    <div className="legal-content space-y-6">
      {/* Cookie Consent Manager */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="enigma-subsection-title">Gestor de Consentimiento</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Puede modificar sus preferencias de cookies en cualquier momento utilizando nuestro gestor de consentimiento.
          </p>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => {
              // This would trigger the cookie consent modal
              if (typeof window !== 'undefined' && (window as any).CookieConsent) {
                (window as any).CookieConsent.showPreferences()
              }
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Cookies
          </Button>
        </CardContent>
      </Card>

      <section id="que-son-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          ¿Qué son las Cookies?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Permiten que el sitio web recuerde sus acciones y preferencias durante un período de tiempo, para no tener que reintroducirlas cada vez que regrese al sitio o navegue de una página a otra.
          </p>
          <p>
            En cumplimiento de las directrices AEPD 2025 y el RGPD, utilizamos cookies únicamente con su consentimiento explícito, excepto para aquellas estrictamente necesarias para el funcionamiento del sitio web.
          </p>
        </div>
      </section>

      <section id="tipos-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Tipos de Cookies que Utilizamos
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Necessary Cookies */}
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Cookies Necesarias</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Siempre Activas
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Esenciales para el funcionamiento básico del sitio web. No pueden ser deshabilitadas.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Gestión de sesiones</li>
                <li>• Autenticación de usuarios</li>
                <li>• Protección CSRF</li>
                <li>• Preferencias de idioma</li>
              </ul>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Cookies de Análisis</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Opcional
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Nos ayudan a entender cómo los usuarios interactúan con el sitio web.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Google Analytics</li>
                <li>• Estadísticas de uso</li>
                <li>• Análisis de rendimiento</li>
                <li>• Informes de errores</li>
              </ul>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Cookies de Marketing</h3>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Opcional
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Utilizadas para mostrar contenido relevante y personalizado.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Publicidad personalizada</li>
                <li>• Remarketing</li>
                <li>• Análisis de campañas</li>
                <li>• Redes sociales</li>
              </ul>
            </CardContent>
          </Card>

          {/* Functionality Cookies */}
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Cookies de Funcionalidad</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Opcional
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Mejoran la funcionalidad y personalización del sitio web.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Preferencias de usuario</li>
                <li>• Configuración personalizada</li>
                <li>• Widgets interactivos</li>
                <li>• Chat de soporte</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="cookies-especificas" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Cookies Específicas Utilizadas
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-xs">
              <thead>
                <tr className="bg-muted/30">
                  <th className="border border-border p-2 text-left">Nombre</th>
                  <th className="border border-border p-2 text-left">Categoría</th>
                  <th className="border border-border p-2 text-left">Propósito</th>
                  <th className="border border-border p-2 text-left">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-mono">enigma_cookie_consent</td>
                  <td className="border border-border p-2">Necesaria</td>
                  <td className="border border-border p-2">Almacena sus preferencias de cookies</td>
                  <td className="border border-border p-2">24 meses</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">next-auth.session-token</td>
                  <td className="border border-border p-2">Necesaria</td>
                  <td className="border border-border p-2">Gestión de sesiones de usuario</td>
                  <td className="border border-border p-2">Sesión</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">_ga</td>
                  <td className="border border-border p-2">Análisis</td>
                  <td className="border border-border p-2">Google Analytics - Identificación única</td>
                  <td className="border border-border p-2">2 años</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">_gid</td>
                  <td className="border border-border p-2">Análisis</td>
                  <td className="border border-border p-2">Google Analytics - Identificación de sesión</td>
                  <td className="border border-border p-2">24 horas</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">_fbp</td>
                  <td className="border border-border p-2">Marketing</td>
                  <td className="border border-border p-2">Facebook Pixel - Seguimiento de conversiones</td>
                  <td className="border border-border p-2">3 meses</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="consentimiento-aepd" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Consentimiento según AEPD 2025
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            En cumplimiento de las directrices AEPD 2025, implementamos las siguientes medidas:
          </p>
          <ul>
            <li><strong>Consentimiento previo:</strong> Solicitamos su consentimiento antes de instalar cookies no esenciales</li>
            <li><strong>Información clara:</strong> Proporcionamos información detallada sobre cada tipo de cookie</li>
            <li><strong>Granularidad:</strong> Puede aceptar o rechazar cada categoría de cookies por separado</li>
            <li><strong>Igual prominencia:</strong> Los botones de aceptar y rechazar tienen el mismo peso visual</li>
            <li><strong>Renovación:</strong> El consentimiento caduca después de 24 meses máximo</li>
            <li><strong>Retirada fácil:</strong> Puede retirar su consentimiento en cualquier momento</li>
          </ul>
        </div>
      </section>

      <section id="gestion-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Cómo Gestionar sus Cookies
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">A través de nuestro sitio web</h3>
          <p>
            Puede gestionar sus preferencias de cookies utilizando el banner de consentimiento que aparece en su primera visita o accediendo al gestor de cookies desde cualquier página.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">A través de su navegador</h3>
          <p>
            También puede configurar las cookies directamente desde su navegador:
          </p>
          <ul>
            <li><strong>Chrome:</strong> Configuración &gt; Avanzada &gt; Privacidad y seguridad &gt; Configuración del sitio &gt; Cookies</li>
            <li><strong>Firefox:</strong> Opciones &gt; Privacidad y seguridad &gt; Cookies y datos del sitio</li>
            <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Gestionar datos del sitio web</li>
            <li><strong>Edge:</strong> Configuración &gt; Privacidad, búsqueda y servicios &gt; Cookies</li>
          </ul>

          <p className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
            <strong>Importante:</strong> Deshabilitar ciertas cookies puede afectar la funcionalidad del sitio web y su experiencia de usuario.
          </p>
        </div>
      </section>

      <section id="terceros" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Cookies de Terceros
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Algunos servicios de terceros que utilizamos pueden instalar sus propias cookies:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> Para análisis de tráfico y comportamiento</li>
            <li><strong>Google Maps:</strong> Para mostrar mapas interactivos</li>
            <li><strong>YouTube:</strong> Para contenido de vídeo embebido</li>
            <li><strong>Redes sociales:</strong> Para botones de compartir y widgets</li>
          </ul>
          <p>
            Estas cookies están sujetas a las políticas de privacidad de las respectivas empresas. Le recomendamos revisar sus políticas para obtener más información.
          </p>
        </div>
      </section>

      <section id="duracion-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Duración de las Cookies
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Las cookies pueden ser:
          </p>
          <ul>
            <li><strong>De sesión:</strong> Se eliminan cuando cierra el navegador</li>
            <li><strong>Persistentes:</strong> Permanecen en su dispositivo durante un tiempo determinado</li>
          </ul>
          <p>
            Según AEPD 2025, el consentimiento para cookies no esenciales tiene una duración máxima de 24 meses, tras los cuales debe renovarse.
          </p>
        </div>
      </section>

      <section id="derechos-usuario" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Sus Derechos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            En relación con las cookies, usted tiene derecho a:
          </p>
          <ul>
            <li><strong>Ser informado:</strong> Recibir información clara sobre el uso de cookies</li>
            <li><strong>Dar su consentimiento:</strong> Decidir qué cookies acepta</li>
            <li><strong>Retirar el consentimiento:</strong> Cambiar sus preferencias en cualquier momento</li>
            <li><strong>Configurar su navegador:</strong> Gestionar cookies directamente desde su navegador</li>
            <li><strong>Recibir el mismo servicio:</strong> El sitio debe funcionar con cookies esenciales únicamente</li>
          </ul>
        </div>
      </section>

      <section id="actualizaciones" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Actualizaciones de la Política
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Esta política de cookies puede actualizarse para reflejar cambios en nuestro uso de cookies o en la normativa aplicable. Las modificaciones importantes se comunicarán mediante banner informativo en el sitio web.
          </p>
          <p>
            Le recomendamos revisar esta política periódicamente para mantenerse informado sobre nuestro uso de cookies.
          </p>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contacto
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Para cualquier consulta sobre nuestra política de cookies:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Teléfono:</strong> +34 672 79 60 06</li>
            <li><strong>Dirección:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, España</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

