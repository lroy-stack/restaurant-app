// app/(public)/legal/aviso-legal/page.tsx
// Legal Notice Page (Spanish) - Database-driven Dynamic Content
// PRP Implementation: GDPR/AEPD 2025 Compliant Legal Notice

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
    const content = await legalService.getActiveContent('legal_notice', 'es')

    if (!content) {
      return {
        title: 'Aviso Legal - Enigma Cocina Con Alma',
        description: 'Aviso legal de Enigma Cocina Con Alma - Información legal y datos identificativos del restaurante en Calpe.'
      }
    }

    return generateLegalPageMetadata(content, 'es')
  } catch (error) {
    console.error('Error generating metadata for legal notice:', error)
    return {
      title: 'Aviso Legal - Enigma Cocina Con Alma',
      description: 'Aviso legal de Enigma Cocina Con Alma - Información legal y datos identificativos del restaurante en Calpe.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function AvisoLegalPage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch legal content from database
    const content = await legalService.getActiveContent('legal_notice', 'es')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'legal_notice',
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
        <LegalNoticeContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading legal notice page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface LegalNoticeContentProps {
  content: any
}

function LegalNoticeContent({ content }: LegalNoticeContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default legal notice
  if (sections.length === 0) {
    return <DefaultLegalNoticeContent />
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
// DEFAULT CONTENT (FALLBACK)
// ============================================

function DefaultLegalNoticeContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="datos-identificativos" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Datos Identificativos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            En cumplimiento de lo establecido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se informa de los siguientes datos:
          </p>
          <ul>
            <li><strong>Denominación social:</strong> Enigma Cocina Con Alma</li>
            <li><strong>Domicilio social:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, España</li>
            <li><strong>Teléfono:</strong> +34 672 79 60 06</li>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Sitio web:</strong> enigmaconalma.com</li>
          </ul>
        </div>
      </section>

      <section id="objeto-condiciones" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Objeto y Condiciones de Uso
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            El presente sitio web tiene por objeto facilitar información sobre los servicios que ofrece Enigma Cocina Con Alma, así como permitir la realización de reservas online.
          </p>
          <p>
            El acceso y uso de este sitio web atribuye la condición de usuario del mismo e implica la aceptación plena de todas las condiciones incluidas en este Aviso Legal.
          </p>
        </div>
      </section>

      <section id="responsabilidades" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Responsabilidades
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que se ofrecen a través del sitio web y a no emplearlos para:
          </p>
          <ul>
            <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público</li>
            <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal o de apología del terrorismo</li>
            <li>Provocar daños en los sistemas físicos y lógicos del establecimiento, de sus proveedores o de terceras personas</li>
            <li>Introducir o difundir virus informáticos o cualesquiera otros sistemas físicos o lógicos que sean susceptibles de provocar daños</li>
          </ul>
        </div>
      </section>

      <section id="propiedad-intelectual" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Propiedad Intelectual e Industrial
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Enigma Cocina Con Alma es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
          </p>
          <p>
            Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de Enigma Cocina Con Alma.
          </p>
        </div>
      </section>

      <section id="ley-aplicable" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Ley Aplicable y Jurisdicción
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia que pudiera derivarse del acceso o uso del sitio web, Enigma Cocina Con Alma y el usuario se someten a los juzgados y tribunales del domicilio del usuario.
          </p>
          <p>
            En el caso de que el usuario tenga su domicilio fuera de España, Enigma Cocina Con Alma y el usuario se someten, con renuncia expresa a cualquier otro fuero, a los juzgados y tribunales de Alicante (España).
          </p>
        </div>
      </section>

      <section id="contacto-legal" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contacto para Cuestiones Legales
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Para cualquier cuestión relativa a este aviso legal, puede contactar con nosotros a través de:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Teléfono:</strong> +34 672 79 60 06</li>
            <li><strong>Dirección postal:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, España</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

