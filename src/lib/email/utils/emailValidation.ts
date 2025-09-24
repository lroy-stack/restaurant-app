// Email validation helpers
// PATTERN: Comprehensive validation for email service

import { EmailTemplateData } from '../types/emailTypes'

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateEmailTemplateData(data: EmailTemplateData): string[] {
  const errors: string[] = []

  // Required fields validation
  if (!data.customerName.trim()) {
    errors.push('Customer name is required')
  }

  if (!data.customerEmail || !isValidEmail(data.customerEmail)) {
    errors.push('Valid customer email is required')
  }

  if (!data.reservationId.trim()) {
    errors.push('Reservation ID is required')
  }

  if (!data.reservationDate.trim()) {
    errors.push('Reservation date is required')
  }

  if (!data.reservationTime.trim()) {
    errors.push('Reservation time is required')
  }

  if (data.partySize <= 0) {
    errors.push('Party size must be greater than 0')
  }

  if (!data.restaurantName.trim()) {
    errors.push('Restaurant name is required')
  }

  return errors
}

export function sanitizeEmailContent(content: string): string {
  // Basic HTML sanitization for email content
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  // Simple Spanish phone number formatting
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('34')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  return phone
}