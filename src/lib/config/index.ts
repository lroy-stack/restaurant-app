import { z } from 'zod'

/**
 * Environment Variables Schema
 *
 * Validates all required environment variables at startup.
 * Fails fast if misconfigured.
 *
 * Pattern: Industry best practice for production apps
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_SCHEMA: z.string().default('public'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // NextAuth v5
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Google OAuth
  ENABLE_GOOGLE_SIGNUP: z.coerce.boolean().default(false),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // Email Configuration (SMTP)
  ENABLE_EMAIL_SIGNUP: z.coerce.boolean().default(true),
  ENABLE_EMAIL_AUTOCONFIRM: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  SMTP_SENDER_NAME: z.string().default('Enigma Cocina Con Alma'),
  SMTP_ADMIN_EMAIL: z.string().email(),

  // IMAP Configuration (Email Reception)
  IMAP_HOST: z.string().min(1).optional(),
  IMAP_PORT: z.coerce.number().int().positive().optional(),
  IMAP_USER: z.string().email().optional(),
  IMAP_PASSWORD: z.string().optional(),

  // Email Aliases
  EMAIL_ENIGMITO: z.string().email().optional(),
  EMAIL_GESTION: z.string().email().optional(),
  EMAIL_REPORTES: z.string().email().optional(),
  EMAIL_HOLA: z.string().email().optional(),
  EMAIL_NOREPLY: z.string().email().optional(),
  EMAIL_INFO: z.string().email().optional(),
  EMAIL_FACTURACION: z.string().email().optional(),

  // Site Configuration
  SITE_URL: z.string().url().default('https://enigmaconalma.com'),
  API_EXTERNAL_URL: z.string().url().optional(),

  // QR Menu System
  NEXT_PUBLIC_QR_MENU_URL: z.string().url().optional(),

  // Feature Flags
  ENABLE_ANONYMOUS_USERS: z.coerce.boolean().default(false),
  ENABLE_PHONE_SIGNUP: z.coerce.boolean().default(false),
  ENABLE_PHONE_AUTOCONFIRM: z.coerce.boolean().default(false),
  DISABLE_SIGNUP: z.coerce.boolean().default(false),

  // JWT
  JWT_EXPIRY: z.coerce.number().int().positive().default(3600),
})

/**
 * Validate and parse environment variables
 * Throws error at startup if validation fails
 */
const env = envSchema.parse(process.env)

/**
 * Centralized Configuration Object
 *
 * Type-safe access to all environment variables.
 * Use this instead of process.env directly.
 *
 * @example
 * import { CONFIG } from '@/lib/config'
 * const url = CONFIG.supabase.url  // Type-safe!
 */
export const CONFIG = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',

  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    schema: env.NEXT_PUBLIC_SUPABASE_SCHEMA,
    databaseUrl: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },

  auth: {
    secret: env.AUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },

  oauth: {
    google: {
      enabled: env.ENABLE_GOOGLE_SIGNUP,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    }
  },

  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      secure: env.SMTP_PORT === 465,
    },
    imap: {
      host: env.IMAP_HOST,
      port: env.IMAP_PORT,
      user: env.IMAP_USER,
      password: env.IMAP_PASSWORD,
    },
    sender: {
      name: env.SMTP_SENDER_NAME,
      address: env.SMTP_ADMIN_EMAIL,
    },
    aliases: {
      admin: env.SMTP_ADMIN_EMAIL,
      enigmito: env.EMAIL_ENIGMITO,
      gestion: env.EMAIL_GESTION,
      reportes: env.EMAIL_REPORTES,
      hola: env.EMAIL_HOLA,
      noreply: env.EMAIL_NOREPLY,
      info: env.EMAIL_INFO,
      facturacion: env.EMAIL_FACTURACION,
    }
  },

  site: {
    url: env.SITE_URL,
    apiUrl: env.API_EXTERNAL_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  },

  qrMenu: {
    url: env.NEXT_PUBLIC_QR_MENU_URL,
  },

  features: {
    googleSignup: env.ENABLE_GOOGLE_SIGNUP,
    emailSignup: env.ENABLE_EMAIL_SIGNUP,
    emailAutoconfirm: env.ENABLE_EMAIL_AUTOCONFIRM,
    anonymousUsers: env.ENABLE_ANONYMOUS_USERS,
    phoneSignup: env.ENABLE_PHONE_SIGNUP,
    phoneAutoconfirm: env.ENABLE_PHONE_AUTOCONFIRM,
    signupDisabled: env.DISABLE_SIGNUP,
  },

  jwt: {
    expirySeconds: env.JWT_EXPIRY,
  }
} as const

/**
 * Type exports for use in other modules
 */
export type AppConfig = typeof CONFIG
export type SupabaseConfig = typeof CONFIG.supabase
export type EmailConfig = typeof CONFIG.email
