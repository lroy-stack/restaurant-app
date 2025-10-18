'use client'

import { ProfessionalCalendar } from './professional-calendar'

interface Reservation {
  id: string
  date: string
  time: string
  partySize: number
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests?: string
  hasPreOrder: boolean
  tables?: {
    number: string
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  } | null
}

interface ReservationCalendarProps {
  reservations: Reservation[]
  loading?: boolean
  currentDate?: Date
  onDateChange?: (date: Date) => void
  onReservationClick?: (reservationId: string) => void
  onSlotClick?: (slotInfo: any) => void
}

export function ReservationCalendar({
  reservations,
  loading = false,
  currentDate = new Date(),
  onDateChange,
  onReservationClick,
  onSlotClick
}: ReservationCalendarProps) {
  const handleReservationClick = (reservation: Reservation) => {
    if (onReservationClick) {
      onReservationClick(reservation.id)
    }
  }

  return (
    <ProfessionalCalendar
      reservations={reservations}
      loading={loading}
      currentDate={currentDate}
      onDateChange={onDateChange}
      onReservationClick={handleReservationClick}
      onSlotClick={onSlotClick}
    />
  )
}

