import { NextRequest, NextResponse } from 'next/server'
import { largeGroupContactSchema } from '@/types/large-group-request'
import type { LargeGroupContactData } from '@/types/large-group-request'
import { z } from 'zod'
import { createDirectAdminClient } from '@/lib/supabase/server'

// Extended schema with reservation details
const requestSchema = largeGroupContactSchema.extend({
  dateTime: z.string(),
  partySize: z.number().int().min(9).max(20),
  preferredLanguage: z.enum(['ES', 'EN', 'DE'])
})

/**
 * POST /api/large-group-request
 * Envía email a admin usando el sistema de EmailService existente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = requestSchema.parse(body) as LargeGroupContactData

    // Obtener email del restaurante desde DB
    const supabase = createDirectAdminClient()
    const { data: restaurant } = await supabase
      .schema('restaurante')
      .from('restaurants')
      .select('mailing')
      .single()

    const restaurantEmail = restaurant?.mailing || 'admin@enigmaconalma.com'

    // Formatear fecha
    const date = new Date(validatedData.dateTime)
    const dateStr = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Usar sistema de email existente
    const { render } = await import('@react-email/render')
    const { LargeGroupRequestEmail } = await import('@/lib/email/templates/large-group-request')
    const { emailService } = await import('@/lib/email/emailService')

    const htmlContent = await render(
      LargeGroupRequestEmail({
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        notes: validatedData.notes,
        dateTime: validatedData.dateTime,
        partySize: validatedData.partySize,
        preferredLanguage: validatedData.preferredLanguage
      })
    )

    const transporter = emailService.getTransporter()
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_USER}>`,
      to: restaurantEmail,
      replyTo: validatedData.email,
      subject: `[GRUPO GRANDE] ${validatedData.partySize} personas - ${dateStr}`,
      html: htmlContent
    })

    console.log('✅ Email grupo grande enviado:', info.messageId, 'a', restaurantEmail)

    return NextResponse.json(
      {
        success: true,
        message: 'Request sent successfully',
        emailId: info.messageId,
        whatsappNumber: '+34672796006'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in large-group-request API:', error)

    // Manejo de errores de validación
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // Otros errores
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Método OPTIONS para CORS (si es necesario)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  )
}
