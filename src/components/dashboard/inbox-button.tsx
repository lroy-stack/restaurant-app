'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Inbox,
  Eye,
  CheckCheck,
  Calendar,
  Users,
  Clock,
  Loader2,
  Sparkles
} from 'lucide-react'
import { useInboxReservations } from '@/hooks/useInboxReservations'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface InboxButtonProps {
  onReservationClick?: (id: string) => void
}

export function InboxButton({ onReservationClick }: InboxButtonProps) {
  const [open, setOpen] = useState(false)
  const {
    unseenReservations,
    unseenCount,
    markAsSeen,
    markAllAsSeen,
    loading,
    refresh
  } = useInboxReservations()

  const handleReservationClick = (id: string) => {
    markAsSeen(id)
    setOpen(false)
    onReservationClick?.(id)
  }

  const handleMarkAsSeen = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsSeen(id)
  }

  const handleMarkAllAsSeen = () => {
    markAllAsSeen()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={unseenCount > 0 ? "default" : "outline"}
          size="sm"
          className={cn(
            "relative gap-2 flex-1 sm:flex-initial",
            unseenCount > 0 && "bg-primary text-primary-foreground shadow-lg"
          )}
        >
          <Inbox className="h-4 w-4" />
          <span className="hidden md:inline">Nuevas</span>
          <span className="md:hidden">
            {unseenCount > 0 ? `${unseenCount} Nueva${unseenCount > 1 ? 's' : ''}` : 'Bandeja'}
          </span>
          {unseenCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 min-w-5 px-1 flex items-center justify-center text-xs font-bold animate-pulse bg-destructive text-destructive-foreground"
            >
              {unseenCount > 99 ? '99+' : unseenCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Reservas Nuevas</h3>
            {unseenCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unseenCount}
              </Badge>
            )}
          </div>
          {unseenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsSeen}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : unseenCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Sin reservas nuevas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Te notificaremos cuando lleguen
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y">
              {unseenReservations.map((reservation, index) => {
                const reservationDate = new Date(reservation.time)
                const isToday = format(reservationDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                return (
                  <div
                    key={reservation.id}
                    className={cn(
                      "p-4 hover:bg-accent/50 transition-colors cursor-pointer relative group",
                      index === 0 && "bg-primary/5"
                    )}
                    onClick={() => handleReservationClick(reservation.id)}
                  >
                    {/* Badge "Nueva" para la primera */}
                    {index === 0 && (
                      <Badge
                        variant="default"
                        className="absolute top-2 right-2 text-xs animate-pulse"
                      >
                        Nueva
                      </Badge>
                    )}

                    {/* Customer name */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm truncate pr-16">
                        {reservation.customerName}
                      </h4>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span>
                          {reservation.partySize} {reservation.partySize === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>
                          {isToday ? 'Hoy' : format(reservationDate, "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{format(reservationDate, 'HH:mm')}</span>
                      </div>

                      {reservation.specialRequests && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground line-clamp-2">
                          {reservation.specialRequests}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleReservationClick(reservation.id)}
                      >
                        Ver Detalle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleMarkAsSeen(reservation.id, e)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Pre-order indicator */}
                    {reservation.hasPreOrder && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="text-xs">
                          📋 Pre-pedido
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {unseenCount > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Haz clic en una reserva para ver detalles
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
