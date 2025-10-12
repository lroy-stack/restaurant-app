// Reservation Cancelled Email Template - SIMPLIFICADO
// Solo información dinámica esencial, sin hardcodear datos falsos

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
import { emailColors, emailTextStyles, emailLayoutStyles } from '../styles/emailColors'

export interface ReservationCancelledEmailProps extends EmailTemplateData {
  cancellationReason?: string
  restaurantMessage?: string
  refundAmount?: number
  refundMethod?: string
}

export const ReservationCancelledEmail = ({
  customerName,
  reservationId,
  reservationDate,
  reservationTime,
  partySize,
  specialRequests,
  cancellationReason,
  restaurantMessage,
  refundAmount,
  refundMethod,
  restaurantName,
  restaurantEmail,
  restaurantPhone,
  urls
}: ReservationCancelledEmailProps) => {
  const preview = `Tu reserva en ${restaurantName} para el ${reservationDate} ha sido cancelada`

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
      restaurantEmail={restaurantEmail}
      restaurantPhone={restaurantPhone}
    >
      {/* Header simple */}
      <Section style={cancellationBanner}>
        <Text style={bannerText}>Reserva Cancelada</Text>
      </Section>

      <Heading style={emailTextStyles.h1}>
        Hola {customerName}
      </Heading>

      <Text style={emailTextStyles.paragraph}>
        Confirmamos que tu reserva en <strong>{restaurantName}</strong> ha sido cancelada.
      </Text>

      {/* Detalles básicos de la reserva cancelada */}
      <Section style={emailLayoutStyles.detailsBox}>
        <Heading as="h2" style={emailTextStyles.h2}>Detalles de la Reserva Cancelada</Heading>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Fecha:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{reservationDate}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={{width: '40%'}}>
            <Text style={detailLabel}>Hora:</Text>
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
            <Text style={detailLabel}>Código:</Text>
          </Column>
          <Column style={{width: '60%'}}>
            <Text style={detailValue}>{reservationId}</Text>
          </Column>
        </Row>

        {cancellationReason && (
          <Row style={detailRow}>
            <Column style={{width: '40%'}}>
              <Text style={detailLabel}>Motivo:</Text>
            </Column>
            <Column style={{width: '60%'}}>
              <Text style={detailValue}>{cancellationReason}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Información de reembolso SOLO si existe */}
      {refundAmount && refundAmount > 0 && (
        <Section style={refundBox}>
          <Heading as="h3" style={emailTextStyles.h3}>Información de Reembolso</Heading>
          <Text style={emailTextStyles.paragraph}>
            <strong>Cantidad:</strong> €{refundAmount.toFixed(2)}<br/>
            {refundMethod && <><strong>Método:</strong> {refundMethod}<br/></>}
            <strong>Plazo:</strong> 5-7 días laborables
          </Text>
        </Section>
      )}

      {/* Botón simple para nueva reserva */}
      <Section style={buttonContainer}>
        <Button style={emailLayoutStyles.buttonPrimary} href={urls?.reservas || 'https://almaenigma.vercel.app/reservas'}>
          Hacer Nueva Reserva
        </Button>
      </Section>

      {/* Mensaje de cierre simple */}
      <Text style={emailTextStyles.paragraph}>
        Esperamos poder recibirte pronto en {restaurantName}.
      </Text>

      {/* Mensaje especial del restaurante */}
      {restaurantMessage && (
        <Section style={specialMessageBox}>
          <Heading as="h3" style={specialMessageTitle}>Mensaje de {restaurantName}</Heading>
          <Text style={specialMessageContent}>{restaurantMessage}</Text>
        </Section>
      )}

      <Text style={contactText}>
        Si tienes alguna pregunta, puedes contactarnos:<br/>
        📧 {restaurantEmail}<br/>
        📱 {restaurantPhone}
      </Text>
    </EmailBase>
  )
}

// Estilos simplificados usando colores Enigma reales
const cancellationBanner = {
  backgroundColor: emailColors.mutedForeground,
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '0 0 24px'
}

const bannerText = {
  color: emailColors.primaryForeground,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif'
}

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

const refundBox = {
  backgroundColor: emailColors.secondary,
  border: `2px solid ${emailColors.secondaryBorder}`,
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const contactText = {
  color: emailColors.mutedForeground,
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
  fontFamily: 'Inter, system-ui, sans-serif',
  textAlign: 'center' as const
}

const specialMessageBox = {
  backgroundColor: '#fef5f0', // Light orange background for message box
  border: `2px solid ${emailColors.accent}`,
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0'
}

const specialMessageTitle = {
  color: emailColors.accent,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const specialMessageContent = {
  color: emailColors.foreground,
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontStyle: 'italic' as const
}

export default ReservationCancelledEmail