import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/emailService'
import { CustomEmailData, EmailResult } from '@/lib/email/types/emailTypes'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema for custom email data
const customEmailSchema = z.object({
  // Required fields
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customSubject: z.string().min(1, 'Subject is required'),
  customMessage: z.string().min(1, 'Message content is required'),
  messageType: z.enum(['offer', 'promotion', 'followup', 'custom']),

  // Restaurant info (optional - will use defaults)
  restaurantName: z.string().optional(),
  restaurantEmail: z.string().optional(),
  restaurantPhone: z.string().optional(),

  // Optional CTA
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional(),

  // Client context for personalization
  clientContext: z.object({
    totalVisits: z.number().optional(),
    lastVisit: z.string().optional(),
    favoriteItems: z.array(z.string()).optional(),
    averageSpending: z.number().optional(),
    isVip: z.boolean().optional(),
    upcomingReservations: z.number().optional(),
    cancelledReservations: z.number().optional(),
    language: z.string().optional(),
    loyaltyTier: z.string().optional(),
    preferredTimeSlots: z.array(z.string()).optional(),
    hasEmailConsent: z.boolean().optional(),
    hasMarketingConsent: z.boolean().optional()
  }).optional(),

  // Metadata
  templateSource: z.enum(['predefined', 'custom', 'ai-generated']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  previewMode: z.boolean().optional()
})

// POST - Send custom email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    const validationResult = customEmailSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('❌ VALIDATION FAILED for email data:', JSON.stringify(body, null, 2))
      console.error('❌ VALIDATION ERRORS:', JSON.stringify(validationResult.error.errors, null, 2))

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const emailData = validationResult.data

    // Build complete CustomEmailData with defaults
    const customEmailData: CustomEmailData = {
      ...emailData,
      // Use defaults for restaurant info if not provided
      restaurantName: emailData.restaurantName || 'Enigma Cocina Con Alma',
      restaurantEmail: emailData.restaurantEmail || 'reservas@enigmaconalma.com',
      restaurantPhone: emailData.restaurantPhone || '+34 672 79 60 06',

      // Set defaults for optional fields
      reservationId: `custom-${Date.now()}`, // Unique ID for custom emails
      reservationDate: new Date().toLocaleDateString('es-ES'),
      reservationTime: '',
      partySize: 0,
      tableLocation: '',
      tableNumber: '',
      reservationStatus: 'COMPLETED' as const,

      // Metadata
      templateSource: emailData.templateSource || 'custom',
      priority: emailData.priority || 'normal'
    }

    // Preview mode - just return rendered email without sending
    if (emailData.previewMode) {
      const { render } = await import('@react-email/render')
      const { CustomMessageEmail } = await import('@/lib/email/templates/custom-message')

      const emailComponent = CustomMessageEmail(customEmailData)
      const html = await render(emailComponent)
      const plainText = await render(emailComponent, { plainText: true })

      return NextResponse.json({
        success: true,
        preview: true,
        html,
        plainText,
        subject: customEmailData.customSubject,
        to: customEmailData.customerEmail,
        messageType: customEmailData.messageType
      })
    }

    // Send email via EmailService
    const emailService = EmailService.getInstance()
    const result = await emailService.sendCustomMessage(customEmailData)

    if (result === EmailResult.Ok) {
      console.log(`✅ Custom email sent successfully: ${emailData.messageType} → ${emailData.customerEmail}`)

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        emailType: emailData.messageType,
        recipient: emailData.customerEmail,
        sentAt: new Date().toISOString()
      })
    } else {
      console.error(`❌ Failed to send custom email: ${result}`)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          result
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Custom email API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Get predefined templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateType = searchParams.get('templates')

    if (templateType === 'predefined') {
      // Return predefined message templates
      const templates = [
        {
          id: 'offer',
          name: 'Oferta Especial',
          messageType: 'offer',
          description: 'Promoción personalizada con descuento',
          defaultSubject: 'Oferta especial para ti en {restaurantName}',
          defaultMessage: `
            <p>Estimado/a <strong>{customerName}</strong>,</p>
            <p>Como cliente especial de <strong>{restaurantName}</strong>, queremos ofrecerte una experiencia única.</p>
            <p>Disfruta de un <strong>descuento del 15%</strong> en tu próxima visita y déjanos sorprenderte una vez más con nuestra cocina mediterránea de autor.</p>
            <p>Esta oferta es válida hasta el <strong>31 de octubre de 2025</strong>.</p>
          `,
          defaultCtaText: 'Reservar Ahora',
          defaultCtaUrl: 'https://enigmaconalma.com/reservas',
          icon: 'gift',
          category: 'marketing'
        },
        {
          id: 'promotion',
          name: 'Nueva Promoción',
          messageType: 'promotion',
          description: 'Anuncio de nueva promoción o evento',
          defaultSubject: 'Nueva promoción disponible - {restaurantName}',
          defaultMessage: `
            <p>Hola <strong>{customerName}</strong>,</p>
            <p>Nos complace presentarte nuestra última promoción en <strong>{restaurantName}</strong>.</p>
            <p>Cada miércoles y jueves, disfruta de nuestro <strong>Menú Degustación Atlántico</strong> con un descuento especial del 20%.</p>
            <p>Una oportunidad perfecta para disfrutar de nuestra cocina con condiciones especiales.</p>
          `,
          defaultCtaText: 'Ver Menú Degustación',
          defaultCtaUrl: 'https://enigmaconalma.com/menu',
          icon: 'sparkles',
          category: 'marketing'
        },
        {
          id: 'followup',
          name: 'Seguimiento',
          messageType: 'followup',
          description: 'Mensaje de seguimiento post-visita o reactivación',
          defaultSubject: 'Gracias por visitarnos - {restaurantName}',
          defaultMessage: `
            <p>Querido/a <strong>{customerName}</strong>,</p>
            <p>Queremos agradecerte por elegir <strong>{restaurantName}</strong> para tu experiencia gastronómica.</p>
            <p>Tu opinión es muy importante para nosotros. ¿Nos ayudarías compartiendo tu experiencia en nuestras redes sociales?</p>
            <p>Como agradecimiento, te ofrecemos un <strong>aperitivo de cortesía</strong> en tu próxima visita.</p>
          `,
          defaultCtaText: 'Dejar Reseña',
          defaultCtaUrl: 'https://g.page/r/CRqK8K8K8K8K8K8KEBM/review',
          icon: 'message-square',
          category: 'customer_service'
        },
        {
          id: 'reconquest',
          name: 'Reconquista',
          messageType: 'offer',
          description: 'Recuperación de clientes con reservas canceladas',
          defaultSubject: 'Te echamos de menos - Oferta especial {restaurantName}',
          defaultMessage: `
            <p>Hola <strong>{customerName}</strong>,</p>
            <p>Hemos notado que no has podido visitarnos recientemente. ¡Queremos verte de nuevo!</p>
            <p>Como muestra de aprecio, te ofrecemos un <strong>descuento especial del 10%</strong> en tu próxima reserva, más una copa de cava de bienvenida.</p>
            <p>Reserva ahora y redescubre los sabores que tanto te gustaron.</p>
          `,
          defaultCtaText: 'Reservar con Descuento',
          defaultCtaUrl: 'https://enigmaconalma.com/reservas?promo=reconquest',
          icon: 'target',
          category: 'retention'
        },
        {
          id: 'birthday',
          name: 'Cumpleaños',
          messageType: 'custom',
          description: 'Felicitación de cumpleaños personalizada',
          defaultSubject: 'Feliz cumpleaños desde {restaurantName}!',
          defaultMessage: `
            <p>¡Feliz cumpleaños, <strong>{customerName}</strong>!</p>
            <p>En <strong>{restaurantName}</strong> queremos celebrar contigo este día especial.</p>
            <p>Te invitamos a disfrutar de una <strong>experiencia especial de cumpleaños</strong> con nosotros: menú degustación con postre sorpresa incluido.</p>
            <p>¡Que tengas un día maravilloso!</p>
          `,
          defaultCtaText: 'Reservar Celebración',
          defaultCtaUrl: 'https://enigmaconalma.com/reservas?occasion=birthday',
          icon: 'calendar',
          category: 'special_occasions'
        },
        {
          id: 'newsletter',
          name: 'Newsletter Semanal',
          messageType: 'promotion',
          description: 'Newsletter semanal con novedades',
          defaultSubject: 'Newsletter Semanal - {restaurantName}',
          defaultMessage: `
            <p>Hola <strong>{customerName}</strong>,</p>
            <p>Esta semana en <strong>{restaurantName}</strong> tenemos grandes novedades para ti:</p>
            <ul>
              <li><strong>Nuevo plato:</strong> Pulpo a la brasa con puré de boniato</li>
              <li><strong>Vino del mes:</strong> Albariño Rías Baixas DO - 20% descuento</li>
              <li><strong>Evento especial:</strong> Cena maridaje el viernes 25 de octubre</li>
            </ul>
            <p>¡No te pierdas nuestras últimas creaciones!</p>
          `,
          defaultCtaText: 'Ver Novedades',
          defaultCtaUrl: 'https://enigmaconalma.com/novedades',
          icon: 'globe',
          category: 'newsletter'
        }
      ]

      return NextResponse.json({
        success: true,
        templates
      })
    }

    // Default response - API info
    return NextResponse.json({
      success: true,
      endpoint: '/api/emails/custom',
      methods: ['POST', 'GET'],
      description: 'Send custom personalized emails to customers',
      usage: {
        POST: 'Send custom email with validation',
        GET: 'Get predefined templates (?templates=predefined)'
      }
    })

  } catch (error) {
    console.error('❌ Custom email GET API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}