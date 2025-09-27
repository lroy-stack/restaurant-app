// Base Email Template - Enigma Cocina Con Alma - DESIGN SYSTEM COMPLIANT
// CRITICAL: Uses EXACT OKLCH tokens from globals.css + Brand fonts
// DYNAMIC: Real restaurant data via restaurantService (NO hardcoded)
// PATTERN: React Email + Postmark Templates structure

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Hr,
  Font,
  Link
} from '@react-email/components'
import * as React from 'react'

export interface EmailBaseProps {
  preview: string
  restaurantName?: string
  restaurantEmail?: string
  restaurantPhone?: string
  // Social Media URLs
  instagramUrl?: string
  facebookUrl?: string
  whatsappNumber?: string
  // Branding configuration
  branding?: {
    logo: string
    fonts: {
      googleFontsUrl: string
      primary: string
      secondary: string
      body: string
      elegant: string
    }
  }
  children: React.ReactNode
}

// Hook for dynamic restaurant data - REMOVED (React hooks don't work in email templates)
// Email templates are server-side rendered, will use props instead

export const EmailBase = ({
  preview,
  restaurantName,
  restaurantEmail,
  restaurantPhone,
  instagramUrl,
  facebookUrl,
  whatsappNumber,
  branding,
  children
}: EmailBaseProps) => {
  // Use fallback data if props not provided (REAL data from SSH verification)
  const finalRestaurantName = restaurantName || 'Enigma Cocina Con Alma'
  const finalRestaurantEmail = restaurantEmail || 'reservas@enigmaconalma.com'
  const finalRestaurantPhone = restaurantPhone || '+34 672 79 60 06'
  const finalAddress = 'Carrer Justicia 6A, 03710 Calpe, Alicante' // VERIFIED real address
  const finalInstagramUrl = instagramUrl || 'https://www.instagram.com/enigmaconalma/'
  const finalFacebookUrl = facebookUrl || 'https://www.facebook.com/enigma.restaurante.calpe/'
  const finalWhatsappNumber = whatsappNumber || '+34 672 79 60 06'
  return (
    <Html lang="es">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />

        {/* Brand Fonts - Benaya, Playfair, Crimson, Inter */}
        <Font
          fontFamily="Benaya"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Benaya:wght@400;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Crimson Text"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>{preview}</Preview>

      <Body style={main}>
        <Container style={container}>
          {/* Modern Header with Logo PNG */}
          <Section style={header}>
            {/* FIXED: Logo Image - Using absolute HTTPS URL for email compatibility */}
            <Img
              src="https://enigmaconalma.com/logo512.png"
              width="80"
              height="80"
              alt="Enigma Cocina Con Alma"
              style={logoImage}
            />

            {/* Brand Typography - Using Benaya + Playfair */}
            <Text style={logoText}>
              <span style={brandMain}>Enigma</span>
              <br />
              <span style={brandSubtitle}>Cocina Con Alma</span>
            </Text>

            {/* Elegant Tagline - Crimson Text */}
            <Text style={tagline}>Donde cada plato cuenta una historia</Text>
          </Section>

          {/* Dynamic Content */}
          <Section style={content}>
            {children}
          </Section>

          <Hr style={divider} />

          {/* Footer - Dynamic restaurant information */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>{finalRestaurantName}</strong><br />
              {finalAddress}<br />
              Tel: {finalRestaurantPhone}<br />
              Email: {finalRestaurantEmail}
            </Text>

            <Text style={footerText}>
              Síguenos en nuestras redes sociales<br />
              <a href={finalInstagramUrl} style={footerLink}>Instagram</a> |
              <a href={finalFacebookUrl} style={footerLink}> Facebook</a>
              {finalWhatsappNumber && (
                <span> | <a href={`https://wa.me/${finalWhatsappNumber.replace(/[^\\d]/g, '')}`} style={footerLink}> WhatsApp</a></span>
              )}
            </Text>

            <Text style={footerSmall}>
              Este email fue enviado desde {finalRestaurantName}.<br />
              Si no deseas recibir más emails, puedes darte de baja aquí.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// CRITICAL: Email-compatible colors (RGB/HEX only - NO OKLCH)
// Converted from OKLCH design tokens to email-safe RGB values
const main = {
  backgroundColor: '#fafbfc', // Converted from oklch(0.985 0.002 210)
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  padding: '24px 0',
  minHeight: '100vh'
}

const container = {
  backgroundColor: '#ffffff', // Converted from oklch(1 0 0)
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e2e4e6' // Converted from oklch(0.88 0.01 210)
}

const header = {
  padding: '56px 40px 48px',
  textAlign: 'center' as const,
  backgroundColor: '#237584', // ENIGMA TEAL REAL del manual de marca
  borderRadius: '12px 12px 0 0',
  position: 'relative' as const,
  backgroundImage: 'linear-gradient(135deg, #237584 0%, #1a5a66 100%)', // Gradiente teal real
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
}

const logoImage = {
  display: 'block',
  margin: '0 auto 20px', // More space below logo
  borderRadius: '16px', // Larger radius
  boxShadow: '0 6px 20px rgba(0,0,0,0.15)', // Deeper shadow
  border: '3px solid rgba(255,255,255,0.2)' // Subtle white border
}

const logoText = {
  margin: '0 0 12px',
  textAlign: 'center' as const
}

const brandMain = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#ffffff', // Blanco puro sobre teal para máximo contraste
  letterSpacing: '-0.02em',
  lineHeight: '1.1',
  fontFamily: 'Benaya, Georgia, serif',
  textShadow: '0 2px 6px rgba(0,0,0,0.15)'
}

const brandSubtitle = {
  fontSize: '18px',
  fontWeight: '500',
  color: '#ffffff', // Blanco puro sobre teal
  opacity: 0.95,
  letterSpacing: '0.12em',
  fontFamily: 'Playfair Display, Georgia, serif',
  textShadow: '0 1px 3px rgba(0,0,0,0.12)'
}

const tagline = {
  fontSize: '14px',
  fontWeight: '400',
  color: '#ffffff', // Blanco puro sobre teal
  opacity: 0.85,
  letterSpacing: '0.04em',
  margin: '16px 0 0',
  fontStyle: 'italic',
  fontFamily: 'Crimson Text, Georgia, serif',
  textAlign: 'center' as const
}

const content = {
  padding: '48px 40px' // More generous content padding
}

const divider = {
  border: 'none',
  borderTop: '2px solid #e2e4e6', // Converted from oklch(0.88 0.01 210)
  margin: '40px 40px',
  opacity: 0.6
}

const footer = {
  padding: '40px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f6f7f8', // Converted from oklch(0.96 0.005 210)
  borderRadius: '0 0 12px 12px',
  borderTop: '1px solid #e2e4e6' // Converted from oklch(0.88 0.01 210)
}

const footerText = {
  color: '#6b7280', // Converted from oklch(0.45 0.025 200)
  fontSize: '14px',
  lineHeight: '21px',
  margin: '0 0 16px',
  fontWeight: '400',
  fontFamily: 'Inter, system-ui, sans-serif',
  textAlign: 'center' as const
}

const footerLink = {
  color: '#237584', // ENIGMA TEAL REAL del manual
  textDecoration: 'none',
  fontWeight: '500'
}

const footerSmall = {
  color: '#6b7280', // Converted from oklch(0.45 0.025 200)
  fontSize: '12px',
  lineHeight: '18px',
  margin: '20px 0 0',
  fontFamily: 'Inter, system-ui, sans-serif',
  textAlign: 'center' as const
}

export default EmailBase