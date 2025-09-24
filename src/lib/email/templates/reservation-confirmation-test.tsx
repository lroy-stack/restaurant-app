// MINIMAL TEST VERSION - Verificar funcionamiento básico
import {
  Section,
  Heading,
  Text,
  Button
} from '@react-email/components'
import * as React from 'react'
import { EmailBase } from './email-base'
import { EmailTemplateData } from '../types/emailTypes'

export interface ReservationConfirmationTestProps extends EmailTemplateData {}

export const ReservationConfirmationTestEmail = (props: ReservationConfirmationTestProps) => {
  const {
    customerName,
    reservationDate,
    reservationTime,
    partySize,
    tableLocation,
    tableNumber,
    reservationId,
    tokenUrl,
    restaurantName
  } = props

  const preview = `Reserva recibida para ${partySize} persona${partySize > 1 ? 's' : ''} el ${reservationDate}`

  // SIMPLIFIED formatTableInfo
  const tableInfo = tableNumber && tableLocation
    ? `Mesa ${tableNumber} - ${tableLocation === 'TERRACE_CAMPANARI' ? 'Terraza Campanari' : tableLocation}`
    : 'Mesa por asignar'

  return (
    <EmailBase
      preview={preview}
      restaurantName={restaurantName}
    >
      <Heading style={{color: '#0066cc', fontSize: '24px', textAlign: 'center'}}>
        ¡Gracias, {customerName}!
      </Heading>

      <Text style={{fontSize: '16px', lineHeight: '24px'}}>
        Hemos recibido tu solicitud de reserva para <strong>{restaurantName}</strong>.
      </Text>

      <Section style={{backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', margin: '20px 0'}}>
        <Text style={{margin: '8px 0'}}><strong>Fecha:</strong> {reservationDate}</Text>
        <Text style={{margin: '8px 0'}}><strong>Hora:</strong> {reservationTime}</Text>
        <Text style={{margin: '8px 0'}}><strong>Comensales:</strong> {partySize}</Text>
        <Text style={{margin: '8px 0'}}><strong>Mesa:</strong> {tableInfo}</Text>
        <Text style={{margin: '8px 0'}}><strong>Código:</strong> {reservationId}</Text>
      </Section>

      {tokenUrl && (
        <Section style={{textAlign: 'center', margin: '24px 0'}}>
          <Button
            href={tokenUrl}
            style={{
              backgroundColor: '#0066cc',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            Gestionar mi Reserva
          </Button>
        </Section>
      )}

      <Text>
        Gracias por confiar en {restaurantName}. Te contactaremos pronto.
      </Text>
    </EmailBase>
  )
}

export default ReservationConfirmationTestEmail