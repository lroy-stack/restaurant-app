// Core Email Service - Following PRP patterns + Badezeit structure
// PATTERN: Lazy initialization, EmailResult enum, DB field name exactness

import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { createSMTPConfig, connectionPoolConfig, senderConfig } from './smtpConfig'
import { EmailResult, EmailType, EmailTemplateData, ReservationToken, CustomEmailData } from './types/emailTypes'
import { createDirectAdminClient } from '@/lib/supabase/server'
import { getEmailRestaurantInfo } from './services/restaurantService'
import { getEmailConfig, buildTokenUrl, buildPromoUrl } from './config/emailConfig'

// Lazy initialization to prevent build-time errors
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const smtpConfig = createSMTPConfig()

    transporter = nodemailer.createTransport({
      ...smtpConfig,
      ...connectionPoolConfig
    })

    // Verify connection configuration on first use
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection verification failed:', error)
      } else {
        console.log('✅ SMTP server ready for messages')
      }
    })
  }
  return transporter
}

export class EmailService {
  private static instance: EmailService | null = null

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * PATTERN: Queue job dispatch, not direct sending (per PRP)
   * Sends reservation email by queueing background job
   */
  async sendReservationEmail(
    reservationId: string,
    type: EmailType
  ): Promise<EmailResult> {
    try {
      // PATTERN: Always validate input first
      const reservation = await this.getReservationWithToken(reservationId)
      if (!reservation) {
        return EmailResult.ReservationNotFound
      }

      // Build template data from validated reservation
      const templateData = await this.buildTemplateData(reservation)

      // PATTERN: Queue job, don't send directly (per PRP)
      // TODO: Implement emailQueue.add() when background jobs are set up
      // For now, send directly but this will be replaced with queue
      return await this.sendEmailDirect(templateData, type)

    } catch (error) {
      console.error('Email service error:', error)
      return this.handleEmailError(error)
    }
  }

  // MÉTODOS ESPECÍFICOS requeridos por las APIs (wrappers del método genérico)

  async sendReservationConfirmation(emailData: any): Promise<EmailResult> {
    try {
      console.log('📧 Enviando email de confirmación:', emailData.customerEmail)
      return await this.sendEmailDirectWithData(emailData, EmailType.ReservationCreated)
    } catch (error) {
      console.error('❌ Error enviando confirmación:', error)
      return this.handleEmailError(error)
    }
  }

  async sendReservationConfirmed(emailData: any): Promise<EmailResult> {
    try {
      console.log('📧 Enviando email de reserva confirmada:', emailData.customerEmail)
      return await this.sendEmailDirectWithData(emailData, EmailType.ReservationConfirmed)
    } catch (error) {
      console.error('❌ Error enviando confirmación:', error)
      return this.handleEmailError(error)
    }
  }

  async sendReservationReminder(emailData: any): Promise<EmailResult> {
    try {
      console.log('📧 Enviando recordatorio:', emailData.customerEmail)
      return await this.sendEmailDirectWithData(emailData, EmailType.ReservationReminder)
    } catch (error) {
      console.error('❌ Error enviando recordatorio:', error)
      return this.handleEmailError(error)
    }
  }

  async sendReviewRequest(emailData: any): Promise<EmailResult> {
    try {
      console.log('📧 Enviando solicitud de reseña:', emailData.customerEmail)
      return await this.sendEmailDirectWithData(emailData, EmailType.ReservationReview)
    } catch (error) {
      console.error('❌ Error enviando solicitud de reseña:', error)
      return this.handleEmailError(error)
    }
  }

  async sendCancellation(emailData: any): Promise<EmailResult> {
    try {
      console.log('📧 Enviando email de cancelación:', emailData.customerEmail)
      return await this.sendEmailDirectWithData(emailData, EmailType.ReservationCancelled)
    } catch (error) {
      console.error('❌ Error enviando cancelación:', error)
      return this.handleEmailError(error)
    }
  }

  async sendReservationModified(emailData: any): Promise<EmailResult> {
    try {
      console.log('📧 Enviando email de modificación:', emailData.customerEmail)
      return await this.sendEmailDirectWithData(emailData, EmailType.ReservationModified)
    } catch (error) {
      console.error('❌ Error enviando modificación:', error)
      return this.handleEmailError(error)
    }
  }

  // NEW: Send custom personalized message
  async sendCustomMessage(customEmailData: CustomEmailData): Promise<EmailResult> {
    try {
      console.log('📧 Enviando email personalizado:', customEmailData.customerEmail, 'Tipo:', customEmailData.messageType)

      // Validate required fields for custom message
      if (!customEmailData.customMessage || !customEmailData.customSubject) {
        console.error('❌ Custom message requires customMessage and customSubject')
        return EmailResult.InvalidEmail
      }

      // Check email consent if available
      if (customEmailData.clientContext?.hasEmailConsent === false) {
        console.warn('⚠️ Customer has not consented to emails')
        return EmailResult.InvalidEmail
      }

      return await this.sendEmailDirectWithData(customEmailData, EmailType.CustomMessage)
    } catch (error) {
      console.error('❌ Error enviando email personalizado:', error)
      return this.handleEmailError(error)
    }
  }

  /**
   * CRITICAL: Query with exact database field names (VALIDATED schema)
   * Uses schema 'restaurante' and exact field names from SSH validation
   */
  private async getReservationWithToken(reservationId: string) {
    try {
      const supabase = createDirectAdminClient()

      // CRITICAL: Use exact database field names and schema 'restaurante'
      // FIXED: Incluir reservation_items para pre-pedidos
      const { data, error } = await supabase
        .schema('restaurante')
        .from('reservations')
        .select(`
          *,
          reservation_tokens!reservation_id(
            token,
            customer_email,
            expires,
            is_active,
            purpose
          ),
          customers!customerId(*),
          tables!tableId(*),
          reservation_items!reservationId(
            id,
            quantity,
            notes,
            menu_items!menuItemId(
              id,
              name,
              price,
              menu_categories!categoryId(
                name,
                type
              )
            )
          )
        `)
        .eq('id', reservationId)
        .single()

      if (error) {
        console.error('Database query error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('getReservationWithToken error:', error)
      return null
    }
  }

  /**
   * Build template data from reservation with EXACT field names
   * DYNAMIC content - everything from database/props + CENTRALIZED URLS
   */
  public async buildEmailDataFromReservation(reservationId: string): Promise<EmailTemplateData | null> {
    const reservation = await this.getReservationWithToken(reservationId)
    if (!reservation) return null
    return this.buildTemplateData(reservation)
  }

  private async buildTemplateData(reservation: any): Promise<EmailTemplateData> {
    const token = reservation.reservation_tokens?.[0]
    const emailConfig = getEmailConfig()

    return {
      // Customer data (DYNAMIC from DB)
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,

      // Reservation data (DYNAMIC from DB)
      reservationId: reservation.id,
      reservationDate: new Date(reservation.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      reservationTime: new Date(reservation.time).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      partySize: reservation.partySize,
      reservationStatus: reservation.status,
      specialRequests: reservation.specialRequests,

      // Table data (DYNAMIC from DB)
      tableLocation: reservation.tables?.location || 'Por asignar',
      tableNumber: reservation.tables?.number || 'Por asignar',

      // Pre-order data (DYNAMIC from DB via reservation_items)
      preOrderItems: reservation.reservation_items?.map((item: any) => ({
        id: item.id,
        name: item.menu_items.name,
        price: item.menu_items.price,
        quantity: item.quantity,
        notes: item.notes,
        category: item.menu_items.menu_categories.name,
        type: item.menu_items.menu_categories.type
      })) || [],
      preOrderTotal: reservation.reservation_items?.reduce((total: number, item: any) =>
        total + (item.menu_items.price * item.quantity), 0
      ) || 0,

      // CENTRALIZED URLs (NO MORE HARDCODED!)
      tokenUrl: token ? buildTokenUrl(token.token) : undefined,

      // ALL URLS from centralized config
      urls: emailConfig.urls,
      branding: emailConfig.branding,

      // Restaurant data (DYNAMIC from real DB - NO MORE HARDCODED)
      ...(await this.getRestaurantDataForTemplate())
    }
  }

  /**
   * Get restaurant data for email templates (DYNAMIC from real DB)
   */
  private async getRestaurantDataForTemplate() {
    const restaurantInfo = await getEmailRestaurantInfo()
    return {
      restaurantName: restaurantInfo.name,
      restaurantEmail: restaurantInfo.email,
      restaurantPhone: restaurantInfo.phone
    }
  }

  /**
   * Envío directo con datos ya preparados por el API + CONFIGURACIÓN CENTRALIZADA
   */
  private async sendEmailDirectWithData(
    emailData: any,
    emailType: EmailType
  ): Promise<EmailResult> {
    try {
      console.log('📧 Preparando envío directo:', emailType, 'para', emailData.customerEmail)

      // AGREGAR configuración centralizada a emailData
      const emailConfig = getEmailConfig()
      const enhancedEmailData = {
        ...emailData,
        urls: emailConfig.urls,
        branding: emailConfig.branding
      }

      const template = await this.getEmailTemplate(emailType, enhancedEmailData)
      const html = await render(template)
      const text = await render(template, { plainText: true })

      console.log('✅ HTML generado:', html.length, 'chars')
      console.log('✅ TEXT generado:', text.length, 'chars')
      console.log('📧 Enviando como multipart/alternative (HTML + TEXT)')

      const mailOptions = {
        from: `${senderConfig.name} <${senderConfig.email}>`,
        to: enhancedEmailData.customerEmail,
        replyTo: senderConfig.replyTo,
        subject: this.getEmailSubject(emailType, enhancedEmailData),
        html,
        text,
        // FIXED: Removed manual Content-Type header - Nodemailer handles multipart automatically
        headers: {
          'X-Mailer': 'Enigma Cocina Con Alma Email System',
          'X-Email-Type': emailType
        }
      }

      const transporter = getTransporter()
      const info = await transporter.sendMail(mailOptions)

      console.log('✅ Email enviado exitosamente:', info.messageId, 'a', enhancedEmailData.customerEmail)

      // Log to database with complete data
      await this.logEmailSent(enhancedEmailData.reservationId, emailType, enhancedEmailData.customerEmail, info.messageId, enhancedEmailData)

      return EmailResult.Ok

    } catch (error) {
      console.error('❌ Error enviando email directo:', error)
      return this.handleEmailError(error)
    }
  }

  /**
   * Direct email sending (will be replaced by background jobs)
   * Uses React Email templates
   */
  private async sendEmailDirect(
    templateData: EmailTemplateData,
    emailType: EmailType
  ): Promise<EmailResult> {
    try {
      const template = await this.getEmailTemplate(emailType, templateData)
      const html = await render(template)
      const text = await render(template, { plainText: true })

      const mailOptions = {
        from: `${senderConfig.name} <${senderConfig.email}>`,
        to: templateData.customerEmail,
        replyTo: senderConfig.replyTo,
        subject: this.getEmailSubject(emailType, templateData),
        html,
        text,
        // FIXED: Removed manual Content-Type header - Nodemailer handles multipart automatically
        headers: {
          'X-Mailer': 'Enigma Cocina Con Alma Email System',
          'X-Email-Type': emailType
        }
      }

      const transporter = getTransporter()
      const info = await transporter.sendMail(mailOptions)

      console.log('✅ Email sent:', info.messageId)

      // Log to email_logs table with complete data
      await this.logEmailSent(templateData.reservationId, emailType, templateData.customerEmail, info.messageId, templateData)

      return EmailResult.Ok

    } catch (error) {
      console.error('Direct email sending error:', error)
      return this.handleEmailError(error)
    }
  }

  /**
   * Get email template based on type (React Email components)
   */
  private async getEmailTemplate(emailType: EmailType, data: EmailTemplateData) {
    switch (emailType) {
      case EmailType.ReservationCreated:
        const { ReservationConfirmationEmail } = await import('./templates/reservation-confirmation')
        return ReservationConfirmationEmail(data)

      case EmailType.ReservationConfirmed:
        const { ReservationConfirmedEmail } = await import('./templates/reservation-confirmed')
        return ReservationConfirmedEmail(data)

      case EmailType.ReservationReminder:
        const { ReservationReminderEmail } = await import('./templates/reservation-reminder')
        return ReservationReminderEmail(data)

      case EmailType.ReservationReview:
        const { ReservationReviewEmail } = await import('./templates/reservation-review')
        return ReservationReviewEmail(data)

      case EmailType.ReservationCancelled:
        const { ReservationCancelledEmail } = await import('./templates/reservation-cancelled')
        return ReservationCancelledEmail(data)

      case EmailType.ReservationModified:
        const { ReservationModifiedEmail } = await import('./templates/reservation-modified')
        return ReservationModifiedEmail(data)

      case EmailType.CustomMessage:
        const { CustomMessageEmail } = await import('./templates/custom-message')
        return CustomMessageEmail(data as CustomEmailData)

      default:
        throw new Error(`Unknown email type: ${emailType}`)
    }
  }

  /**
   * Generate dynamic email subjects
   */
  private getEmailSubject(emailType: EmailType, data: EmailTemplateData): string {
    switch (emailType) {
      case EmailType.ReservationCreated:
        return `Nueva reserva recibida - ${data.reservationDate} - Enigma Cocina Con Alma`

      case EmailType.ReservationConfirmed:
        return `¡Reserva confirmada! - ${data.reservationDate} - Enigma Cocina Con Alma`

      case EmailType.ReservationReminder:
        return `Recordatorio: Tu reserva es hoy - ${data.reservationTime} - Enigma Cocina Con Alma`

      case EmailType.ReservationReview:
        return `¿Cómo fue tu experiencia? - Enigma Cocina Con Alma`

      case EmailType.ReservationCancelled:
        return `Reserva cancelada - Esperamos verte pronto - Enigma Cocina Con Alma`

      case EmailType.ReservationModified:
        return `Reserva modificada - Confirmación pendiente - ${data.reservationDate} - Enigma Cocina Con Alma`

      case EmailType.CustomMessage:
        // For custom messages, use the custom subject or fallback
        const customData = data as CustomEmailData
        return customData.customSubject || `Mensaje personalizado - ${data.restaurantName}`

      default:
        return `Notificación de reserva - Enigma Cocina Con Alma`
    }
  }

  /**
   * Log email to database (exact field names)
   */
  private async logEmailSent(
    reservationId: string,
    emailType: EmailType,
    recipientEmail: string,
    messageId: string,
    emailData?: any
  ) {
    try {
      const supabase = createDirectAdminClient()

      const { error } = await supabase
        .schema('restaurante')
        .from('email_logs')
        .insert({
          reservation_id: reservationId,
          recipient_email: recipientEmail,
          email_type: emailType,
          subject: emailData ? this.getEmailSubject(emailType, emailData) : `Email - ${emailType}`,
          message_id: messageId,
          status: 'sent',
          sent_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to log email:', error)
      }
    } catch (error) {
      console.error('Email logging error:', error)
    }
  }

  /**
   * PATTERN: Structured error handling
   */
  private handleEmailError(error: any): EmailResult {
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return EmailResult.SmtpError
      }
      if (error.message.includes('rate limit')) {
        return EmailResult.RateLimitExceeded
      }
      if (error.message.includes('invalid email')) {
        return EmailResult.InvalidEmail
      }
    }

    return EmailResult.SmtpError
  }

  /**
   * Test SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = getTransporter()
      await transporter.verify()
      return true
    } catch (error) {
      console.error('SMTP connection verification failed:', error)
      return false
    }
  }

  /**
   * Get transporter for direct access (testing purposes)
   */
  getTransporter() {
    return getTransporter()
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()
export default EmailService