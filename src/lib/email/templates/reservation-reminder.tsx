// Reservation Reminder Email Template (12h before reservation)
// CRITICAL: ALL content DYNAMIC - sent 12 hours before reservation time
// Focus: Last chance to modify, directions, preparation info

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
import { formatCurrency } from '../utils/emailValidation'

// Helper function to format table info properly
const formatTableInfo = (tableNumber: string, tableLocation: string) => {
  if (!tableNumber || tableNumber === 'Por asignar') {
    return 'Mesa asignada'
  }

  const locationLabels = {
    'TERRACE_CAMPANARI': 'Terraza Campanari',
    'SALA_VIP': 'Sala VIP',
    'TERRACE_JUSTICIA': 'Terraza Justicia',
    'SALA_PRINCIPAL': 'Sala Principal'
  }

  const locationName = locationLabels[tableLocation as keyof typeof locationLabels] || tableLocation
  return `Mesa ${tableNumber} - ${locationName}`
}

export interface ReservationReminderEmailProps extends EmailTemplateData {}

export const ReservationReminderEmail = ({
  customerName,
  reservationId,
  reservationDate,
  reservationTime,
  partySize,
  tableLocation,
  tableNumber,
  specialRequests,
  tokenUrl,
  preOrderItems = [],
  preOrderTotal = 0,
  restaurantName,
  restaurantEmail,
  restaurantPhone
}: ReservationReminderEmailProps) => {
  const preview = `Recordatorio: Tu reserva en ${restaurantName} es mañana a las ${reservationTime}`

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
      restaurantEmail={restaurantEmail}
      restaurantPhone={restaurantPhone}
    >
      {/* Reminder Header */}
      <Section style={reminderBanner}>
        <Text style={bannerText}>⏰ RECORDATORIO DE RESERVA</Text>
      </Section>

      <Heading style={h1}>
        ¡Hola {customerName}!
      </Heading>

      <Text style={paragraph}>
        Te escribimos para recordarte que tu reserva en <strong>{restaurantName}</strong> es
        <strong> mañana {reservationDate} a las {reservationTime}</strong>.
      </Text>

      <Text style={emphasizedText}>
        ¡Estamos emocionados de recibirte y ofrecerte una experiencia gastronómica inolvidable! 🍽️✨
      </Text>

      {/* Quick Details Reminder */}
      <Section style={quickDetailsBox}>
        <Row>
          <Column style={quickDetailColumn}>
            <Text style={quickDetailLabel}>📅</Text>
            <Text style={quickDetailValue}>
              {reservationDate}<br/>
              <strong>{reservationTime}</strong>
            </Text>
          </Column>
          <Column style={quickDetailColumn}>
            <Text style={quickDetailLabel}>👥</Text>
            <Text style={quickDetailValue}>
              {partySize}<br/>
              <strong>comensales</strong>
            </Text>
          </Column>
          <Column style={quickDetailColumn}>
            <Text style={quickDetailLabel}>Mesa</Text>
            <Text style={quickDetailValue}>
              <strong>{formatTableInfo(tableNumber, tableLocation)}</strong>
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Pre-order Reminder */}
      {preOrderItems.length > 0 && (
        <Section style={preOrderReminderBox}>
          <Heading as="h3" style={h3}>🍽️ Tu Pre-pedido Confirmado</Heading>
          <Text style={paragraph}>
            Hemos preparado tu selección especial:
          </Text>

          {preOrderItems.slice(0, 3).map((item) => (
            <Text key={item.id} style={preOrderItem}>
              • <strong>{item.quantity}x {item.name}</strong>
              {item.notes && ` (${item.notes})`}
            </Text>
          ))}

          {preOrderItems.length > 3 && (
            <Text style={preOrderMore}>
              ... y {preOrderItems.length - 3} platos más
            </Text>
          )}

          <Text style={preOrderTotal}>
            <strong>Total pre-pedido: {formatCurrency(preOrderTotal)}</strong>
          </Text>
        </Section>
      )}

      {/* Last Minute Changes */}
      <Section style={changesBox}>
        <Heading as="h3" style={h3}>🔄 ¿Necesitas hacer cambios?</Heading>
        <Text style={paragraph}>
          <strong>¡Última oportunidad!</strong> Si necesitas modificar tu reserva, hazlo antes de las
          <strong> {new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong> (2 horas antes de tu reserva).
        </Text>

        {tokenUrl && (
          <Section style={buttonContainer}>
            <Button style={changeButton} href={tokenUrl}>
              Modificar mi Reserva
            </Button>
          </Section>
        )}
      </Section>

      {/* Important Reminders */}
      <Section style={importantBox}>
        <Heading as="h3" style={h3}>📋 Información Importante</Heading>

        <Text style={reminderItem}>
          🕐 <strong>Llegada puntual:</strong> Por favor llega 10-15 minutos antes para garantizar tu mesa
        </Text>

        <Text style={reminderItem}>
          🚗 <strong>Aparcamiento:</strong> Disponemos de aparcamiento limitado. Te recomendamos llegar en transporte público
        </Text>

        <Text style={reminderItem}>
          🍷 <strong>Alergias e intolerancias:</strong> Informa a nuestro personal sobre cualquier alergia al llegar
        </Text>

        <Text style={reminderItem}>
          📱 <strong>Código de reserva:</strong> Guarda este número: <strong>{reservationId}</strong>
        </Text>

        {specialRequests && (
          <Text style={reminderItem}>
            📝 <strong>Tus solicitudes especiales:</strong> {specialRequests}
          </Text>
        )}
      </Section>

      {/* Directions */}
      <Section style={directionsBox}>
        <Heading as="h3" style={h3}>🗺️ Cómo Llegar</Heading>
        <Text style={paragraph}>
          <strong>{restaurantName}</strong><br/>
          Calle Example, 123<br/>
          28001 Madrid, España<br/><br/>

          🚇 <strong>Metro:</strong> Estación Sol (Líneas 1, 2, 3) - 5 min caminando<br/>
          🚌 <strong>Autobús:</strong> Líneas 5, 15, 20, 51, 52, 150<br/>
          🚗 <strong>Coche:</strong> Parking público en Plaza Mayor (10 min caminando)
        </Text>

        <Section style={buttonContainer}>
          <Button style={directionsButton} href="https://maps.google.com/?q=enigma+cocina+con+alma+madrid">
            Ver Direcciones en Google Maps
          </Button>
        </Section>
      </Section>

      {/* Weather/Special Day Info */}
      <Section style={weatherBox}>
        <Text style={weatherText}>
          ☀️ <strong>Consejo del día:</strong> Mañana se espera una temperatura agradable.
          Si tienes mesa en nuestra terraza, ¡será perfecto para disfrutar al aire libre!
        </Text>
      </Section>

      {/* Emergency Contact */}
      <Section style={contactBox}>
        <Heading as="h3" style={h3}>📞 ¿Alguna Duda de Último Momento?</Heading>
        <Text style={paragraph}>
          Si tienes cualquier pregunta o imprevisto, contáctanos inmediatamente:
        </Text>

        <Text style={contactInfo}>
          📱 <strong>WhatsApp:</strong> {restaurantPhone}<br/>
          ☎️ <strong>Teléfono directo:</strong> {restaurantPhone}<br/>
          ✉️ <strong>Email:</strong> {restaurantEmail}
        </Text>
      </Section>

      <Text style={closingText}>
        ¡Estamos deseando recibirte mañana en {restaurantName}!<br/>
        Nuestro equipo está preparando todo con mucho cariño para ti.<br/><br/>

        <em>¡Hasta muy pronto! 🌟<br/>
        El Equipo de Enigma Cocina Con Alma</em>
      </Text>
    </EmailBase>
  )
}

// Reminder-specific styles
const reminderBanner = {
  backgroundColor: 'oklch(0.55 0.16 42)', // --accent (burnt orange)
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '0 0 24px'
}

const bannerText = {
  color: 'oklch(0.98 0.01 42)', // White text
  fontSize: '16px',
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
  fontWeight: '600',
  lineHeight: '26px',
  margin: '0 0 24px',
  textAlign: 'center' as const
}

const quickDetailsBox = {
  backgroundColor: 'oklch(0.96 0.005 210)', // --muted
  border: '2px solid oklch(0.45 0.15 200)', // --primary
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0'
}

const quickDetailColumn = {
  width: '33.33%',
  textAlign: 'center' as const,
  padding: '0 8px'
}

const quickDetailLabel = {
  fontSize: '24px',
  margin: '0 0 8px'
}

const quickDetailValue = {
  fontSize: '14px',
  color: 'oklch(0.15 0.035 130)',
  margin: '0'
}

const preOrderReminderBox = {
  backgroundColor: 'oklch(0.92 0.02 120)', // --secondary (light sage)
  border: '1px solid oklch(0.52 0.12 125)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const preOrderItem = {
  fontSize: '14px',
  margin: '0 0 8px',
  lineHeight: '20px'
}

const preOrderMore = {
  fontSize: '14px',
  fontStyle: 'italic',
  color: 'oklch(0.45 0.025 200)',
  margin: '8px 0'
}

const preOrderTotal = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '12px 0 0',
  padding: '12px 0 0',
  borderTop: '1px solid oklch(0.52 0.12 125)'
}

const changesBox = {
  backgroundColor: 'oklch(0.95 0.012 42)', // Light amber warning
  border: '2px solid oklch(0.55 0.16 42)', // --accent
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const importantBox = {
  backgroundColor: 'oklch(0.955 0.01 125)', // Light sage
  border: '1px solid oklch(0.52 0.12 125)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const reminderItem = {
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 12px'
}

const directionsBox = {
  backgroundColor: 'oklch(0.96 0.005 210)', // --muted
  border: '1px solid oklch(0.45 0.15 200)', // --primary
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const weatherBox = {
  backgroundColor: 'oklch(0.98 0.01 42)', // Very light amber
  border: '1px solid oklch(0.55 0.16 42)',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const
}

const weatherText = {
  color: 'oklch(0.18 0.04 35)',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0'
}

const contactBox = {
  backgroundColor: 'oklch(0.945 0.015 25)', // Light destructive
  border: '1px solid oklch(0.55 0.22 25)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0'
}

const contactInfo = {
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '24px',
  margin: '12px 0 0'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '16px 0'
}

const changeButton = {
  backgroundColor: 'oklch(0.55 0.16 42)', // --accent
  borderRadius: '8px',
  color: 'oklch(0.98 0.01 42)',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px'
}

const directionsButton = {
  backgroundColor: 'oklch(0.45 0.15 200)', // --primary
  borderRadius: '8px',
  color: 'oklch(0.985 0.002 210)',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px'
}

const closingText = {
  color: 'oklch(0.15 0.035 130)',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '32px 0 0'
}

export default ReservationReminderEmail