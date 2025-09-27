import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';

export interface CustomCalendarProps {
  value?: string;
  onChange?: (date: string) => void;
  className?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  // Dynamic validation props (compatible with reference implementations)
  minAdvanceMinutes?: number;
  closedDays?: number[]; // Array de días cerrados (0=domingo, 1=lunes, etc.)
  closedDayMessage?: string;
  blockedDates?: string[]; // Array de fechas específicas bloqueadas ["2025-12-25", "2025-01-01"]
  holidayModeActive?: boolean; // Si está activo el modo vacaciones
  // Validation functions from useBusinessHours
  isDateDisabled?: (date: Date) => boolean;
  getDisabledReason?: (date: Date) => string;
  // NEW: Allow past dates for filter/search contexts
  allowPastDates?: boolean;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  value,
  onChange,
  className,
  placeholder = "Seleccionar fecha",
  error,
  disabled = false,
  minAdvanceMinutes = 30,
  closedDays = [0], // Por defecto domingo cerrado
  closedDayMessage = "Este día está cerrado",
  blockedDates = [],
  holidayModeActive = false,
  isDateDisabled: externalIsDateDisabled,
  getDisabledReason: externalGetDisabledReason,
  allowPastDates = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state when value prop changes from parent
  useEffect(() => {
    setSelectedDate(value ? new Date(value) : null);
  }, [value]);

  // Use external validation functions if provided, otherwise use internal logic
  const isDateDisabledInternal = (date: Date): boolean => {
    if (externalIsDateDisabled) {
      return externalIsDateDisabled(date);
    }

    // Internal validation logic (fallback)
    const now = new Date();
    const minAdvanceMs = minAdvanceMinutes * 60 * 1000;
    const minDateTime = new Date(now.getTime() + minAdvanceMs);

    // 🚀 CRITICAL FIX: Proper date validation logic
    // For today, check if we're past the minimum advance time
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date < minDateTime;
    }

    // For other dates, check if it's before today (past dates) - ONLY if allowPastDates is false
    if (!allowPastDates) {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfSelectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (startOfSelectedDay < startOfToday) {
        return true;
      }
    }

    // Check if it's a closed day
    if (closedDays.includes(date.getDay())) {
      return true;
    }

    // Check if it's a blocked date (holiday mode)
    if (holidayModeActive && blockedDates.length > 0) {
      const dateString = format(date, 'yyyy-MM-dd');
      if (blockedDates.includes(dateString)) {
        return true;
      }
    }

    return false;
  };

  const getDisabledReasonInternal = (date: Date): string => {
    if (externalGetDisabledReason) {
      return externalGetDisabledReason(date);
    }

    // Internal reason logic (fallback)
    const now = new Date();
    const minAdvanceMs = minAdvanceMinutes * 60 * 1000;
    const minDateTime = new Date(now.getTime() + minAdvanceMs);

    // 🚀 CRITICAL FIX: Proper advance booking check
    const isToday = date.toDateString() === now.toDateString();
    if (isToday && date < minDateTime) {
      const minHours = Math.ceil(minAdvanceMinutes / 60);
      return `Requiere ${minHours} horas de anticipación`;
    }

    // Past date check - ONLY if allowPastDates is false
    if (!allowPastDates) {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfSelectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (startOfSelectedDay < startOfToday) {
        return 'No se pueden seleccionar fechas pasadas';
      }
    }

    if (closedDays.includes(date.getDay())) {
      const dayOfWeek = date.getDay();
      const dayNames = {
        0: 'domingos',
        1: 'lunes',
        2: 'martes',
        3: 'miércoles',
        4: 'jueves',
        5: 'viernes',
        6: 'sábados'
      };

      const dayName = dayNames[dayOfWeek as keyof typeof dayNames];
      return `Los ${dayName} permanecemos cerrados. Te invitamos a visitarnos otros días.`;
    }

    // Check if it's a blocked date (holiday mode)
    if (holidayModeActive && blockedDates.length > 0) {
      const dateString = format(date, 'yyyy-MM-dd');
      if (blockedDates.includes(dateString)) {
        return '🏖️ Fecha bloqueada temporalmente';
      }
    }

    return '';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabledInternal(date)) {
      setSelectedDate(date);
      onChange?.(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subDays(monthStart, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addDays(monthEnd, 1));
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input trigger */}
      <div
        className={cn(
          'w-full h-9 px-3 py-1 rounded-md border border-input bg-transparent',
          'text-base md:text-sm placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'cursor-pointer flex items-center justify-between',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn(
          selectedDate ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Calendar dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full mt-2 left-0 z-50 w-full min-w-[320px] bg-popover border border-border rounded-md shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-medium text-foreground capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="p-4">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                const isDisabled = isDateDisabledInternal(date);
                const isClosedDay = closedDays.includes(date.getDay());
                const isBlockedDate = holidayModeActive && blockedDates.includes(format(date, 'yyyy-MM-dd'));
                const isPastDate = isBefore(date, startOfDay(new Date()));

                // Determinar el tipo de bloqueo para estilos específicos
                const getDisabledStyle = () => {
                  if (isPastDate) return 'opacity-30 cursor-not-allowed bg-muted text-muted-foreground';
                  if (isClosedDay) return 'opacity-50 cursor-not-allowed bg-destructive/10 text-destructive';
                  if (isBlockedDate) return 'opacity-60 cursor-not-allowed bg-orange-50 text-orange-600 relative';
                  return '';
                };

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    className={cn(
                      'h-8 w-8 rounded-md text-sm font-medium transition-colors duration-200 relative group',
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                      isSelected && !isDisabled && 'bg-primary text-primary-foreground shadow-sm',
                      isTodayDate && !isSelected && !isDisabled && 'bg-accent text-accent-foreground',
                      !isSelected && !isTodayDate && isCurrentMonth && !isDisabled && 'hover:bg-muted',
                      isDisabled && getDisabledStyle()
                    )}
                    title={isDisabled ? getDisabledReasonInternal(date) : ''}
                  >
                    <span className="relative z-10">
                      {format(date, 'd')}
                    </span>
                    {/* Icono específico para fechas bloqueadas por vacaciones */}
                    {isBlockedDate && (
                      <span className="absolute top-0 right-0 text-[8px] leading-none">
                        🏖️
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};