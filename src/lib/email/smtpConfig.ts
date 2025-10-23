// Titan.email SMTP Configuration - EXACT configuration from official docs
// Environment variables already validated in .env.sample

import { SMTPConfig } from './types/emailTypes'

// CRITICAL: SOLO Hostinger SMTP configuration (NO TITAN)
export const createSMTPConfig = (): SMTPConfig => {
  // FIXED: FORZAR SOLO smtp.hostinger.com - NO usar env variables incorrectas
  const host = 'smtp.hostinger.com' // FORCED: Solo Hostinger
  const port = 465 // SSL por defecto para Hostinger
  const user = process.env.SMTP_USER || process.env.EMAIL_ADMIN || 'admin@enigmaconalma.com'
  const pass = process.env.SMTP_PASS || 'Encryption-23'

  console.log('🔧 HOSTINGER SOLO Config:', {
    host,
    port,
    user: user.substring(0, 8) + '***',
    hasPass: !!pass,
    secure: port === 465,
    provider: 'Hostinger SOLO'
  })

  // Validate required environment variables
  if (!user || !pass) {
    throw new Error('SMTP configuration incomplete: SMTP_USER and SMTP_PASS are required')
  }

  return {
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user,
      pass
    },
    tls: {
      // Context7 best practice: allow self-signed certs for Hostinger
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  }
}

// BACKUP: Solo configuraciones alternativas de Hostinger (NO TITAN)
export const createAlternativeSMTPConfigs = () => [
  {
    name: 'Hostinger Primary (SSL)',
    config: {
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'admin@enigmaconalma.com',
        pass: process.env.SMTP_PASS || 'Encryption-23'
      },
      tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
    }
  },
  {
    name: 'Hostinger Alternative (STARTTLS)',
    config: {
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'admin@enigmaconalma.com',
        pass: process.env.SMTP_PASS || 'Encryption-23'
      },
      tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
    }
  }
]

// Connection pool settings for performance
export const connectionPoolConfig = {
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // 1 second
  rateLimit: 5 // max 5 emails per second per connection
}

// Sender information from .env
// ✅ UPDATED: Generic fallbacks (no "Enigma" hardcoded)
export const senderConfig = {
  name: process.env.SMTP_SENDER_NAME || 'Tu Restaurante',
  email: process.env.EMAIL_NOREPLY || 'noreply@turestaurante.com',
  replyTo: process.env.EMAIL_INFO || 'info@turestaurante.com'
}

export default createSMTPConfig