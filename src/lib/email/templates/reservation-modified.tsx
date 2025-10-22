// Reservation Modified Email Template (Customer modifies reservation)
// CRITICAL: ALL content DYNAMIC via props - sent when customer modifies their reservation
// Following PRP pattern + Badezeit structure + Enigma branding

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
    'TERRACE_1': 'Terraza 1',
    'VIP_ROOM': 'Sala VIP',
    'TERRACE_2': 'Terraza 2',
    'MAIN_ROOM': 'Sala Principal'
  }

  const locationName = locationLabels[tableLocation as keyof typeof locationLabels] || tableLocation
  return tableNumber ? `Mesa ${tableNumber} - ${locationName}` : `${locationName} (mesa por confirmar)`
}

export interface ReservationModifiedEmailProps extends EmailTemplateData {}

export const ReservationModifiedEmail = ({
  customerName,
  customerEmail,
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
  restaurantPhone,
  reservationStatus,
  urls,
  branding
}: ReservationModifiedEmailProps) => {
  const preview = `Hemos recibido tu modificación de reserva para ${partySize} persona${partySize > 1 ? 's' : ''} el ${reservationDate}`

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
      restaurantEmail={restaurantEmail}
      restaurantPhone={restaurantPhone}
      branding={branding}
    >
      {/* Modern Modification Banner */}
      <Container style={modificationBanner}>
        <Text style={bannerText}>RESERVA MODIFICADA</Text>
        <Text style={bannerSubtext}>Pendiente de confirmación</Text>
      </Container>

      {/* Greeting - DYNAMIC customer name */}
      <Heading style={h1}>
        Hola {customerName}
      </Heading>

      <Text style={leadText}>
        Hemos recibido las modificaciones a tu reserva en <strong>{restaurantName}</strong>.
        Nuestro equipo las revisará y te confirmaremos la nueva disponibilidad pronto.
      </Text>

      {/* IMPROVED: Modified Details Box - Responsive layout with Row/Column */}
      <Section style={detailsBox}>
        <Row>
          <Column>
            <Heading as="h2" style={h2}>Nuevos Detalles de tu Reserva</Heading>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Nueva fecha:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{reservationDate}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Nueva hora:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{reservationTime}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Comensales:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{partySize} persona{partySize > 1 ? 's' : ''}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Mesa solicitada:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{formatTableInfo(tableNumber, tableLocation)}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Código reserva:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{reservationId}</Text>
          </Column>
        </Row>

        {specialRequests && (
          <Row style={detailRow}>
            <Column style={{width: '40%'}}>
              <Text style={detailLabel}>Solicitudes especiales:</Text>
            </Column>
            <Column style={{width: '60%'}}>
              <Text style={detailValue}>{specialRequests}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* IMPROVED: Pre-order Items - Better responsive layout */}
      {preOrderItems.length > 0 && (
        <Section style={preOrderBox}>
          <Row>
            <Column>
              <Heading as="h2" style={h2}>Tu Pre-pedido Modificado</Heading>
              <Text style={preOrderNote}>
                Estos son los platos actualizados en tu pre-pedido:
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
                <strong>Total del pre-pedido: {formatCurrency(preOrderTotal)}</strong>
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      {/* Status Information */}
      <Container style={statusBox}>
        <Heading as="h3" style={h3}>Estado de tu Modificación</Heading>
        <Text style={statusText}>
          <strong>Actual:</strong> Tu reserva está marcada como <em>pendiente de confirmación</em> debido a los cambios realizados.
        </Text>
        <Text style={statusText}>
          <strong>Próximos pasos:</strong> Nuestro equipo revisará la disponibilidad de la nueva fecha/hora y te confirmaremos en las próximas horas.
        </Text>
        <Text style={statusText}>
          <strong>Importante:</strong> Recibirás un nuevo email de confirmación cuando aprobemos los cambios.
        </Text>
      </Container>

      {/* Important Information */}
      <Section style={infoBox}>
        <Heading as="h3" style={h3}>¿Qué sigue ahora?</Heading>
        <Text style={paragraph}>
          • <strong>Revisión:</strong> Verificaremos la disponibilidad de tu nueva fecha y hora<br/>
          • <strong>Confirmación:</strong> Te enviaremos un email cuando confirmemos los cambios<br/>
          • <strong>Nuevo token:</strong> Recibirás un nuevo enlace de gestión una vez confirmado<br/>
          • <strong>Contacto:</strong> Si tienes dudas urgentes, llámanos directamente
        </Text>
      </Section>

      {/* IMPROVED: Action Buttons - Better responsive layout */}
      <Section style={buttonContainer}>
        <Row>
          <Column style={{textAlign: 'center'}}>
            {tokenUrl && (
              <Button style={primaryButton} href={tokenUrl}>
                Gestionar mi Reserva
              </Button>
            )}
          </Column>
        </Row>

        <Row>
          <Column style={{textAlign: 'center'}}>
            <Button style={secondaryButton} href={urls?.menu || 'https://almaenigma.vercel.app/menu'}>
              Ver Nuestra Carta
            </Button>
          </Column>
        </Row>
      </Section>

      {/* Closing */}
      <Text style={closingText}>
        Gracias por actualizar tu reserva con {restaurantName}. Te contactaremos pronto con la confirmación de los cambios.
      </Text>
    </EmailBase>
  )
}

// ENIGMA BRAND STYLES - Using REAL Enigma colors from design system
const modificationBanner = {
  backgroundColor: emailColors.accent, // Naranja Enigma para modificaciones
  borderRadius: '12px',
  padding: '24px 32px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  border: `2px solid ${emailColors.accentDarker}`,
  backgroundImage: `linear-gradient(135deg, ${emailColors.accent} 0%, ${emailColors.accentDarker} 100%)`
}

const bannerText = {
  color: emailColors.accentForeground, // Blanco sobre naranja Enigma
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 6px',
  letterSpacing: '0.1em',
  fontFamily: 'Benaya, Georgia, serif', // BRAND FONT
  textShadow: '0 2px 6px rgba(0,0,0,0.15)'
}

const bannerSubtext = {
  color: emailColors.accentForeground, // Blanco sobre naranja Enigma
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  opacity: 0.95,
  fontFamily: 'Playfair Display, Georgia, serif', // BRAND FONT
  letterSpacing: '0.02em'
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
  margin: '0 0 32px',
  fontWeight: '400',
  textAlign: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif'
}

// Usar estilo centralizado con colores Enigma reales
const detailsBox = emailLayoutStyles.detailsBox

const detailRow = {
  margin: '0 0 12px'
}

const detailLabel = {
  color: emailColors.mutedForeground,
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 6px',
  fontFamily: 'Inter, system-ui, sans-serif',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em'
}

const detailValue = {
  color: emailColors.foreground,
  fontSize: '17px',
  fontWeight: '600',
  margin: '0 0 16px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const statusBox = {
  backgroundColor: emailColors.secondary, // Sage claro Enigma
  border: `2px solid ${emailColors.accent}`, // Border naranja para modificaciones
  borderRadius: '12px',
  padding: '28px',
  margin: '32px 0',
  boxShadow: '0 2px 12px rgba(153, 102, 51, 0.12)'
}

const statusText = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const preOrderBox = emailLayoutStyles.preOrderBox

const preOrderNote = {
  color: emailColors.mutedForeground,
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 20px',
  fontStyle: 'italic',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const preOrderRow = {
  borderBottom: `1px solid ${emailColors.border}`,
  padding: '8px 0'
}

const itemName = {
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif',
  color: emailColors.foreground
}

const itemNotes = {
  fontSize: '13px',
  color: emailColors.mutedForeground,
  margin: '6px 0 0',
  fontStyle: 'italic',
  fontFamily: 'Crimson Text, Georgia, serif'
}

const itemPrice = {
  fontSize: '15px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'right' as const,
  fontFamily: 'Inter, system-ui, sans-serif',
  color: emailColors.foreground
}

const totalRow = {
  borderTop: `2px solid ${emailColors.secondaryBorder}`,
  padding: '12px 0 0',
  margin: '12px 0 0'
}

const totalText = {
  fontSize: '18px',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif',
  color: emailColors.foreground
}

const infoBox = emailLayoutStyles.infoBox

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const primaryButton = emailLayoutStyles.buttonPrimary

const secondaryButton = emailLayoutStyles.buttonSecondary

const closingText = {
  color: emailColors.foreground, // Color texto Enigma
  fontSize: '17px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '40px 0 0',
  fontWeight: '400',
  fontFamily: 'Inter, system-ui, sans-serif'
}

export default ReservationModifiedEmail