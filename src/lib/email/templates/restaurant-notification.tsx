// Restaurant Notification Email - Simple template WITHOUT EmailBase
// Used for notifying restaurant staff about new web reservations

import { Html, Body, Container, Text, Button, Hr } from '@react-email/components'
import * as React from 'react'

export interface RestaurantNotificationProps {
  reservationId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  reservationDate: string
  reservationTime: string
  partySize: number
  childrenCount?: number
  tableNumbers: string
  tableLocation: string
  specialRequests?: string
  preOrderItems?: Array<{name: string, quantity: number, price?: number}>
}

export const RestaurantNotification = ({
  reservationId,
  customerName,
  customerEmail,
  customerPhone,
  reservationDate,
  reservationTime,
  partySize,
  childrenCount,
  tableNumbers,
  tableLocation,
  specialRequests,
  preOrderItems = []
}: RestaurantNotificationProps) => {
  return (
    <Html>
      <Body style={body}>
        <Container style={container}>
          <Text style={title}>🔔 Nueva Reserva Web</Text>
          <Hr style={divider} />

          <Text style={label}>Cliente:</Text>
          <Text style={value}>{customerName}</Text>

          <Text style={label}>Email:</Text>
          <Text style={value}>{customerEmail}</Text>

          <Text style={label}>Teléfono:</Text>
          <Text style={value}>{customerPhone}</Text>

          <Hr style={divider} />

          <Text style={label}>Fecha:</Text>
          <Text style={value}>{reservationDate}</Text>

          <Text style={label}>Hora:</Text>
          <Text style={value}>{reservationTime}</Text>

          <Text style={label}>Comensales:</Text>
          <Text style={value}>
            {partySize} adulto{partySize !== 1 ? 's' : ''}
            {childrenCount && childrenCount > 0 && ` + ${childrenCount} niño${childrenCount !== 1 ? 's' : ''}`}
          </Text>

          <Text style={label}>Mesa(s):</Text>
          <Text style={value}>{tableNumbers} - {tableLocation}</Text>

          {specialRequests && (
            <>
              <Hr style={divider} />
              <Text style={label}>Peticiones especiales:</Text>
              <Text style={value}>{specialRequests}</Text>
            </>
          )}

          {preOrderItems.length > 0 && (
            <>
              <Hr style={divider} />
              <Text style={label}>Pre-pedido:</Text>
              {preOrderItems.map((item, i) => (
                <Text key={i} style={value}>• {item.quantity}x {item.name}</Text>
              ))}
            </>
          )}

          <Hr style={divider} />

          <Button
            style={button}
            href="https://www.enigmaconalma.com/dashboard/reservaciones"
          >
            Ver en Dashboard
          </Button>

          <Text style={footnote}>Estado: PENDIENTE</Text>
          <Text style={footnote}>ID: {reservationId}</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Simple email-compatible styles
const body = {
  backgroundColor: '#f6f6f6',
  fontFamily: 'Arial, sans-serif',
  padding: '20px'
}

const container = {
  backgroundColor: '#ffffff',
  padding: '30px',
  borderRadius: '8px',
  maxWidth: '500px',
  margin: '0 auto'
}

const title = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  color: '#1a1a1a'
}

const label = {
  fontSize: '12px',
  color: '#666666',
  margin: '10px 0 4px',
  textTransform: 'uppercase' as const,
  fontWeight: '600'
}

const value = {
  fontSize: '16px',
  margin: '0 0 10px',
  fontWeight: '600',
  color: '#1a1a1a'
}

const divider = {
  margin: '20px 0',
  borderTop: '1px solid #dddddd',
  border: 'none',
  borderTop: '1px solid #dddddd'
}

const button = {
  backgroundColor: '#237584',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '20px 0',
  fontWeight: '600',
  fontSize: '14px'
}

const footnote = {
  fontSize: '12px',
  color: '#999999',
  margin: '8px 0',
  fontStyle: 'italic'
}

export default RestaurantNotification
