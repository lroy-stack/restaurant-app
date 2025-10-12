// Reservation Review Email Template - MODERN & CLEAN
// Sent after completing reservation - request for reviews

import {
  Section,
  Heading,
  Text,
  Button,
  Row,
  Column,
  Container
} from '@react-email/components'
import * as React from 'react'
import { EmailBase } from './email-base'
import { EmailTemplateData } from '../types/emailTypes'
import { emailColors, emailTextStyles, emailLayoutStyles } from '../styles/emailColors'

export interface ReservationReviewEmailProps extends EmailTemplateData {}

export const ReservationReviewEmail = ({
  customerName,
  reservationDate,
  reservationTime,
  partySize,
  restaurantName,
  restaurantEmail,
  restaurantPhone,
  urls
}: ReservationReviewEmailProps) => {
  const preview = `¡Gracias por visitarnos! ¿Cómo fue tu experiencia en ${restaurantName}?`

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
      restaurantEmail={restaurantEmail}
      restaurantPhone={restaurantPhone}
    >
      {/* Modern Thank You Banner */}
      <Container style={thankYouBanner}>
        <Text style={bannerText}>¡GRACIAS POR VISITARNOS!</Text>
        <Text style={bannerSubtext}>Tu opinión nos importa</Text>
      </Container>

      <Section style={greetingSection}>
        <Heading style={emailTextStyles.h1}>
          ¡Hola {customerName}!
        </Heading>

        <Text style={emailTextStyles.paragraph}>
          Esperamos que hayas disfrutado de tu visita a <strong>{restaurantName}</strong> el{' '}
          <strong>{reservationDate} a las {reservationTime}</strong>.
        </Text>

        <Text style={emphasizedText}>
          Tu opinión es muy importante para nosotros y nos ayuda a mejorar cada día.
        </Text>
      </Section>

      {/* Primary CTA: Nueva Reserva */}
      <Section style={primaryCtaSection}>
        <Heading as="h2" style={h2}>¿Te gustaría volver?</Heading>

        <Text style={ctaText}>
          Nos encantaría recibirte de nuevo. Reserva tu próxima experiencia con nosotros:
        </Text>

        <Section style={buttonContainer}>
          <Button style={emailLayoutStyles.buttonPrimary} href="https://enigmaconalma.com/reservas">
            Hacer Nueva Reserva
          </Button>
        </Section>
      </Section>

      {/* Reviews Section */}
      <Section style={reviewsSection}>
        <Heading as="h2" style={h2}>Comparte tu Experiencia</Heading>

        <Text style={emailTextStyles.paragraph}>
          Si disfrutaste tu visita, nos haría mucha ilusión que compartieras tu experiencia online:
        </Text>

        <Section style={reviewButtonsContainer}>
          <Row>
            <Column style={reviewColumn}>
              <Button
                style={googleButton}
                href="https://www.google.com/search?sca_esv=c872d79fb2a9e0a7&sxsrf=AE3TifOLK5yfsFPYpEobMxrJMxqvBcNAkw:1760280018696&q=opiniones+de+enigma+cocina+con+alma&uds=AOm0WdE2fekQnsyfYEw8JPYozOKzY1bxVhkUoZf9RVw_4yjZN0_wIGnEki--C32DP8TPfAVnY_a3N6oSRXI4P-aKAAPLf7bQ-Cw1FRYpOXxF054OsH5-ZXS18NVRLYs3oHLMINjmOE2WRX28jOP_2YVvXxoTbuLwkDEWm9_PbqZ8yu7DmCsDMKSc2xe8lKo63mJt30mibTU7&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E7bPKH7ZY1OjzdH1-TzTAhYqRJm0aTMk05avWMLFUa83jbWPXWADGCwRBoqcsqjv9Burp1G3NntTvz6AN_L5vSfWg0wk6YZ1PcgDtHJUenOL93tg0w%3D%3D&sa=X&ved=2ahUKEwiOxOCJ8p6QAxWL8LsIHUzsKa0QxKsJKAF6BAgREAE&ictx=1&stq=1&cs=0&lei=0r3raI6TKovh7_UPzNin6Qo"
              >
                ⭐ Google Reviews
              </Button>
            </Column>
          </Row>

          <Row style={{marginTop: '12px'}}>
            <Column style={reviewColumn}>
              <Button
                style={tripadvisorButton}
                href="https://www.tripadvisor.es/UserReviewEdit-g187526-d23958723-Enigma_Cocina_Con_Alma-Calpe_Costa_Blanca_Province_of_Alicante_Valencian_Community.html"
              >
                🌍 TripAdvisor
              </Button>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Social Media Section */}
      <Section style={socialSection}>
        <Heading as="h3" style={h3}>Síguenos en Instagram</Heading>

        <Text style={emailTextStyles.paragraph}>
          Descubre nuestros platos especiales y novedades:
        </Text>

        <Section style={buttonContainer}>
          <Button
            style={instagramButton}
            href="https://www.instagram.com/enigmaconalma"
          >
            📱 @enigmaconalma
          </Button>
        </Section>
      </Section>

      {/* Feedback Section */}
      <Section style={feedbackSection}>
        <Heading as="h3" style={h3}>¿Algo que podríamos mejorar?</Heading>

        <Text style={emailTextStyles.paragraph}>
          Tu feedback constructivo nos ayuda a mejorar. Escríbenos:
        </Text>

        <Section style={contactBox}>
          <Text style={contactText}>
            ✉️ {restaurantEmail}<br/>
            📱 {restaurantPhone}
          </Text>
        </Section>
      </Section>

      {/* Final Thank You */}
      <Section style={finalThankYou}>
        <Text style={thankYouText}>
          {customerName}, gracias por elegir <strong>{restaurantName}</strong>.<br/><br/>
          <em>Esperamos verte pronto de nuevo,<br/>
          El Equipo de Enigma Cocina Con Alma 👨‍🍳</em>
        </Text>
      </Section>

    </EmailBase>
  )
}

// Modern Styles Following Project Patterns
const thankYouBanner = {
  backgroundColor: emailColors.secondary,
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  border: `2px solid ${emailColors.secondaryBorder}`
}

const bannerText = {
  color: emailColors.primary,
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '0.05em',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const bannerSubtext = {
  color: emailColors.mutedForeground,
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const greetingSection = {
  margin: '0 0 32px'
}

const emphasizedText = {
  color: emailColors.accent,
  fontSize: '17px',
  fontWeight: '500',
  lineHeight: '26px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
  fontStyle: 'italic'
}

const primaryCtaSection = {
  backgroundColor: emailColors.card,
  border: `3px solid ${emailColors.primary}`,
  borderRadius: '12px',
  padding: '32px 24px',
  margin: '32px 0',
  textAlign: 'center' as const
}

const h2 = {
  color: emailColors.foreground,
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif'
}

const h3 = {
  color: emailColors.foreground,
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif'
}

const ctaText = {
  color: emailColors.mutedForeground,
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0'
}

const reviewsSection = {
  backgroundColor: emailColors.muted,
  border: `1px solid ${emailColors.border}`,
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const
}

const reviewButtonsContainer = {
  margin: '20px 0 0'
}

const reviewColumn = {
  width: '100%',
  textAlign: 'center' as const,
  padding: '0'
}

const googleButton = {
  backgroundColor: '#4285f4',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  width: '280px',
  maxWidth: '100%',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const tripadvisorButton = {
  backgroundColor: '#00af87',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  width: '280px',
  maxWidth: '100%',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const socialSection = {
  backgroundColor: '#FFF5F7',
  border: '1px solid #FFE1E9',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const
}

const instagramButton = {
  backgroundColor: '#E4405F',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const feedbackSection = {
  backgroundColor: emailColors.muted,
  border: `1px solid ${emailColors.border}`,
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const
}

const contactBox = {
  backgroundColor: emailColors.card,
  borderRadius: '8px',
  padding: '16px',
  margin: '16px auto 0',
  maxWidth: '300px'
}

const contactText = {
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif',
  color: emailColors.foreground
}

const finalThankYou = {
  backgroundColor: emailColors.muted,
  borderLeft: `4px solid ${emailColors.accent}`,
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0 0'
}

const thankYouText = {
  color: emailColors.foreground,
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif'
}

export default ReservationReviewEmail
