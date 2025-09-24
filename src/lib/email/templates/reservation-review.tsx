// Reservation Review Email Template (2h after completed reservation)
// CRITICAL: ALL content DYNAMIC - post-visit feedback and review request
// Focus: Customer satisfaction, reviews, loyalty program

import {
  Section,
  Heading,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase } from './email-base'
import { EmailTemplateData } from '../types/emailTypes'

export interface ReservationReviewEmailProps extends EmailTemplateData {}

export const ReservationReviewEmail = ({
  customerName,
  reservationDate,
  reservationTime,
  partySize,
  restaurantName,
  restaurantEmail,
  restaurantPhone,
  tokenUrl,
  urls,
  branding
}: ReservationReviewEmailProps) => {
  const preview = `¡Gracias por visitarnos! ¿Cómo fue tu experiencia en ${restaurantName}?`

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
      restaurantEmail={restaurantEmail}
      restaurantPhone={restaurantPhone}
    >
      {/* Thank you header */}
      <Section style={thankYouBanner}>
        <Text style={bannerText}>✨ ¡GRACIAS POR VISITARNOS! ✨</Text>
      </Section>

      <Heading style={h1}>
        ¡Hola {customerName}!
      </Heading>

      <Text style={paragraph}>
        Esperamos que hayas disfrutado de tu visita a <strong>{restaurantName}</strong> el pasado
        <strong> {reservationDate} a las {reservationTime}</strong>.
      </Text>

      <Text style={emphasizedText}>
        Para nosotros es muy importante conocer tu opinión y asegurarnos de que cada experiencia
        sea única y memorable. 🍽️💫
      </Text>

      {/* Experience feedback section */}
      <Section style={feedbackBox}>
        <Heading as="h2" style={h2}>🌟 ¿Cómo fue tu experiencia?</Heading>

        <Text style={paragraph}>
          Tu opinión nos ayuda a mejorar cada día y ofrecer el mejor servicio a todos nuestros clientes.
          ¡Solo te llevará 2 minutos!
        </Text>

        <Section style={ratingContainer}>
          <Text style={ratingText}>
            Califica tu experiencia general:
          </Text>

          <Row style={starsRow}>
            <Column style={starColumn}>⭐</Column>
            <Column style={starColumn}>⭐⭐</Column>
            <Column style={starColumn}>⭐⭐⭐</Column>
            <Column style={starColumn}>⭐⭐⭐⭐</Column>
            <Column style={starColumn}>⭐⭐⭐⭐⭐</Column>
          </Row>

          <Text style={ratingSubtext}>
            (Haz clic en las estrellas para evaluar)
          </Text>
        </Section>

        {tokenUrl && (
          <Section style={buttonContainer}>
            <Button style={feedbackButton} href={tokenUrl}>
              Calificar mi Experiencia
            </Button>
          </Section>
        )}
      </Section>

      {/* Online reviews section */}
      <Section style={reviewsBox}>
        <Heading as="h2" style={h2}>📝 Comparte tu Experiencia Online</Heading>

        <Text style={paragraph}>
          Si te ha gustado tu visita, nos haría mucha ilusión que compartieras tu experiencia
          en nuestras plataformas. ¡Tu reseña ayuda a otros comensales a descubrirnos!
        </Text>

        <Row style={reviewPlatformsRow}>
          <Column style={reviewColumn}>
            <Button style={googleButton} href="https://g.page/r/enigmacocinacanalma/review">
              ⭐ Google Reviews
            </Button>
          </Column>
          <Column style={reviewColumn}>
            <Button style={tripadvisorButton} href="https://tripadvisor.es/enigmacocinacanalma">
              🌍 TripAdvisor
            </Button>
          </Column>
        </Row>

        <Text style={reviewBenefit}>
          🎁 <strong>Como agradecimiento:</strong> Los clientes que dejen una reseña online
          recibirán un <strong>10% de descuento</strong> en su próxima visita.
        </Text>
      </Section>

      {/* Special moments section */}
      <Section style={momentsBox}>
        <Heading as="h3" style={h3}>📸 ¿Capturaste algún momento especial?</Heading>

        <Text style={paragraph}>
          Si tienes fotos de tu experiencia, nos encantaría verlas.
          ¡Etiquétanos en redes sociales y las compartiremos!
        </Text>

        <Text style={socialTags}>
          📱 Instagram: <strong>@enigmacocinacanalma</strong><br/>
          📘 Facebook: <strong>/enigmacocinacanalma</strong><br/>
          🐦 Twitter: <strong>@enigmacocina</strong>
        </Text>
      </Section>

      {/* Improvement suggestions */}
      <Section style={improvementBox}>
        <Heading as="h3" style={h3}>💡 ¿Algo que podríamos mejorar?</Heading>

        <Text style={paragraph}>
          Valoramos mucho la crítica constructiva. Si algo no estuvo a la altura de tus expectativas
          o tienes alguna sugerencia, por favor compártela con nosotros.
        </Text>

        <Text style={contactInfo}>
          ✉️ Escríbenos directamente: {restaurantEmail}<br/>
          📱 WhatsApp: {restaurantPhone}<br/>
          🌐 Formulario web: enigmaconalma.com/contacto
        </Text>
      </Section>

      {/* Loyalty program */}
      <Section style={loyaltyBox}>
        <Heading as="h3" style={h3}>🎖️ Programa de Fidelidad Enigma</Heading>

        <Text style={paragraph}>
          Como cliente valorado, te invitamos a unirte a nuestro programa de fidelidad:
        </Text>

        <Text style={loyaltyBenefits}>
          ⭐ <strong>Puntos por cada visita</strong> - Acumula y canjea<br/>
          🎂 <strong>Descuento especial</strong> en tu cumpleaños<br/>
          📧 <strong>Ofertas exclusivas</strong> solo para miembros<br/>
          🎫 <strong>Acceso prioritario</strong> a eventos especiales<br/>
          👨‍🍳 <strong>Experiencias gastronómicas</strong> únicas
        </Text>

        <Section style={buttonContainer}>
          <Button style={loyaltyButton} href={urls?.programaFidelidad || 'https://enigmaconalma.com/programa-fidelidad'}>
            Unirme al Programa
          </Button>
        </Section>
      </Section>

      {/* Next visit incentive */}
      <Section style={nextVisitBox}>
        <Heading as="h3" style={h3}>🎉 Tu Próxima Visita</Heading>

        <Text style={paragraph}>
          ¡Tenemos muchas novedades preparadas! Nuestro chef está trabajando en nuevas
          creaciones que seguro te van a encantar.
        </Text>

        <Text style={nextVisitOffer}>
          <strong>Oferta especial:</strong> Reserva en los próximos 30 días y obtén un
          <strong> aperitivo de cortesía</strong> 🥂
        </Text>

        <Section style={buttonContainer}>
          <Button style={reserveButton} href={urls?.reservas || 'https://enigmaconalma.com/reservas'}>
            Hacer Nueva Reserva
          </Button>
        </Section>
      </Section>

      {/* Personal thank you */}
      <Text style={personalThankYou}>
        {customerName}, gracias por elegir <strong>{restaurantName}</strong> para tu experiencia gastronómica.
        Cada cliente como tú hace que nuestro trabajo tenga sentido.<br/><br/>

        <em>Esperamos verte muy pronto de nuevo,<br/>
        Con cariño y gratitud,<br/>
        Todo el Equipo de Enigma Cocina Con Alma 👨‍🍳✨</em>
      </Text>

    </EmailBase>
  )
}

// Review-focused styles
const thankYouBanner = {
  backgroundColor: 'oklch(0.58 0.12 125)', // Success green
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 0 24px'
}

const bannerText = {
  color: 'oklch(0.975 0.008 125)', // Light text
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '0.05em'
}

const h1 = {
  color: 'oklch(0.45 0.15 200)', // --primary
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 20px',
  textAlign: 'center' as const
}

const h2 = {
  color: 'oklch(0.15 0.035 130)',
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
  textAlign: 'center' as const
}

const h3 = {
  color: 'oklch(0.15 0.035 130)',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '22px',
  margin: '0 0 12px'
}

const paragraph = {
  color: 'oklch(0.15 0.035 130)',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px'
}

const emphasizedText = {
  color: 'oklch(0.55 0.16 42)', // --accent
  fontSize: '18px',
  fontWeight: '500',
  lineHeight: '26px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  fontStyle: 'italic'
}

const feedbackBox = {
  backgroundColor: 'oklch(0.96 0.005 210)', // --muted
  border: '2px solid oklch(0.45 0.15 200)', // --primary
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const
}

const ratingContainer = {
  margin: '20px 0'
}

const ratingText = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px'
}

const starsRow = {
  margin: '12px 0'
}

const starColumn = {
  width: '20%',
  textAlign: 'center' as const,
  fontSize: '20px',
  padding: '8px 0'
}

const ratingSubtext = {
  fontSize: '12px',
  color: 'oklch(0.45 0.025 200)',
  margin: '8px 0 0'
}

const reviewsBox = {
  backgroundColor: 'oklch(0.92 0.02 120)', // --secondary
  border: '1px solid oklch(0.52 0.12 125)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const reviewPlatformsRow = {
  margin: '16px 0'
}

const reviewColumn = {
  width: '50%',
  textAlign: 'center' as const,
  padding: '0 8px'
}

const reviewBenefit = {
  backgroundColor: 'oklch(0.95 0.012 42)', // Light amber
  border: '1px solid oklch(0.55 0.16 42)',
  borderRadius: '6px',
  padding: '12px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
  fontSize: '15px'
}

const momentsBox = {
  backgroundColor: 'oklch(0.955 0.01 125)',
  border: '1px solid oklch(0.52 0.12 125)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const socialTags = {
  fontSize: '15px',
  lineHeight: '24px',
  margin: '12px 0 0'
}

const improvementBox = {
  backgroundColor: 'oklch(0.98 0.01 42)', // Very light amber
  border: '1px solid oklch(0.55 0.16 42)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const contactInfo = {
  fontSize: '15px',
  lineHeight: '22px',
  margin: '12px 0 0'
}

const loyaltyBox = {
  backgroundColor: 'oklch(0.945 0.015 200)', // Light blue
  border: '2px solid oklch(0.45 0.15 200)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const loyaltyBenefits = {
  fontSize: '15px',
  lineHeight: '24px',
  margin: '12px 0 16px'
}

const nextVisitBox = {
  backgroundColor: 'oklch(0.945 0.015 25)', // Light success
  border: '1px solid oklch(0.58 0.12 125)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const nextVisitOffer = {
  backgroundColor: 'oklch(0.58 0.12 125)',
  color: 'oklch(0.975 0.008 125)',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'center' as const,
  fontSize: '15px',
  fontWeight: '600',
  margin: '12px 0 16px'
}

const personalThankYou = {
  color: 'oklch(0.15 0.035 130)',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '32px 0 0',
  padding: '24px',
  backgroundColor: 'oklch(0.96 0.005 210)',
  borderRadius: '8px',
  borderLeft: '4px solid oklch(0.55 0.16 42)'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0'
}

const feedbackButton = {
  backgroundColor: 'oklch(0.45 0.15 200)',
  borderRadius: '8px',
  color: 'oklch(0.985 0.002 210)',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '0 8px'
}

const googleButton = {
  backgroundColor: '#4285f4',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  width: '90%'
}

const tripadvisorButton = {
  backgroundColor: '#00af87',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  width: '90%'
}

const loyaltyButton = {
  backgroundColor: 'oklch(0.52 0.12 125)',
  borderRadius: '8px',
  color: 'oklch(0.975 0.008 125)',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px'
}

const reserveButton = {
  backgroundColor: 'oklch(0.55 0.16 42)',
  borderRadius: '8px',
  color: 'oklch(0.98 0.01 42)',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px'
}

export default ReservationReviewEmail