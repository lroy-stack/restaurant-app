// app/(public)/legal/terminos-condiciones/page.tsx
// Terms and Conditions Page (Spanish) - Database-driven Legal Terms
// PRP Implementation: Complete Service Terms and Reservation Conditions

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
    const content = await legalService.getActiveContent('terms_conditions', 'es')

    if (!content) {
      return {
        title: 'Términos y Condiciones - Enigma Cocina Con Alma',
        description: 'Términos y condiciones de uso de los servicios de Enigma Cocina Con Alma - Condiciones de reserva y servicio en nuestro restaurante en Calpe.'
      }
    }

    return generateLegalPageMetadata(content, 'es')
  } catch (error) {
    console.error('Error generating metadata for terms and conditions:', error)
    return {
      title: 'Términos y Condiciones - Enigma Cocina Con Alma',
      description: 'Términos y condiciones de uso de los servicios de Enigma Cocina Con Alma - Condiciones de reserva y servicio en nuestro restaurante en Calpe.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function TerminosCondicionesPage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch terms and conditions content from database
    const content = await legalService.getActiveContent('terms_conditions', 'es')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'terms_conditions',
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
        <TermsConditionsContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading terms and conditions page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface TermsConditionsContentProps {
  content: any
}

function TermsConditionsContent({ content }: TermsConditionsContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default terms and conditions
  if (sections.length === 0) {
    return <DefaultTermsConditionsContent />
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

function DefaultTermsConditionsContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="objeto-alcance" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Objeto y Alcance
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Los presentes términos y condiciones regulan el uso de los servicios ofrecidos por Enigma Cocina Con Alma, incluyendo:
          </p>
          <ul>
            <li>Servicios de restauración y hostelería</li>
            <li>Sistema de reservas online</li>
            <li>Servicios adicionales (eventos, catering, etc.)</li>
            <li>Uso del sitio web y plataformas digitales</li>
          </ul>
          <p>
            El acceso y uso de nuestros servicios implica la aceptación plena de estos términos y condiciones.
          </p>
        </div>
      </section>

      <section id="condiciones-reservas" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Condiciones de Reserva
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Proceso de Reserva</h3>
          <p>
            Las reservas pueden realizarse a través de:
          </p>
          <ul>
            <li>Nuestro sistema de reservas online</li>
            <li>Teléfono: +34 672 79 60 06</li>
            <li>Email: reservas@enigmaconalma.com</li>
            <li>Presencialmente en el restaurante</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Confirmación de Reserva</h3>
          <p>
            Las reservas no se consideran confirmadas hasta recibir confirmación por parte del restaurante. Nos reservamos el derecho a rechazar reservas por motivos de disponibilidad, aforo o circunstancias extraordinarias.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Política de Cancelación</h3>
          <ul>
            <li><strong>Cancelación gratuita:</strong> Hasta 24 horas antes de la reserva</li>
            <li><strong>Cancelación tardía:</strong> Menos de 24 horas puede conllevar penalización</li>
            <li><strong>No presentación:</strong> 100% del importe estimado del servicio</li>
            <li><strong>Grupos grandes:</strong> Condiciones especiales (consultar)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Modificaciones</h3>
          <p>
            Las modificaciones de reserva están sujetas a disponibilidad y deben solicitarse con al menos 4 horas de antelación. No garantizamos la disponibilidad para cambios de último momento.
          </p>
        </div>
      </section>

      <section id="politica-horarios" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Política de Horarios
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Horarios de Servicio</h3>
          <ul>
            <li><strong>Martes a Domingo:</strong> 18:00 - 24:00</li>
            <li><strong>Lunes:</strong> Cerrado</li>
            <li><strong>Días festivos:</strong> Consultar disponibilidad</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Puntualidad</h3>
          <p>
            Solicitamos puntualidad en las reservas. Las mesas se mantienen reservadas durante 15 minutos. Pasado este tiempo, la mesa puede ser reasignada sin previo aviso.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Tiempo de Mesa</h3>
          <p>
            El tiempo estimado de ocupación de mesa es de 2 horas. En caso de necesitar más tiempo, rogamos lo comuniquen con antelación para verificar disponibilidad.
          </p>
        </div>
      </section>

      <section id="condiciones-servicio" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Condiciones de Servicio
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Menú y Precios</h3>
          <ul>
            <li>Los precios están sujetos a cambios sin previo aviso</li>
            <li>Los precios mostrados incluyen IVA</li>
            <li>El menú puede variar según disponibilidad de productos</li>
            <li>Informamos sobre alérgenos según normativa vigente</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Alergias e Intolerancias</h3>
          <p>
            Es responsabilidad del cliente informar sobre alergias, intolerancias o restricciones alimentarias en el momento de la reserva o al inicio del servicio. Haremos todo lo posible por adaptar nuestros platos, pero no podemos garantizar la ausencia total de alérgenos.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Código de Vestimenta</h3>
          <p>
            Recomendamos vestimenta elegante-casual. Nos reservamos el derecho de admisión por razones de imagen o comportamiento.
          </p>
        </div>
      </section>

      <section id="pagos-facturacion" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Pagos y Facturación
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Métodos de Pago</h3>
          <p>Aceptamos los siguientes métodos de pago:</p>
          <ul>
            <li>Efectivo</li>
            <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
            <li>Pagos contactless</li>
            <li>Transferencia bancaria (para grupos grandes)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Facturación</h3>
          <p>
            Las facturas se emiten al finalizar el servicio. Para facturas con datos empresariales, es necesario proporcionarlos antes del inicio del servicio.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Propinas</h3>
          <p>
            Las propinas son voluntarias y no están incluidas en los precios. Agradecemos cualquier muestra de satisfacción por nuestro servicio.
          </p>
        </div>
      </section>

      <section id="comportamiento-normas" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Normas de Comportamiento
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Para garantizar una experiencia agradable para todos nuestros clientes, solicitamos:
          </p>
          <ul>
            <li>Mantener un volumen de conversación moderado</li>
            <li>Respetar al personal y otros comensales</li>
            <li>No fumar en el interior del establecimiento</li>
            <li>Mantener los dispositivos móviles en modo silencio</li>
            <li>Seguir las indicaciones del personal en todo momento</li>
          </ul>
          <p>
            Nos reservamos el derecho de admisión y permanencia. En caso de comportamiento inadecuado, podemos solicitar el abandono del establecimiento.
          </p>
        </div>
      </section>

      <section id="eventos-grupos" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Eventos y Grupos Grandes
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Reservas de Grupo</h3>
          <p>
            Para grupos de más de 8 personas, aplicamos condiciones especiales:
          </p>
          <ul>
            <li>Reserva con al menos 48 horas de antelación</li>
            <li>Posible solicitud de señal o prepago</li>
            <li>Menú preseleccionado según disponibilidad</li>
            <li>Facturación única para todo el grupo</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Eventos Privados</h3>
          <p>
            Ofrecemos servicios para eventos privados con condiciones específicas que se negociarán caso por caso. Consulte disponibilidad y condiciones especiales.
          </p>
        </div>
      </section>

      <section id="responsabilidad" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Limitación de Responsabilidad
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Enigma Cocina Con Alma no se hace responsable de:
          </p>
          <ul>
            <li>Pérdida o daño de objetos personales</li>
            <li>Reacciones alérgicas no comunicadas previamente</li>
            <li>Cancelaciones por causas de fuerza mayor</li>
            <li>Cambios en el menú por disponibilidad de productos</li>
            <li>Problemas de salud preexistentes</li>
          </ul>
          <p>
            Recomendamos a los clientes contratar seguros apropiados para sus pertenencias personales.
          </p>
        </div>
      </section>

      <section id="proteccion-datos" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Protección de Datos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            El tratamiento de sus datos personales se rige por nuestra <a href="/legal/politica-privacidad" className="text-primary hover:underline">Política de Privacidad</a>, que cumple con el RGPD y la normativa española de protección de datos.
          </p>
          <p>
            Al utilizar nuestros servicios, acepta el tratamiento de sus datos según se describe en dicha política.
          </p>
        </div>
      </section>

      <section id="fuerza-mayor" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Fuerza Mayor
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            No nos hacemos responsables del incumplimiento de nuestras obligaciones debido a circunstancias de fuerza mayor, incluyendo:
          </p>
          <ul>
            <li>Desastres naturales</li>
            <li>Emergencias sanitarias</li>
            <li>Cortes de suministro eléctrico o agua</li>
            <li>Huelgas o conflictos laborales</li>
            <li>Disposiciones gubernamentales</li>
            <li>Cualquier otra circunstancia fuera de nuestro control</li>
          </ul>
          <p>
            En estos casos, intentaremos reprogramar su reserva o proceder al reembolso correspondiente.
          </p>
        </div>
      </section>

      <section id="modificaciones-terminos" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Modificación de Términos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Nos reservamos el derecho a modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en nuestro sitio web.
          </p>
          <p>
            Le recomendamos revisar periódicamente estos términos para mantenerse informado de cualquier cambio.
          </p>
        </div>
      </section>

      <section id="legislacion-jurisdiccion" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Legislación Aplicable y Jurisdicción
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Estos términos y condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales de Alicante, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
          </p>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contacto
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Para cualquier consulta sobre estos términos y condiciones:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Teléfono:</strong> +34 672 79 60 06</li>
            <li><strong>Dirección:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, España</li>
            <li><strong>Horarios de atención:</strong> Martes a Domingo, 18:00 - 24:00</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

// Only default export and generateMetadata are valid for Next.js pages