// Custom Message Email Template - Enigma Cocina Con Alma
// DYNAMIC: Fully customizable message with client context
// PATTERN: React Email + EmailBase + Predefined templates support

import {
  Section,
  Heading,
  Text,
  Button,
  Row,
  Column,
  Container,
  Hr
} from '@react-email/components'
import * as React from 'react'
import { EmailBase } from './email-base'
import { emailColors, emailTextStyles, emailLayoutStyles } from '../styles/emailColors'
import { CustomEmailData } from '../types/emailTypes'

// Predefined message templates
const MESSAGE_TEMPLATES = {
  offer: {
    subject: '🎉 Oferta especial para ti en {restaurantName}',
    greeting: '¡Tenemos algo especial para ti!',
    defaultMessage: `
      <p>Como cliente especial de <strong>{restaurantName}</strong>, queremos ofrecerte una experiencia única.</p>
      <p>Disfruta de un <strong>descuento especial</strong> en tu próxima visita y déjanos sorprenderte una vez más con nuestra cocina.</p>
    `,
    ctaText: 'Reservar Ahora',
    icon: '🎁'
  },
  promotion: {
    subject: '✨ Nueva promoción disponible - {restaurantName}',
    greeting: 'No te pierdas nuestra nueva promoción',
    defaultMessage: `
      <p>Nos complace presentarte nuestra última promoción en <strong>{restaurantName}</strong>.</p>
      <p>Una oportunidad perfecta para disfrutar de nuestra cocina con condiciones especiales.</p>
    `,
    ctaText: 'Ver Promoción',
    icon: '🌟'
  },
  followup: {
    subject: 'Gracias por visitarnos - {restaurantName}',
    greeting: 'Esperamos que hayas disfrutado tu experiencia',
    defaultMessage: `
      <p>Queremos agradecerte por elegir <strong>{restaurantName}</strong> para tu experiencia gastronómica.</p>
      <p>Tu opinión es muy importante para nosotros. ¿Nos ayudarías compartiendo tu experiencia?</p>
    `,
    ctaText: 'Dejar Reseña',
    icon: '💙'
  },
  custom: {
    subject: 'Mensaje personalizado de {restaurantName}',
    greeting: 'Estimado/a {customerName}',
    defaultMessage: `
      <p>Queremos ponernos en contacto contigo desde <strong>{restaurantName}</strong>.</p>
      <p>[Tu mensaje personalizado aquí]</p>
    `,
    ctaText: 'Más Información',
    icon: '📧'
  }
}

// Helper function to replace variables in text
const replaceVariables = (text: string, data: CustomEmailData): string => {
  return text
    .replace(/{customerName}/g, data.customerName || 'Estimado cliente')
    .replace(/{restaurantName}/g, data.restaurantName || 'Enigma Cocina Con Alma')
    .replace(/{totalVisits}/g, String(data.clientContext?.totalVisits || 0))
    .replace(/{lastVisit}/g, data.clientContext?.lastVisit || '')
    .replace(/{averageSpending}/g, String(data.clientContext?.averageSpending || 0))
}

// Helper to get client insights
const getClientInsights = (context?: CustomEmailData['clientContext']) => {
  if (!context) return null

  const insights = []

  if (context.totalVisits && context.totalVisits > 5) {
    insights.push(`Has visitado nuestro restaurante ${context.totalVisits} veces`)
  }

  if (context.isVip) {
    insights.push('Eres un cliente VIP muy valorado')
  }

  if (context.favoriteItems && context.favoriteItems.length > 0) {
    insights.push(`Sabemos que te gusta: ${context.favoriteItems.slice(0, 2).join(', ')}`)
  }

  return insights.length > 0 ? insights : null
}

export const CustomMessageEmail = (data: CustomEmailData) => {
  const template = MESSAGE_TEMPLATES[data.messageType] || MESSAGE_TEMPLATES.custom
  const processedMessage = replaceVariables(data.customMessage || template.defaultMessage, data)
  const processedSubject = replaceVariables(data.customSubject || template.subject, data)
  const clientInsights = getClientInsights(data.clientContext)

  const preview = `${template.greeting} - ${data.restaurantName}`

  return (
    <EmailBase
      preview={preview}
      restaurantName={data.restaurantName}
      restaurantEmail={data.restaurantEmail}
      restaurantPhone={data.restaurantPhone}
      branding={data.branding}
    >
      {/* Message Type Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>
          {template.icon} {data.messageType.toUpperCase()}
        </Text>
      </Section>

      {/* Personalized Greeting */}
      <Heading style={h1}>
        {replaceVariables(template.greeting, data)}
      </Heading>

      {/* Client Insights Section */}
      {clientInsights && (
        <Section style={insightsBox}>
          <Text style={insightsTitle}>💡 Sabemos que...</Text>
          {clientInsights.map((insight, index) => (
            <Text key={index} style={insightItem}>
              • {insight}
            </Text>
          ))}
        </Section>
      )}

      {/* Custom Message Content */}
      <Section style={messageContainer}>
        <div dangerouslySetInnerHTML={{ __html: processedMessage }} />
      </Section>

      {/* Call to Action */}
      {data.ctaText && data.ctaUrl && (
        <Section style={ctaContainer}>
          <Button
            href={data.ctaUrl}
            style={ctaButton}
          >
            {data.ctaText}
          </Button>
        </Section>
      )}

      {/* Personalized Footer */}
      <Hr style={divider} />

      <Section style={footerPersonalized}>
        <Text style={footerText}>
          Este mensaje ha sido enviado especialmente para ti desde <strong>{data.restaurantName}</strong>.
        </Text>

        {data.clientContext?.language && data.clientContext.language !== 'ES' && (
          <Text style={languageNote}>
            💬 Si prefieres recibir comunicaciones en otro idioma, por favor contáctanos.
          </Text>
        )}
      </Section>
    </EmailBase>
  )
}

// Styles following Enigma design system
const badgeContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px'
}

const badge = {
  display: 'inline-block',
  backgroundColor: emailColors.primary,
  color: emailColors.primaryForeground,
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
}

const h1 = {
  ...emailTextStyles.h1,
  textAlign: 'center' as const,
  marginBottom: '24px'
}

const insightsBox = {
  backgroundColor: emailColors.muted,
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: `1px solid ${emailColors.border}`
}

const insightsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: emailColors.primary,
  marginBottom: '8px'
}

const insightItem = {
  fontSize: '13px',
  color: emailColors.mutedForeground,
  marginBottom: '4px'
}

const messageContainer = {
  ...emailLayoutStyles.section,
  fontSize: '16px',
  lineHeight: '1.6',
  color: emailColors.foreground
}

const ctaContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px'
}

const ctaButton = {
  backgroundColor: emailColors.primary,
  color: emailColors.primaryForeground,
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block'
}

const divider = {
  borderColor: emailColors.border,
  margin: '32px 0'
}

const footerPersonalized = {
  textAlign: 'center' as const,
  marginTop: '24px'
}

const footerText = {
  fontSize: '14px',
  color: emailColors.mutedForeground,
  fontStyle: 'italic'
}

const languageNote = {
  fontSize: '12px',
  color: emailColors.mutedForeground,
  marginTop: '8px'
}

// Export template function for EmailService
export const CustomMessage = CustomMessageEmail