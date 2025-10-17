import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'

/**
 * Schema de validación para solicitud de grupo grande
 */
export const largeGroupContactSchema = z.object({
  fullName: z.string().min(3, 'Nombre completo demasiado corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().refine((value) => {
    return isValidPhoneNumber(value)
  }, {
    message: 'Número de teléfono inválido. Incluye código de país (+34, +33, etc.)'
  }),
  notes: z.string().optional()
})

export type LargeGroupContactFormData = z.infer<typeof largeGroupContactSchema>

/**
 * Datos completos de la solicitud incluyendo detalles de reserva
 */
export interface LargeGroupContactData extends LargeGroupContactFormData {
  dateTime: string
  partySize: number
  preferredLanguage: 'ES' | 'EN' | 'DE'
}

/**
 * Respuesta de la API
 */
export interface LargeGroupRequestResponse {
  success: boolean
  message: string
  whatsappUrl?: string
}

/**
 * Mensaje formateado para WhatsApp
 */
export interface WhatsAppMessage {
  text: string
  url: string
}
