import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { EmailTemplateData, EmailType } from '@/lib/email/types/emailTypes'

// Importar todos los templates de email
import { ReservationConfirmationEmail } from '@/lib/email/templates/reservation-confirmation'
import { ReservationConfirmationTestEmail } from '@/lib/email/templates/reservation-confirmation-test'
import { ReservationConfirmedEmail } from '@/lib/email/templates/reservation-confirmed'
import { ReservationReminderEmail } from '@/lib/email/templates/reservation-reminder'
import { ReservationReviewEmail } from '@/lib/email/templates/reservation-review'
import { ReservationCancelledEmail } from '@/lib/email/templates/reservation-cancelled'

export const dynamic = 'force-dynamic'

// Datos de ejemplo para previsualización (100% DINÁMICOS)
const sampleData: EmailTemplateData = {
  customerName: 'María García',
  customerEmail: 'maria.garcia@ejemplo.com',
  customerId: 'cust_12345',
  reservationId: 'res_2024_001',
  reservationDate: new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  reservationTime: '20:30',
  partySize: 4,
  tableLocation: 'TERRACE_CAMPANARI',
  tableNumber: 'T5',
  specialRequests: 'Mesa cerca de la ventana, celebración de aniversario',
  preOrderItems: [
    {
      id: 'item_1',
      name: 'Degustación del Chef',
      quantity: 2,
      price: 85.00,
      notes: 'Sin alérgenos'
    },
    {
      id: 'item_2',
      name: 'Maridaje de Vinos',
      quantity: 2,
      price: 45.00,
      notes: ''
    }
  ],
  preOrderTotal: 260.00,
  restaurantName: 'Enigma Cocina Con Alma',
  restaurantEmail: 'reservas@enigmaconalma.com',
  restaurantPhone: '+34 912 345 678',
  tokenUrl: 'https://enigmaconalma.com/mi-reserva?token=vt_1758214441986_d3d76e7e',
  reservationStatus: 'CONFIRMED'
}

// Datos adicionales para templates específicos
const cancellationData = {
  ...sampleData,
  cancellationReason: 'Imprevisto familiar',
  refundAmount: 50.00,
  refundMethod: 'Tarjeta de crédito original'
}

// GET endpoint para previsualizar templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateType = searchParams.get('template') as EmailType
    const format = searchParams.get('format') || 'html' // html | text
    const customData = searchParams.get('data') // JSON string opcional

    if (!templateType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetro template requerido',
          availableTemplates: [
            'reservation_created',
            'reservation_confirmed',
            'reservation_reminder',
            'reservation_review',
            'reservation_cancelled',
            'CONFIRMATION',
            'CONFIRMED',
            'REMINDER',
            'REVIEW_REQUEST',
            'CANCELLATION'
          ]
        },
        { status: 400 }
      )
    }

    // Usar datos personalizados si se proporcionan
    let emailData = sampleData
    if (customData) {
      try {
        const parsed = JSON.parse(customData)
        emailData = { ...sampleData, ...parsed }
      } catch (parseError) {
        console.error('❌ Error parseando datos personalizados:', parseError)
      }
    }

    let emailComponent: React.ReactElement

    // Seleccionar template basado en tipo
    switch (templateType) {
      case 'reservation_created':
      case 'CONFIRMATION':
        emailComponent = ReservationConfirmationTestEmail(emailData)
        break

      case 'reservation_confirmed':
      case 'CONFIRMED':
        emailComponent = ReservationConfirmedEmail(emailData)
        break

      case 'reservation_reminder':
      case 'REMINDER':
        emailComponent = ReservationReminderEmail(emailData)
        break

      case 'reservation_review':
      case 'REVIEW_REQUEST':
        emailComponent = ReservationReviewEmail(emailData)
        break

      case 'reservation_cancelled':
      case 'CANCELLATION':
        emailComponent = ReservationCancelledEmail(cancellationData)
        break

      default:
        return NextResponse.json(
          { success: false, error: `Tipo de template no válido: ${templateType}` },
          { status: 400 }
        )
    }

    // Renderizar el template
    if (format === 'html') {
      const html = await render(emailComponent)

      // Devolver HTML directamente para visualización en el navegador
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })

    } else if (format === 'text') {
      const plainText = await render(emailComponent, { plainText: true })

      return new NextResponse(plainText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })

    } else if (format === 'json') {
      const html = await render(emailComponent)
      const plainText = await render(emailComponent, { plainText: true })

      return NextResponse.json({
        success: true,
        template: templateType,
        data: emailData,
        html,
        plainText,
        generatedAt: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Error previsualizando template:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// POST endpoint para envío de prueba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template, email, customData } = body

    if (!template || !email) {
      return NextResponse.json(
        { success: false, error: 'Parámetros template y email requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    const { EmailService } = await import('@/lib/email/emailService')
    const emailService = EmailService.getInstance()

    // Preparar datos para email de prueba
    const testData = {
      ...sampleData,
      customerName: 'Usuario de Prueba',
      customerEmail: email,
      ...customData
    }

    // Agregar marcador de prueba al asunto y contenido
    testData.reservationId = `TEST_${testData.reservationId}`

    let result

    // Enviar email de prueba según el tipo
    switch (template) {
      case 'CONFIRMATION':
        result = await emailService.sendReservationConfirmation(testData)
        break

      case 'CONFIRMED':
        result = await emailService.sendReservationConfirmed(testData)
        break

      case 'REMINDER':
        result = await emailService.sendReservationReminder(testData)
        break

      case 'REVIEW_REQUEST':
        result = await emailService.sendReviewRequest(testData)
        break

      case 'CANCELLATION':
        result = await emailService.sendCancellation({
          ...testData,
          cancellationReason: 'Email de prueba',
          refundAmount: 0,
          refundMethod: 'N/A'
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: `Tipo de template no válido: ${template}` },
          { status: 400 }
        )
    }

    if (result.success) {
      console.log(`✅ Email de prueba enviado: ${template} → ${email}`)

      return NextResponse.json({
        success: true,
        message: `Email de prueba enviado correctamente a ${email}`,
        template,
        sentAt: new Date().toISOString()
      })
    } else {
      console.error(`❌ Error enviando email de prueba:`, result.error)

      return NextResponse.json(
        {
          success: false,
          error: 'Error enviando email de prueba',
          details: result.error
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error en envío de prueba:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}