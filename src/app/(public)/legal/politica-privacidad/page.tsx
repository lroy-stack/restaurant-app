// app/(public)/legal/politica-privacidad/page.tsx
// Privacy Policy Page (Spanish) - Database-driven GDPR Compliant
// PRP Implementation: Complete GDPR/AEPD 2025 Privacy Policy

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPageLayout, generateLegalPageMetadata } from '@/components/legal/LegalPageLayout'
import { createLegalContentService } from '@/lib/services/legal/legalContentService'
import { processContentForTOC } from '@/lib/utils/legal-content'

// ============================================
// METADATA GENERATION
// ============================================

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalService = await createLegalContentService()
    const content = await legalService.getActiveContent('privacy_policy', 'es')

    if (!content) {
      return {
        title: 'Política de Privacidad - Enigma Cocina Con Alma',
        description: 'Política de privacidad de Enigma Cocina Con Alma - Información sobre el tratamiento de datos personales conforme GDPR y AEPD 2025.'
      }
    }

    return generateLegalPageMetadata(content, 'es')
  } catch (error) {
    console.error('Error generating metadata for privacy policy:', error)
    return {
      title: 'Política de Privacidad - Enigma Cocina Con Alma',
      description: 'Política de privacidad de Enigma Cocina Con Alma - Información sobre el tratamiento de datos personales conforme GDPR y AEPD 2025.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function PoliticaPrivacidadPage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch privacy policy content from database
    const content = await legalService.getActiveContent('privacy_policy', 'es')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'privacy_policy',
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
        <PrivacyPolicyContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading privacy policy page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface PrivacyPolicyContentProps {
  content: any
}

function PrivacyPolicyContent({ content }: PrivacyPolicyContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default privacy policy
  if (sections.length === 0) {
    return <DefaultPrivacyPolicyContent />
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
// DEFAULT CONTENT (GDPR COMPLIANT FALLBACK)
// ============================================

function DefaultPrivacyPolicyContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="informacion-general" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Información General
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            En cumplimiento del Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), le informamos sobre el tratamiento de sus datos personales.
          </p>
          <p>
            <strong>Responsable del tratamiento:</strong><br />
            Enigma Cocina Con Alma<br />
            Carrer Justicia 6A, 03710 Calpe, Alicante, España<br />
            Email: reservas@enigmaconalma.com<br />
            Teléfono: +34 672 79 60 06
          </p>
        </div>
      </section>

      <section id="datos-recopilados" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Datos Personales Recopilados
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Recopilamos los siguientes tipos de datos personales:
          </p>
          <ul>
            <li><strong>Datos de identificación:</strong> Nombre, apellidos, email, teléfono</li>
            <li><strong>Datos de reserva:</strong> Fecha, hora, número de comensales, preferencias alimentarias</li>
            <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, dispositivo utilizado</li>
            <li><strong>Datos de cookies:</strong> Preferencias de cookies, análisis de navegación</li>
            <li><strong>Datos de comunicación:</strong> Consultas, comentarios, valoraciones</li>
          </ul>
        </div>
      </section>

      <section id="finalidades-tratamiento" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Finalidades del Tratamiento
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Tratamos sus datos personales para las siguientes finalidades:
          </p>
          <ul>
            <li><strong>Gestión de reservas:</strong> Procesar y confirmar sus reservas de mesa</li>
            <li><strong>Atención al cliente:</strong> Responder a consultas y proporcionar soporte</li>
            <li><strong>Comunicaciones comerciales:</strong> Envío de ofertas y promociones (con su consentimiento)</li>
            <li><strong>Mejora del servicio:</strong> Análisis de satisfacción y mejora de la experiencia</li>
            <li><strong>Cumplimiento legal:</strong> Obligaciones fiscales y de seguridad alimentaria</li>
            <li><strong>Seguridad:</strong> Prevención de fraude y protección de nuestros sistemas</li>
          </ul>
        </div>
      </section>

      <section id="base-juridica" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Base Jurídica del Tratamiento
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            El tratamiento de sus datos se basa en:
          </p>
          <ul>
            <li><strong>Consentimiento (Art. 6.1.a RGPD):</strong> Para comunicaciones comerciales y cookies no esenciales</li>
            <li><strong>Ejecución contractual (Art. 6.1.b RGPD):</strong> Para gestionar reservas y prestación del servicio</li>
            <li><strong>Interés legítimo (Art. 6.1.f RGPD):</strong> Para mejora del servicio y seguridad</li>
            <li><strong>Obligación legal (Art. 6.1.c RGPD):</strong> Para cumplimiento de obligaciones fiscales</li>
          </ul>
        </div>
      </section>

      <section id="destinatarios" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Destinatarios de los Datos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Sus datos pueden ser comunicados a:
          </p>
          <ul>
            <li><strong>Proveedores de servicios técnicos:</strong> Hosting, mantenimiento web, sistemas de reservas</li>
            <li><strong>Administraciones públicas:</strong> Cuando sea legalmente requerido</li>
            <li><strong>Entidades financieras:</strong> Para procesamiento de pagos</li>
            <li><strong>Servicios de análisis:</strong> Google Analytics (con datos anonimizados)</li>
          </ul>
          <p>
            Todos nuestros proveedores cumplen con las garantías de protección de datos y han firmado acuerdos de encargado de tratamiento.
          </p>
        </div>
      </section>

      <section id="transferencias-internacionales" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Transferencias Internacionales
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Algunos de nuestros proveedores de servicios pueden procesar datos fuera del Espacio Económico Europeo. En estos casos, garantizamos que se implementan las salvaguardas adecuadas mediante:
          </p>
          <ul>
            <li>Decisiones de adecuación de la Comisión Europea</li>
            <li>Cláusulas contractuales tipo aprobadas por la Comisión</li>
            <li>Códigos de conducta y certificaciones aprobadas</li>
          </ul>
        </div>
      </section>

      <section id="retencion-datos" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Retención de Datos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Conservamos sus datos personales durante los siguientes períodos:
          </p>
          <ul>
            <li><strong>Datos de reserva:</strong> 5 años (obligaciones fiscales)</li>
            <li><strong>Consentimientos de cookies:</strong> Máximo 24 meses (AEPD 2025)</li>
            <li><strong>Comunicaciones comerciales:</strong> Hasta la retirada del consentimiento</li>
            <li><strong>Datos de contacto:</strong> Hasta solicitud de supresión</li>
            <li><strong>Logs de seguridad:</strong> 2 años</li>
          </ul>
        </div>
      </section>

      <section id="derechos-interesado" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Sus Derechos como Interesado
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Usted tiene derecho a:
          </p>
          <ul>
            <li><strong>Acceso (Art. 15 RGPD):</strong> Obtener información sobre el tratamiento de sus datos</li>
            <li><strong>Rectificación (Art. 16 RGPD):</strong> Corregir datos inexactos o incompletos</li>
            <li><strong>Supresión (Art. 17 RGPD):</strong> Solicitar la eliminación de sus datos</li>
            <li><strong>Limitación (Art. 18 RGPD):</strong> Restringir el tratamiento en determinados casos</li>
            <li><strong>Portabilidad (Art. 20 RGPD):</strong> Recibir sus datos en formato estructurado</li>
            <li><strong>Oposición (Art. 21 RGPD):</strong> Oponerse al tratamiento por motivos personales</li>
            <li><strong>Retirada del consentimiento:</strong> Retirar el consentimiento en cualquier momento</li>
          </ul>
          <p>
            Para ejercer estos derechos, puede contactar con nosotros en <strong>reservas@enigmaconalma.com</strong> o utilizar nuestro <a href="/legal/derechos-gdpr" className="text-primary hover:underline">formulario de derechos GDPR</a>.
          </p>
        </div>
      </section>

      <section id="cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Política de Cookies
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Utilizamos cookies y tecnologías similares conforme a las directrices AEPD 2025. Para información detallada sobre el uso de cookies, consulte nuestra <a href="/legal/politica-cookies" className="text-primary hover:underline">Política de Cookies</a>.
          </p>
          <p>
            Puede gestionar sus preferencias de cookies en cualquier momento a través del banner de consentimiento o en la configuración de su navegador.
          </p>
        </div>
      </section>

      <section id="medidas-seguridad" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Medidas de Seguridad
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra:
          </p>
          <ul>
            <li>Acceso no autorizado</li>
            <li>Alteración, pérdida o destrucción accidental</li>
            <li>Transferencia, difusión o acceso no autorizado</li>
          </ul>
          <p>
            Estas medidas incluyen cifrado de datos, control de acceso, copias de seguridad regulares y formación del personal.
          </p>
        </div>
      </section>

      <section id="menores" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Protección de Menores
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Nuestros servicios no están dirigidos a menores de 14 años. No recopilamos conscientemente datos personales de menores sin el consentimiento verificable de los padres o tutores legales.
          </p>
          <p>
            Si tiene conocimiento de que un menor ha proporcionado datos personales, póngase en contacto con nosotros para proceder a su eliminación.
          </p>
        </div>
      </section>

      <section id="autoridad-control" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Autoridad de Control
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos no se ajusta a la normativa:
          </p>
          <p>
            <strong>Agencia Española de Protección de Datos</strong><br />
            C/ Jorge Juan, 6, 28001 Madrid<br />
            Teléfono: 901 100 099 / 912 663 517<br />
            Web: <a href="https://www.aepd.es" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a>
          </p>
        </div>
      </section>

      <section id="modificaciones" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Modificaciones de la Política
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Esta política de privacidad puede ser modificada para adaptarse a cambios normativos o en nuestros servicios. Las modificaciones se comunicarán a través de nuestro sitio web con al menos 30 días de antelación.
          </p>
          <p>
            Le recomendamos revisar periódicamente esta política para mantenerse informado sobre cómo protegemos sus datos.
          </p>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contacto
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Para cualquier consulta sobre esta política de privacidad o el tratamiento de sus datos personales:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Teléfono:</strong> +34 672 79 60 06</li>
            <li><strong>Dirección:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, España</li>
            <li><strong>Formulario GDPR:</strong> <a href="/legal/derechos-gdpr" className="text-primary hover:underline">Ejercer derechos</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}

