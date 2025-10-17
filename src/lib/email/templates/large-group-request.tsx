import * as React from 'react'
import { EmailBase } from './email-base'

interface LargeGroupRequestEmailProps {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes?: string
  dateTime: string
  partySize: number
  preferredLanguage: 'ES' | 'EN' | 'DE'
}

/**
 * Template de email para solicitudes de grupos grandes
 * Enviado a admin@enigmaconalma.com
 */
export function LargeGroupRequestEmail({
  firstName,
  lastName,
  email,
  phone,
  notes,
  dateTime,
  partySize,
  preferredLanguage
}: LargeGroupRequestEmailProps) {
  const date = new Date(dateTime)
  const dateStr = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const languageLabels = {
    ES: 'Español',
    EN: 'English',
    DE: 'Deutsch'
  }

  return (
    <EmailBase title="Solicitud de Reserva - Grupo Grande">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {/* Header con alerta */}
          <tr>
            <td style={{ paddingBottom: '24px' }}>
              <div
                style={{
                  backgroundColor: '#FEF3C7',
                  border: '2px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#92400E'
                  }}
                >
                  🔔 Nueva Solicitud de Grupo Grande
                </p>
                <p
                  style={{
                    margin: '8px 0 0 0',
                    fontSize: '14px',
                    color: '#92400E'
                  }}
                >
                  Requiere atención personal - El cliente será contactado por WhatsApp
                </p>
              </div>
            </td>
          </tr>

          {/* Detalles de la reserva */}
          <tr>
            <td style={{ paddingBottom: '24px' }}>
              <h2
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  borderBottom: '2px solid #E5E7EB',
                  paddingBottom: '8px'
                }}
              >
                📅 Detalles de la Reserva
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold',
                        width: '40%'
                      }}
                    >
                      Fecha:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {dateStr}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold'
                      }}
                    >
                      Hora:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {timeStr}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold'
                      }}
                    >
                      Número de Personas:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#DC2626'
                      }}
                    >
                      {partySize} personas
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Datos del cliente */}
          <tr>
            <td style={{ paddingBottom: '24px' }}>
              <h2
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  borderBottom: '2px solid #E5E7EB',
                  paddingBottom: '8px'
                }}
              >
                👤 Datos del Cliente
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold',
                        width: '40%'
                      }}
                    >
                      Nombre Completo:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {firstName} {lastName}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold'
                      }}
                    >
                      Email:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      <a
                        href={`mailto:${email}`}
                        style={{ color: '#2563EB', textDecoration: 'underline' }}
                      >
                        {email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold'
                      }}
                    >
                      Teléfono:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      <a
                        href={`tel:${phone}`}
                        style={{ color: '#2563EB', textDecoration: 'underline' }}
                      >
                        {phone}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 'bold'
                      }}
                    >
                      Idioma Preferido:
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {languageLabels[preferredLanguage]}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Notas adicionales */}
          {notes && (
            <tr>
              <td style={{ paddingBottom: '24px' }}>
                <h2
                  style={{
                    margin: '0 0 16px 0',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    borderBottom: '2px solid #E5E7EB',
                    paddingBottom: '8px'
                  }}
                >
                  📝 Notas Adicionales
                </h2>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#4B5563',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {notes}
                  </p>
                </div>
              </td>
            </tr>
          )}

          {/* CTA para WhatsApp */}
          <tr>
            <td style={{ paddingTop: '24px', textAlign: 'center' }}>
              <a
                href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                💬 Contactar por WhatsApp
              </a>
            </td>
          </tr>

          {/* Recordatorio */}
          <tr>
            <td style={{ paddingTop: '24px' }}>
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '14px',
                  color: '#1E40AF'
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  ℹ️ Recordatorio:
                </p>
                <p style={{ margin: 0 }}>
                  Este cliente espera ser contactado por WhatsApp para confirmar los
                  detalles de su reserva. Por favor, responde lo antes posible.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </EmailBase>
  )
}
