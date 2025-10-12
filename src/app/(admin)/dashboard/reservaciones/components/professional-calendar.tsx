'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Users,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react'

// Configurar moment en español
moment.locale('es')
const localizer = momentLocalizer(moment)

// Calendar con drag & drop
const DragAndDropCalendar = withDragAndDrop(Calendar)

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

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Reservation
}

interface ProfessionalCalendarProps {
  reservations: Reservation[]
  loading?: boolean
  currentDate?: Date
  onDateChange?: (date: Date) => void
  onReservationClick?: (reservation: Reservation) => void
  onReservationMove?: (eventId: string, start: Date, end: Date) => void
  onReservationResize?: (eventId: string, start: Date, end: Date) => void
}

// Configuración de colores por estado
const statusColors = {
  PENDING: { bg: 'rgb(254 249 195)', border: 'rgb(202 138 4)', text: 'rgb(133 77 14)' },
  CONFIRMED: { bg: 'rgb(220 252 231)', border: 'rgb(34 197 94)', text: 'rgb(21 128 61)' },
  SEATED: { bg: 'rgb(219 234 254)', border: 'rgb(59 130 246)', text: 'rgb(30 64 175)' },
  COMPLETED: { bg: 'rgb(243 244 246)', border: 'rgb(107 114 128)', text: 'rgb(55 65 81)' },
  CANCELLED: { bg: 'rgb(254 226 226)', border: 'rgb(239 68 68)', text: 'rgb(185 28 28)' },
  NO_SHOW: { bg: 'rgb(254 226 226)', border: 'rgb(239 68 68)', text: 'rgb(185 28 28)' }
}

// Mensajes en español
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Reserva',
  noEventsInRange: 'No hay reservas en este período',
  showMore: (total: number) => `+${total} más`
}

// Formatos en español
const formats = {
  monthHeaderFormat: 'MMMM YYYY',
  weekdayFormat: 'dddd',
  dayHeaderFormat: 'dddd DD/MM',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
    `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`,
  agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`,
  agendaDateFormat: 'dddd DD/MM',
  agendaTimeFormat: 'HH:mm',
  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
}

export function ProfessionalCalendar({ 
  reservations, 
  loading = false, 
  currentDate = new Date(),
  onDateChange,
  onReservationClick,
  onReservationMove,
  onReservationResize
}: ProfessionalCalendarProps) {
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(currentDate)

  // Convertir reservas a eventos del calendario
  const events = useMemo((): CalendarEvent[] => {
    return reservations.map(reservation => {
      // Extract date and time without timezone info to avoid UTC conversion issues
      const dateOnly = reservation.date.substring(0, 10) // "YYYY-MM-DD"
      const timeOnly = reservation.time.substring(11, 16) // "HH:mm"
      const startTime = moment(`${dateOnly} ${timeOnly}`, 'YYYY-MM-DD HH:mm')
      const endTime = startTime.clone().add(2, 'hours') // Duración por defecto 2 horas
      
      const isVip = reservation.customerEmail.includes('vip') || 
                   reservation.specialRequests?.toLowerCase().includes('vip')
      
      return {
        id: reservation.id,
        title: `${reservation.customerName}${isVip ? ' ⭐' : ''} (${reservation.partySize}p)`,
        start: startTime.toDate(),
        end: endTime.toDate(),
        resource: reservation
      }
    })
  }, [reservations])

  // Componente personalizado para eventos
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const reservation = event.resource
    const colors = statusColors[reservation.status]
    const isVip = reservation.customerEmail.includes('vip') || 
                  reservation.specialRequests?.toLowerCase().includes('vip')
    
    return (
      <div 
        className={cn(
          "p-1 rounded text-xs font-medium cursor-pointer",
          "hover:shadow-md transition-all duration-200",
          "border-l-2 flex items-center justify-between"
        )}
        style={{
          backgroundColor: colors.bg,
          borderLeftColor: colors.border,
          color: colors.text
        }}
        onClick={() => onReservationClick?.(reservation)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate font-semibold">
              {reservation.customerName}
            </span>
            {isVip && <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-xs opacity-80">
            <div className="flex items-center gap-1">
              <Users className="w-2 h-2" />
              <span>{reservation.partySize}p</span>
            </div>
            {reservation.tables && (
              <div className="flex items-center gap-1">
                <span>T{reservation.tables.number}</span>
              </div>
            )}
            {reservation.hasPreOrder && (
              <span className="text-green-600 dark:text-green-400">📋</span>
            )}
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className="text-xs px-1 py-0 ml-1"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          {reservation.status === 'PENDING' && '⏳'}
          {reservation.status === 'CONFIRMED' && '✅'}
          {reservation.status === 'SEATED' && '🪑'}
          {reservation.status === 'COMPLETED' && '✅'}
          {reservation.status === 'CANCELLED' && '❌'}
          {reservation.status === 'NO_SHOW' && '👻'}
        </Badge>
      </div>
    )
  }, [onReservationClick])

  // Toolbar personalizada - RESPONSIVE
  const CustomToolbar = useCallback(({ label, onNavigate, onView }: any) => {
    return (
      <div className="space-y-3 sm:space-y-0 mb-4 pb-4 border-b">
        {/* Navegación y título */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('PREV')}
              className="h-8 w-8 p-0 sm:w-auto sm:px-3"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('TODAY')}
              className="h-8 px-2 text-xs sm:px-3 sm:text-sm"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('NEXT')}
              className="h-8 w-8 p-0 sm:w-auto sm:px-3"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-sm sm:text-lg font-semibold truncate min-w-0 flex-1 text-center">{label}</h2>
        </div>

        {/* Botones de vista - Grid en móvil */}
        <div className="grid grid-cols-4 gap-1 sm:flex sm:justify-end sm:gap-2">
          {(['month', 'week', 'day', 'agenda'] as View[]).map(viewName => (
            <Button
              key={viewName}
              variant={view === viewName ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setView(viewName)
                onView(viewName)
              }}
              className="h-8 text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">
                {viewName === 'month' && 'Mes'}
                {viewName === 'week' && 'Semana'}
                {viewName === 'day' && 'Día'}
                {viewName === 'agenda' && 'Agenda'}
              </span>
              <span className="sm:hidden">
                {viewName === 'month' && 'M'}
                {viewName === 'week' && 'S'}
                {viewName === 'day' && 'D'}
                {viewName === 'agenda' && 'A'}
              </span>
            </Button>
          ))}
        </div>
      </div>
    )
  }, [view])

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
    onDateChange?.(newDate)
  }

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onReservationClick?.(event.resource)
  }, [onReservationClick])

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    // Navegar a crear nueva reserva en esa fecha/hora
    console.log('Nueva reserva para:', start)
  }, [])

  // Handlers para drag & drop
  const handleEventDrop = useCallback(({ event, start, end }: any) => {
    const updatedEvent = { ...event, start, end }
    console.log('Event moved:', updatedEvent)
    onReservationMove?.(event.id, start, end)
  }, [onReservationMove])

  const handleEventResize = useCallback(({ event, start, end }: any) => {
    const updatedEvent = { ...event, start, end }
    console.log('Event resized:', updatedEvent)
    onReservationResize?.(event.id, start, end)
  }, [onReservationResize])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendario de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-96 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Calendario de Reservas
          </CardTitle>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-200 border border-yellow-400 rounded dark:bg-yellow-900/30 dark:border-yellow-600 flex-shrink-0"></div>
              <span className="hidden sm:inline">Pendiente</span>
              <span className="sm:hidden">Pend.</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-200 border border-green-400 rounded dark:bg-green-900/30 dark:border-green-600 flex-shrink-0"></div>
              <span className="hidden sm:inline">Confirmada</span>
              <span className="sm:hidden">Conf.</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-200 border border-blue-400 rounded dark:bg-blue-900/30 dark:border-blue-600 flex-shrink-0"></div>
              <span className="hidden sm:inline">En Mesa</span>
              <span className="sm:hidden">Mesa</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="h-[450px] sm:h-[600px]">
          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            resizable
            selectable
            dragFromOutsideItem={null}
            messages={messages}
            formats={formats}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent
            }}
            dayLayoutAlgorithm="no-overlap"
            step={30}
            timeslots={2}
            min={new Date(2024, 1, 1, 8, 0)} // 8:00 AM
            max={new Date(2024, 1, 1, 23, 59)} // 11:59 PM
            scrollToTime={new Date(2024, 1, 1, 12, 0)} // Scroll to 12:00 PM
            className="professional-calendar"
          />
        </div>
      </CardContent>
      
      <style jsx global>{`
        .professional-calendar .rbc-calendar {
          font-family: inherit;
        }
        .professional-calendar .rbc-header {
          padding: 6px 4px;
          font-weight: 600;
          font-size: 0.75rem;
          border-bottom: 1px solid rgb(229 231 235);
        }
        @media (min-width: 640px) {
          .professional-calendar .rbc-header {
            padding: 8px 6px;
            font-size: 0.875rem;
          }
        }
        .professional-calendar .rbc-time-slot {
          border-top: 1px solid rgb(243 244 246);
        }
        .professional-calendar .rbc-timeslot-group {
          border-bottom: 1px solid rgb(229 231 235);
        }
        .professional-calendar .rbc-today {
          background-color: rgb(248 250 252);
        }
        .professional-calendar .rbc-current-time-indicator {
          background-color: rgb(239 68 68);
          height: 2px;
        }
        .professional-calendar .rbc-event {
          border: none !important;
          background: none !important;
          padding: 0 !important;
        }
        .professional-calendar .rbc-day-slot .rbc-time-slot {
          height: 30px;
        }
        /* Móvil: Hacer los labels de hora más compactos */
        @media (max-width: 640px) {
          .professional-calendar .rbc-time-header-gutter,
          .professional-calendar .rbc-time-gutter {
            width: 45px !important;
            max-width: 45px !important;
            min-width: 45px !important;
          }
          .professional-calendar .rbc-label {
            font-size: 0.65rem;
          }
          .professional-calendar .rbc-time-content {
            overflow-x: auto;
          }
        }

        /* Dark theme support - Obsidian */
        .theme-obsidian .professional-calendar .rbc-header, .dark .professional-calendar .rbc-header {
          background-color: rgb(30 41 59);
          border-bottom: 1px solid rgb(51 65 85);
          color: rgb(226 232 240);
        }
        .theme-obsidian .professional-calendar .rbc-time-slot, .dark .professional-calendar .rbc-time-slot {
          border-top: 1px solid rgb(51 65 85);
        }
        .theme-obsidian .professional-calendar .rbc-timeslot-group, .dark .professional-calendar .rbc-timeslot-group {
          border-bottom: 1px solid rgb(51 65 85);
        }
        .theme-obsidian .professional-calendar .rbc-today, .dark .professional-calendar .rbc-today {
          background-color: rgb(30 41 59);
        }
        .theme-obsidian .professional-calendar .rbc-current-time-indicator, .dark .professional-calendar .rbc-current-time-indicator {
          background-color: rgb(248 113 113);
        }
      `}</style>
    </Card>
  )
}