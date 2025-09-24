"use client"

import * as React from "react"
import DatePicker from 'react-date-picker'
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { cn } from "@/lib/utils"

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
  initialFocus?: boolean
}

function Calendar({
  selected,
  onSelect,
  className,
  disabled = false,
  ...props
}: CalendarProps) {
  const handleChange = (value: Date | null) => {
    onSelect?.(value || undefined)
  }

  return (
    <>
      <style scoped>{`
        /* Input container - clean design */
        .react-date-picker {
          width: 100%;
          border: 1px solid hsl(var(--border));
          border-radius: calc(var(--radius) - 2px);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: hsl(var(--background));
          transition: all 0.2s;
          height: 2.25rem;
          display: flex;
          align-items: center;
        }

        .react-date-picker:focus-within {
          border-color: hsl(var(--ring));
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        /* Dark theme input support */
        .theme-obsidian .react-date-picker, .dark .react-date-picker {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }

        .theme-obsidian .react-date-picker:focus-within, .dark .react-date-picker:focus-within {
          border-color: hsl(var(--ring));
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        .react-date-picker__wrapper {
          border: none;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          width: 100%;
        }

        .react-date-picker__inputGroup {
          display: flex !important;
          align-items: center !important;
          gap: 0.25rem !important;
          flex: 1 !important;
          min-width: 8rem !important;
        }

        .react-date-picker__inputGroup input {
          border: none !important;
          outline: none !important;
          background: transparent !important;
          padding: 0.125rem !important;
          font-size: 0.875rem !important;
          color: #374151 !important;
          text-align: center !important;
          flex: none !important;
        }

        /* Dark theme support for input text */
        .theme-obsidian .react-date-picker__inputGroup input, .dark .react-date-picker__inputGroup input {
          color: hsl(var(--foreground)) !important;
        }

        .react-date-picker__inputGroup input[name="day"] {
          width: 1.5rem !important;
        }

        .react-date-picker__inputGroup input[name="month"] {
          width: 1.5rem !important;
        }

        .react-date-picker__inputGroup input[name="year"] {
          width: 3rem !important;
        }

        .react-date-picker__inputGroup__divider {
          color: #6b7280 !important;
          padding: 0 0.125rem !important;
        }

        /* Dark theme support for divider */
        .theme-obsidian .react-date-picker__inputGroup__divider, .dark .react-date-picker__inputGroup__divider {
          color: hsl(var(--muted-foreground)) !important;
        }

        .react-date-picker__button {
          border: none;
          background: none;
          padding: 0.25rem;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .react-date-picker__button:hover {
          background: #f3f4f6;
        }

        .react-date-picker__button svg {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
        }

        /* Dark theme support for button */
        .theme-obsidian .react-date-picker__button:hover, .dark .react-date-picker__button:hover {
          background: hsl(var(--muted));
        }

        .theme-obsidian .react-date-picker__button svg, .dark .react-date-picker__button svg {
          color: hsl(var(--muted-foreground));
        }

        /* Calendar popup - clean and simple */
        .react-calendar {
          background: white;
          border: 1px solid hsl(var(--border));
          padding: 1rem;
          border-radius: calc(var(--radius) - 2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-top: 0.25rem;
          width: 100%;
          max-width: 320px;
        }

        /* Dark theme support */
        .theme-obsidian .react-calendar, .dark .react-calendar {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
        }

        /* Navigation header */
        .react-calendar__navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          height: 2.5rem;
        }

        .react-calendar__navigation button {
          border: none;
          background: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          transition: background-color 0.2s;
        }

        .react-calendar__navigation button:hover {
          background: #f3f4f6;
        }

        .react-calendar__navigation__label {
          font-weight: 600;
          color: #374151;
          flex: 1;
          text-align: center;
          text-transform: capitalize;
        }

        /* Dark theme support for navigation */
        .theme-obsidian .react-calendar__navigation button, .dark .react-calendar__navigation button {
          color: hsl(var(--foreground));
        }

        .theme-obsidian .react-calendar__navigation button:hover, .dark .react-calendar__navigation button:hover {
          background: hsl(var(--muted));
        }

        .theme-obsidian .react-calendar__navigation__label, .dark .react-calendar__navigation__label {
          color: hsl(var(--foreground));
        }

        /* Weekday headers - PERFECT ALIGNMENT */
        .react-calendar__month-view__weekdays {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 0 !important;
          margin-bottom: 0.75rem !important;
          width: 100% !important;
        }

        .react-calendar__month-view__weekdays__weekday {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 2.25rem !important;
          height: 2.25rem !important;
          text-align: center !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.025em !important;
          justify-self: center !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Dark theme support for weekday headers */
        .theme-obsidian .react-calendar__month-view__weekdays__weekday, .dark .react-calendar__month-view__weekdays__weekday {
          color: hsl(var(--muted-foreground)) !important;
        }

        /* Days grid - EXACT SAME STRUCTURE */
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 0 !important;
          width: 100% !important;
        }

        /* Individual day tiles - EXACT ALIGNMENT */
        .react-calendar__tile {
          border: none !important;
          background: none !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 0.875rem !important;
          transition: all 0.2s !important;
          height: 2.25rem !important;
          width: 2.25rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #374151 !important;
          font-weight: 400 !important;
          position: relative !important;
          justify-self: center !important;
          box-sizing: border-box !important;
        }

        .react-calendar__tile:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* Dark theme support for day tiles */
        .theme-obsidian .react-calendar__tile, .dark .react-calendar__tile {
          color: hsl(var(--foreground)) !important;
        }

        .theme-obsidian .react-calendar__tile:hover, .dark .react-calendar__tile:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        /* Selected date - using primary color */
        .react-calendar__tile--active {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          font-weight: 500;
        }

        .react-calendar__tile--active:hover {
          background: hsl(var(--primary)) !important;
          opacity: 0.9;
        }

        /* Current day - badge azul claro */
        .react-calendar__tile--now {
          background: #237584 !important;
          color: white !important;
          font-weight: 700 !important;
        }

        /* Dark theme current day */
        .theme-obsidian .react-calendar__tile--now, .dark .react-calendar__tile--now {
          background: #237584 !important;
          color: white !important;
          font-weight: 700 !important;
        }

        .react-calendar__tile--now:hover {
          background: #237584 !important;
          opacity: 0.9 !important;
        }

        .theme-obsidian .react-calendar__tile--now:hover, .dark .react-calendar__tile--now:hover {
          background: #237584 !important;
          opacity: 0.9 !important;
        }

        /* Other month days - muted */
        .react-calendar__tile--neighboringMonth {
          color: #9ca3af;
          opacity: 0.6;
        }

        /* Dark theme support for neighboring month days */
        .theme-obsidian .react-calendar__tile--neighboringMonth, .dark .react-calendar__tile--neighboringMonth {
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
        }

        /* Disabled days */
        .react-calendar__tile:disabled {
          color: hsl(var(--muted-foreground));
          opacity: 0.4;
          cursor: not-allowed;
        }

        .react-calendar__tile:disabled:hover {
          background: none;
        }

        /* Remove any weekend coloring - NO RED WEEKENDS */
        .react-calendar__month-view__days__day--weekend {
          color: hsl(var(--foreground)) !important;
        }
      `}</style>

      <div className={cn("relative", className)}>
        <DatePicker
          onChange={handleChange}
          value={selected || null}
          disabled={disabled}
          locale="es-ES"
          format="dd/MM/y"
          clearIcon={null}
          dayPlaceholder="dd"
          monthPlaceholder="mm"
          yearPlaceholder="aaaa"
          calendarIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
          calendarAriaLabel="Abrir calendario"
          calendarClassName="calendar-dropdown"
          showLeadingZeros={true}
          showNeighboringMonth={false}
          minDetail="month"
          maxDetail="month"
          {...props}
        />
      </div>
    </>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }