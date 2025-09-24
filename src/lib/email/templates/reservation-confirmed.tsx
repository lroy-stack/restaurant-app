// Reservation Confirmed Email Template (Admin confirms reservation)
// CRITICAL: ALL content DYNAMIC via props - different from confirmation template
// This is sent when admin changes status to CONFIRMED

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
import { formatCurrency } from '../utils/emailValidation'
import { emailColors, emailTextStyles, emailLayoutStyles } from '../styles/emailColors'

// FIXED: Helper function to format table info properly - SHOWS REAL TABLE DATA
const formatTableInfo = (tableNumber: string, tableLocation: string) => {
  // CRITICAL FIX: Only show "Por asignar" if BOTH are missing/null
  if (!tableNumber && !tableLocation) {
    return 'Mesa por asignar'
  }

  const locationLabels = {
    'TERRACE_CAMPANARI': 'Terraza Campanari',
    'SALA_VIP': 'Sala VIP',
    'TERRACE_JUSTICIA': 'Terraza Justicia',
    'SALA_PRINCIPAL': 'Sala Principal'
  }

  const locationName = locationLabels[tableLocation as keyof typeof locationLabels] || tableLocation
  return tableNumber ? `Mesa ${tableNumber} - ${locationName}` : `${locationName} (mesa por confirmar)`
}

export interface ReservationConfirmedEmailProps extends EmailTemplateData {}

export const ReservationConfirmedEmail = ({
  customerName,
  customerEmail,
  reservationId,
  reservationDate,
  reservationTime,
  partySize,
  tableLocation,
  tableNumber,
  specialRequests,
  preOrderItems = [],
  preOrderTotal = 0,
  tokenUrl,
  restaurantName,
  restaurantEmail,
  restaurantPhone,
  urls,
  branding
}: ReservationConfirmedEmailProps) => {
  const preview = `¡Tu reserva para ${partySize} persona${partySize > 1 ? 's' : ''} el ${reservationDate} ha sido CONFIRMADA!`

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
      restaurantEmail={restaurantEmail}
      restaurantPhone={restaurantPhone}
    >
      {/* Modern Confirmation Banner */}
      <Container style={confirmationBanner}>
        <Text style={bannerText}>RESERVA CONFIRMADA</Text>
        <Text style={bannerSubtext}>Tu mesa está preparada</Text>
      </Container>

      <Section style={greetingSection}>
        <Heading style={h1}>
          Hola {customerName}
        </Heading>

        <Text style={leadText}>
          Excelentes noticias. Tu reserva en <strong>{restaurantName}</strong> ha sido oficialmente confirmada por nuestro equipo.
        </Text>
      </Section>

      {/* Confirmed Details */}
      <Section style={detailsBox}>
        <Heading as="h2" style={h2}>Detalles Confirmados</Heading>

        <Row style={detailRow}>
          <Column style={detailColumn}>
            <Text style={detailLabel}>Fecha confirmada:</Text>
            <Text style={detailValue}>{reservationDate}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailColumn}>
            <Text style={detailLabel}>Hora confirmada:</Text>
            <Text style={detailValue}>{reservationTime}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailColumn}>
            <Text style={detailLabel}>Comensales:</Text>
            <Text style={detailValue}>{partySize} persona{partySize > 1 ? 's' : ''}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailColumn}>
            <Text style={detailLabel}>Tu mesa:</Text>
            <Text style={detailValue}>
              {formatTableInfo(tableNumber, tableLocation)}
            </Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailColumn}>
            <Text style={detailLabel}>Código de reserva:</Text>
            <Text style={detailValue}>{reservationId}</Text>
          </Column>
        </Row>

        {specialRequests && (
          <Row style={detailRow}>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Notas especiales:</Text>
              <Text style={detailValue}>{specialRequests}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Pre-order Items - Using existing pattern from reservation-confirmation */}
      {preOrderItems.length > 0 && (
        <Section style={preOrderBox}>
          <Row>
            <Column>
              <Heading as="h2" style={h2}>Tu Pre-pedido Confirmado</Heading>
              <Text style={preOrderNote}>
                Estos platos están garantizados para tu mesa:
              </Text>
            </Column>
          </Row>

          {preOrderItems.map((item, index) => (
            <Row key={item.id} style={preOrderRow}>
              <Column style={{width: '70%', verticalAlign: 'top'}}>
                <Text style={itemName}>
                  {item.quantity}x {item.name}
                </Text>
                {item.notes && (
                  <Text style={itemNotes}>Nota: {item.notes}</Text>
                )}
              </Column>
              <Column style={{width: '30%', textAlign: 'right', verticalAlign: 'top'}}>
                <Text style={itemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </Column>
            </Row>
          ))}

          <Row style={totalRow}>
            <Column style={{textAlign: 'right'}}>
              <Text style={totalText}>
                <strong>Total confirmado: {formatCurrency(preOrderTotal)}</strong>
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      {/* Next Steps */}
      <Container style={nextStepsBox}>
        <Heading as="h3" style={h3}>Qué sigue ahora</Heading>
        <Text style={stepText}>
          <strong>Todo está listo.</strong> Solo necesitas presentarte el día y hora confirmados.
        </Text>
        <Text style={stepText}>
          <strong>Recomendación:</strong> Guarda este email o añade la cita a tu calendario.
        </Text>
        <Text style={stepText}>
          <strong>Llegada:</strong> Te recomendamos llegar 10 minutos antes para garantizar la mejor experiencia.
        </Text>
      </Container>

      {/* Special Message */}
      <Container style={specialBox}>
        <Text style={specialText}>
          Nuestro equipo está preparando algo especial para ti. Esperamos que disfrutes de una experiencia gastronómica única.
        </Text>
      </Container>

      {/* Action Buttons */}
      <Section style={buttonContainer}>
        {tokenUrl && (
          <Button style={primaryButton} href={tokenUrl}>
            Gestionar Reserva
          </Button>
        )}

        <Button style={secondaryButton} href={urls?.menu || 'https://enigmaconalma.com/menu'}>
          Ver Nuestra Carta
        </Button>
      </Section>

      {/* Closing */}
      <Text style={closingText}>
        ¡Gracias por elegir {restaurantName}!<br/>
        Nos vemos muy pronto.
      </Text>
    </EmailBase>
  )
}

// ENIGMA BRAND STYLES - Using REAL Enigma colors from manual
const confirmationBanner = {
  backgroundColor: emailColors.primary, // #237584 TEAL REAL de Enigma
  borderRadius: '12px',
  padding: '24px 32px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  border: `2px solid ${emailColors.primaryDarker}`,
  backgroundImage: `linear-gradient(135deg, ${emailColors.primary} 0%, ${emailColors.primaryDarker} 100%)`
}

const bannerText = {
  color: emailColors.primaryForeground, // Blanco sobre teal Enigma
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 6px',
  letterSpacing: '0.1em',
  fontFamily: 'Benaya, Georgia, serif', // BRAND FONT
  textShadow: '0 2px 6px rgba(0,0,0,0.15)'
}

const bannerSubtext = {
  color: emailColors.primaryForeground, // Blanco sobre teal Enigma
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  opacity: 0.95,
  fontFamily: 'Playfair Display, Georgia, serif', // BRAND FONT
  letterSpacing: '0.02em'
}

const greetingSection = {
  textAlign: 'center' as const,
  margin: '0 0 32px'
}

// Usar estilos centralizados de emailTextStyles con colores Enigma reales
const h1 = emailTextStyles.h1
const h2 = emailTextStyles.h2
const h3 = emailTextStyles.h3
const paragraph = emailTextStyles.paragraph

const leadText = {
  color: emailColors.foreground, // Color texto Enigma real
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0',
  fontWeight: '400',
  textAlign: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif'
}

// Usar estilo centralizado con colores Enigma reales
const detailsBox = emailLayoutStyles.detailsBox

const detailRow = {
  margin: '0 0 12px'
}

const detailColumn = {
  width: '100%'
}

const detailLabel = {
  color: emailColors.mutedForeground, // Color muted Enigma real
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const detailValue = {
  color: emailColors.foreground, // Color texto Enigma real
  fontSize: '17px',
  fontWeight: '600',
  margin: '0 0 16px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const nextStepsBox = {
  backgroundColor: emailColors.secondary, // Sage claro Enigma
  border: `2px solid ${emailColors.secondaryBorder}`, // Sage border Enigma
  borderRadius: '12px',
  padding: '28px',
  margin: '32px 0',
  boxShadow: '0 2px 12px rgba(82, 125, 98, 0.12)'
}

const stepText = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
  fontFamily: 'Inter, system-ui, sans-serif' // BRAND FONT
}

const specialBox = {
  backgroundColor: emailColors.accentLight, // Naranja claro Enigma
  border: `2px solid ${emailColors.accent}`, // Border naranja Enigma
  borderRadius: '12px',
  padding: '28px',
  margin: '32px 0',
  textAlign: 'center' as const,
  boxShadow: '0 2px 12px rgba(153, 102, 51, 0.12)'
}

const specialText = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '17px',
  fontStyle: 'italic',
  lineHeight: '26px',
  margin: '0',
  fontWeight: '500',
  fontFamily: 'Crimson Text, Georgia, serif' // BRAND FONT for elegant notes
}


const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const primaryButton = {
  backgroundColor: emailColors.primary, // Teal Enigma real
  borderRadius: '12px', // Match design system
  color: emailColors.primaryForeground, // Blanco sobre teal
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '0 12px 12px',
  padding: '16px 32px',
  fontFamily: 'Inter, system-ui, sans-serif', // BRAND FONT
  letterSpacing: '0.02em',
  boxShadow: '0 4px 16px rgba(114, 152, 204, 0.3)' // Atlantic blue shadow
}

const secondaryButton = {
  backgroundColor: emailColors.white, // Blanco
  border: `2px solid ${emailColors.primary}`, // Border teal Enigma
  borderRadius: '12px',
  color: emailColors.primary, // Teal Enigma
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '0 12px 12px',
  padding: '16px 32px',
  fontFamily: 'Inter, system-ui, sans-serif', // BRAND FONT
  letterSpacing: '0.02em',
  boxShadow: '0 2px 8px rgba(114, 152, 204, 0.2)'
}

const closingText = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '17px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '40px 0 0',
  fontWeight: '400',
  fontFamily: 'Inter, system-ui, sans-serif' // BRAND FONT
}

// Pre-order section styles - Following existing patterns
const preOrderBox = {
  backgroundColor: emailColors.muted, // Fondo muted Enigma
  border: `2px solid ${emailColors.accent}`, // Border naranja Enigma
  borderRadius: '12px',
  padding: '32px',
  margin: '32px 0',
  boxShadow: '0 4px 16px rgba(153, 102, 51, 0.08)'
}

const preOrderNote = {
  color: emailColors.mutedForeground, // Texto muted Enigma
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 20px',
  fontStyle: 'italic',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const preOrderRow = {
  margin: '0 0 16px',
  borderBottom: `1px solid ${emailColors.border}`,
  paddingBottom: '12px'
}

const itemName = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const itemNotes = {
  color: emailColors.mutedForeground, // Texto muted Enigma
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const itemPrice = {
  color: emailColors.accent, // Naranja Enigma
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const totalRow = {
  margin: '20px 0 0',
  paddingTop: '16px',
  borderTop: `2px solid ${emailColors.accent}` // Border naranja Enigma
}

const totalText = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif'
}

export default ReservationConfirmedEmail