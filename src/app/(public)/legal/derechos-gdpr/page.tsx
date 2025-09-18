// app/(public)/legal/derechos-gdpr/page.tsx
// GDPR Rights Page (Spanish) - Interactive Rights Request System
// PRP Implementation: Complete GDPR Rights Management with Form Integration

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPageLayout, generateLegalPageMetadata } from '@/components/legal/LegalPageLayout'
import { createLegalContentService } from '@/lib/services/legal/legalContentService'
import { processContentForTOC } from '@/lib/utils/legal-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  FileText,
  Download,
  UserX,
  Edit,
  Eye,
  Ban,
  ArrowRight,
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

// ============================================
// METADATA GENERATION
// ============================================

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalService = await createLegalContentService()
    const content = await legalService.getActiveContent('gdpr_rights', 'es')

    if (!content) {
      return {
        title: 'Derechos GDPR - Enigma Cocina Con Alma',
        description: 'Ejercer sus derechos GDPR en Enigma Cocina Con Alma - Acceso, rectificación, supresión, portabilidad y más bajo el RGPD.'
      }
    }

    return generateLegalPageMetadata(content, 'es')
  } catch (error) {
    console.error('Error generating metadata for GDPR rights:', error)
    return {
      title: 'Derechos GDPR - Enigma Cocina Con Alma',
      description: 'Ejercer sus derechos GDPR en Enigma Cocina Con Alma - Acceso, rectificación, supresión, portabilidad y más bajo el RGPD.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function DerechosGDPRPage() {
  try {
    const legalService = await createLegalContentService()
    // Fetch GDPR rights content from database
    const content = await legalService.getActiveContent('gdpr_rights', 'es')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'gdpr_rights',
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
        <GDPRRightsContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading GDPR rights page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface GDPRRightsContentProps {
  content: any
}

function GDPRRightsContent({ content }: GDPRRightsContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default GDPR rights content
  if (sections.length === 0) {
    return <DefaultGDPRRightsContent />
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

function DefaultGDPRRightsContent() {
  return (
    <div className="legal-content space-y-6">
      {/* Quick Actions Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Ejercer sus Derechos GDPR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Puede ejercer sus derechos bajo el RGPD de forma rápida y segura. Responderemos a su solicitud en un plazo máximo de 30 días.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              <Mail className="h-4 w-4 mr-2" />
              Solicitar por Email
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Formulario Online
            </Button>
          </div>
        </CardContent>
      </Card>

      <section id="introduccion" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Sus Derechos bajo el RGPD
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            En cumplimiento del Reglamento General de Protección de Datos (RGPD), usted tiene una serie de derechos sobre sus datos personales que tratamos. Esta página le explica en detalle cada uno de estos derechos y cómo ejercerlos.
          </p>
          <p>
            <strong>Importante:</strong> Todos estos derechos son gratuitos y puede ejercerlos en cualquier momento. Tenemos la obligación legal de responder a su solicitud en un plazo máximo de 30 días.
          </p>
        </div>
      </section>

      <section id="derechos-disponibles" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Derechos Disponibles
        </h2>

        <div className="grid gap-4">
          {/* Right of Access */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-blue-800">Derecho de Acceso</h3>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Art. 15 RGPD
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Obtener información sobre qué datos personales tenemos sobre usted, cómo los procesamos y con quién los compartimos.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Incluye:</strong> Copia de sus datos, finalidades del tratamiento, destinatarios, plazos de conservación
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Solicitar
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right to Rectification */}
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Edit className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-green-800">Derecho de Rectificación</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Art. 16 RGPD
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Corregir cualquier dato personal inexacto o incompleto que tengamos sobre usted.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Incluye:</strong> Datos de contacto, preferencias, información de reservas
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  Corregir
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right to Erasure */}
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-red-800">Derecho de Supresión</h3>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Art. 17 RGPD
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Solicitar la eliminación de sus datos personales cuando ya no sean necesarios o retire su consentimiento.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Limitaciones:</strong> Datos necesarios para obligaciones legales o ejercicio de derechos
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                  Eliminar
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right to Data Portability */}
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-purple-800">Derecho de Portabilidad</h3>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Art. 20 RGPD
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Recibir sus datos en un formato estructurado y legible por máquina, y transmitirlos a otro responsable.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Formato:</strong> JSON, CSV, XML según el tipo de datos
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Exportar
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right to Restriction */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Ban className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-orange-800">Derecho de Limitación</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Art. 18 RGPD
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Limitar el tratamiento de sus datos en determinadas circunstancias específicas.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Casos:</strong> Inexactitud de datos, tratamiento ilícito, objeción al tratamiento
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                  Limitar
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right to Object */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">Derecho de Oposición</h3>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Art. 21 RGPD
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Oponerse al tratamiento de sus datos por motivos relacionados con su situación particular.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Incluye:</strong> Marketing directo, perfilado, interés legítimo
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  Oponerse
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="como-ejercer" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Cómo Ejercer sus Derechos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Puede ejercer cualquiera de estos derechos de las siguientes formas:
          </p>

          <div className="grid gap-4 md:grid-cols-2 my-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Por Email</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Envíe su solicitud a reservas@enigmaconalma.com indicando claramente qué derecho desea ejercer.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Incluya:</strong> Nombre completo, email asociado, tipo de solicitud y motivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Formulario Online</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Utilice nuestro formulario específico para solicitudes GDPR (próximamente disponible).
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Ventajas:</strong> Proceso guiado, verificación automática, seguimiento del estado
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="enigma-subsection-title mb-2">Verificación de Identidad</h3>
          <p>
            Para proteger sus datos, necesitamos verificar su identidad antes de procesar su solicitud. Puede que le pidamos:
          </p>
          <ul>
            <li>Confirmación por email</li>
            <li>Respuesta a preguntas de seguridad</li>
            <li>Copia de documento de identidad (en casos específicos)</li>
          </ul>
        </div>
      </section>

      <section id="plazos-proceso" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Plazos y Proceso
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <strong className="text-blue-800">Plazo Legal: 30 días máximo</strong>
            </div>
            <p className="text-sm text-blue-700">
              Responderemos a su solicitud en un plazo máximo de 30 días desde su recepción, pudiendo extenderse 60 días más en casos complejos.
            </p>
          </div>

          <h3 className="enigma-subsection-title mb-2">Proceso Típico</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Recepción (Día 0):</strong> Recibimos su solicitud y enviamos confirmación</li>
            <li><strong>Verificación (Días 1-3):</strong> Verificamos su identidad si es necesario</li>
            <li><strong>Evaluación (Días 4-10):</strong> Analizamos la viabilidad y alcance de la solicitud</li>
            <li><strong>Procesamiento (Días 11-25):</strong> Ejecutamos la acción solicitada</li>
            <li><strong>Respuesta (Días 26-30):</strong> Le enviamos el resultado de su solicitud</li>
          </ol>

          <h3 className="enigma-subsection-title mb-2 mt-4">Casos Especiales</h3>
          <p>
            En algunos casos, podemos rechazar su solicitud si:
          </p>
          <ul>
            <li>Es manifiestamente infundada o excesiva</li>
            <li>Afecta a los derechos de terceros</li>
            <li>Compromete obligaciones legales</li>
            <li>No podemos verificar su identidad</li>
          </ul>
          <p>
            En estos casos, le explicaremos los motivos y le informaremos de su derecho a reclamar ante la AEPD.
          </p>
        </div>
      </section>

      <section id="reclamaciones" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Reclamaciones ante la Autoridad de Control
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Si no está satisfecho con nuestra respuesta o considera que hemos violado sus derechos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
          </p>

          <Card className="my-4 border-red-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-red-800 mb-2">Agencia Española de Protección de Datos</h3>
              <div className="text-sm space-y-1">
                <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
                <p><strong>Teléfono:</strong> 901 100 099 / 912 663 517</p>
                <p><strong>Web:</strong> <a href="https://www.aepd.es" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a></p>
                <p><strong>Sede electrónica:</strong> <a href="https://sedeagpd.gob.es" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">sedeagpd.gob.es</a></p>
              </div>
            </CardContent>
          </Card>

          <p>
            La reclamación ante la AEPD es gratuita y puede presentarla incluso si no ha ejercido previamente sus derechos con nosotros.
          </p>
        </div>
      </section>

      <section id="costes" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Costes y Tasas
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <strong className="text-green-800">Ejercer sus derechos es GRATUITO</strong>
            </div>
            <p className="text-sm text-green-700">
              Nunca le cobraremos por ejercer sus derechos GDPR. Cualquier solicitud de pago debe considerarse fraudulenta.
            </p>
          </div>

          <p>
            Solo en casos excepcionales de solicitudes manifiestamente infundadas o excesivas podríamos aplicar una tasa razonable o negarnos a tramitar la solicitud.
          </p>
        </div>
      </section>

      <section id="preguntas-frecuentes" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Preguntas Frecuentes
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">¿Puedo ejercer varios derechos a la vez?</h3>
          <p>
            Sí, puede solicitar ejercer múltiples derechos en una sola solicitud. Por ejemplo, puede solicitar acceso a sus datos y su rectificación simultáneamente.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">¿Qué datos incluye el derecho de acceso?</h3>
          <p>
            Incluye todos los datos personales que procesamos sobre usted: datos de reservas, preferencias, comunicaciones, datos técnicos, y cualquier otra información personal.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">¿Puedo solicitar la eliminación de todas mis reservas?</h3>
          <p>
            No siempre. Mantenemos ciertos datos por obligaciones legales (facturación, seguridad alimentaria). Le explicaremos qué datos podemos eliminar y cuáles debemos conservar.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">¿En qué formato recibo mis datos?</h3>
          <p>
            Para portabilidad, proporcionamos los datos en formato JSON o CSV. Para acceso, puede recibir un PDF legible o datos estructurados según sus necesidades.
          </p>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contacto para Ejercer sus Derechos
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Para ejercer cualquiera de sus derechos GDPR o si tiene dudas:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com (Asunto: "Ejercicio de Derechos GDPR")</li>
            <li><strong>Teléfono:</strong> +34 672 79 60 06</li>
            <li><strong>Dirección postal:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, España</li>
          </ul>
          <p>
            <strong>Importante:</strong> Incluya siempre "GDPR" o "Derechos de Protección de Datos" en el asunto de su email para garantizar un procesamiento prioritario.
          </p>
        </div>
      </section>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { DefaultGDPRRightsContent }