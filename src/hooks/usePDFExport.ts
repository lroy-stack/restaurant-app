// hooks/usePDFExport.ts - Modular PDF Export Hook
'use client'

import { useState, useCallback } from 'react'
import { format, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Reservation } from '@/types/reservation'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export type ExportDateRange = 'today' | 'tomorrow' | 'week'

export interface PDFExportOptions {
  dateRange: ExportDateRange
  includeDetails: boolean
  includeNotes: boolean
  sortBy: 'time' | 'name' | 'table'
}

export interface PDFExportResult {
  success: boolean
  filename?: string
  error?: string
}

// Enigma Brand Colors for PDF (OKLCH to RGB conversion)
const ENIGMA_COLORS = {
  primary: [55, 117, 133] as [number, number, number], // Atlantic Blue
  secondary: [159, 178, 137] as [number, number, number], // Sage Green
  accent: [203, 89, 16] as [number, number, number], // Burnt Orange
  text: [33, 40, 51] as [number, number, number], // Dark foreground
  muted: [115, 125, 140] as [number, number, number], // Muted text
  border: [224, 224, 230] as [number, number, number], // Light border
} as const

const STATUS_COLORS = {
  CONFIRMED: [46, 125, 50] as [number, number, number], // Green
  PENDING: [255, 152, 0] as [number, number, number], // Orange
  SEATED: [33, 150, 243] as [number, number, number], // Blue
  COMPLETED: [76, 175, 80] as [number, number, number], // Light Green
  CANCELLED: [244, 67, 54] as [number, number, number], // Red
  NO_SHOW: [158, 158, 158] as [number, number, number], // Gray
} as const

const LOCATION_TRANSLATIONS = {
  TERRACE_CAMPANARI: 'Terraza Campanario',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_VIP: 'Sala VIP',
  SALA_PRINCIPAL: 'Sala Principal',
  TERRACE: 'Terraza',
  INTERIOR: 'Interior',
  BAR: 'Bar'
} as const

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false)

  const filterReservationsByDateRange = useCallback((
    reservations: Reservation[],
    dateRange: ExportDateRange,
    baseDate = new Date()
  ): Reservation[] => {
    let startDate: Date
    let endDate: Date

    switch (dateRange) {
      case 'today':
        startDate = startOfDay(baseDate)
        endDate = endOfDay(baseDate)
        break
      case 'tomorrow':
        const tomorrow = addDays(baseDate, 1)
        startDate = startOfDay(tomorrow)
        endDate = endOfDay(tomorrow)
        break
      case 'week':
        startDate = startOfWeek(baseDate, { weekStartsOn: 1 }) // Monday
        endDate = endOfWeek(baseDate, { weekStartsOn: 1 }) // Sunday
        break
      default:
        startDate = startOfDay(baseDate)
        endDate = endOfDay(baseDate)
    }

    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date)
      return reservationDate >= startDate && reservationDate <= endDate
    })
  }, [])

  const sortReservations = useCallback((
    reservations: Reservation[],
    sortBy: 'time' | 'name' | 'table'
  ): Reservation[] => {
    return [...reservations].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(a.time).getTime() - new Date(b.time).getTime()
        case 'name':
          return a.customerName.localeCompare(b.customerName)
        case 'table':
          // Sort by primary table or first table in array
          const aTable = a.tableId || (a.table_ids?.[0] ?? 'zzz')
          const bTable = b.tableId || (b.table_ids?.[0] ?? 'zzz')
          return aTable.localeCompare(bTable)
        default:
          return 0
      }
    })
  }, [])

  const generatePDF = useCallback(async (
    reservations: Reservation[],
    options: PDFExportOptions
  ): Promise<PDFExportResult> => {
    try {
      setIsExporting(true)

      // jsPDF with autoTable extension loaded via static imports

      // Filter and sort reservations
      const filteredReservations = filterReservationsByDateRange(reservations, options.dateRange)
      const sortedReservations = sortReservations(filteredReservations, options.sortBy)

      if (sortedReservations.length === 0) {
        return {
          success: false,
          error: 'No hay reservaciones para el período seleccionado'
        }
      }

      // Initialize PDF
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header with Enigma branding
      addHeader(doc, pageWidth, options.dateRange)

      // Summary stats
      const startY = addSummarySection(doc, sortedReservations, 45)

      // Reservations table
      addReservationsTable(doc, sortedReservations, options, startY + 10)

      // Footer
      addFooter(doc, pageWidth, pageHeight)

      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const rangeStr = options.dateRange === 'today' ? 'hoy' :
                       options.dateRange === 'tomorrow' ? 'mañana' : 'semana'
      const filename = `enigma-reservaciones-${rangeStr}-${dateStr}.pdf`

      // Save PDF
      doc.save(filename)

      return {
        success: true,
        filename
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar PDF'
      }
    } finally {
      setIsExporting(false)
    }
  }, [filterReservationsByDateRange, sortReservations])

  return {
    generatePDF,
    isExporting,
    filterReservationsByDateRange,
    sortReservations
  }
}

// Helper functions for PDF generation
function addHeader(doc: any, pageWidth: number, dateRange: ExportDateRange) {
  // Logo placeholder (would need actual logo)
  doc.setFillColor(...ENIGMA_COLORS.primary)
  doc.rect(20, 15, pageWidth - 40, 25, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ENIGMA COCINA CON ALMA', pageWidth / 2, 27, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Lista de Reservaciones', pageWidth / 2, 35, { align: 'center' })

  // Date range
  const today = new Date()
  const rangeText = dateRange === 'today' ? format(today, "dd 'de' MMMM, yyyy", { locale: es }) :
                   dateRange === 'tomorrow' ? format(addDays(today, 1), "dd 'de' MMMM, yyyy", { locale: es }) :
                   `Semana del ${format(startOfWeek(today, { weekStartsOn: 1 }), 'dd/MM', { locale: es })} al ${format(endOfWeek(today, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: es })}`

  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFontSize(10)
  doc.text(`Fecha: ${rangeText}`, 20, 47)
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`, pageWidth - 20, 47, { align: 'right' })
}

function addSummarySection(doc: any, reservations: Reservation[], startY: number): number {
  const stats = reservations.reduce((acc, res) => {
    acc.total++
    acc.totalPax += res.partySize
    acc.byStatus[res.status] = (acc.byStatus[res.status] || 0) + 1
    return acc
  }, {
    total: 0,
    totalPax: 0,
    byStatus: {} as Record<string, number>
  })

  // Summary box
  doc.setDrawColor(...ENIGMA_COLORS.border)
  doc.setFillColor(248, 249, 250)
  doc.rect(20, startY, 170, 25, 'DF')

  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN DEL SERVICIO', 25, startY + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Total Reservas: ${stats.total}`, 25, startY + 15)
  doc.text(`Total Comensales: ${stats.totalPax}`, 25, startY + 20)

  // Status breakdown
  let x = 90
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || ENIGMA_COLORS.muted
    doc.setTextColor(...statusColor)
    doc.text(`${status}: ${count}`, x, startY + 15)
    x += 35
  })

  return startY + 25
}

function addReservationsTable(doc: any, reservations: Reservation[], options: PDFExportOptions, startY: number) {
  const headers = ['Hora', 'Cliente', 'Mesa(s)', 'PAX', 'Estado']
  if (options.includeNotes) headers.push('Notas')

  const tableData = reservations.map(reservation => {
    const row = [
      format(new Date(reservation.time), 'HH:mm'),
      `${reservation.customerName}\n${reservation.customerEmail}`,
      getTableDisplay(reservation),
      reservation.partySize.toString(),
      reservation.status
    ]

    if (options.includeNotes) {
      row.push(reservation.specialRequests || '-')
    }

    return row
  })

  // Use autoTable with static imports - guaranteed to work
  ;(doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      textColor: ENIGMA_COLORS.text,
      lineColor: ENIGMA_COLORS.border,
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: ENIGMA_COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' }, // Hora
      1: { cellWidth: options.includeNotes ? 45 : 55 }, // Cliente
      2: { cellWidth: 25, halign: 'center' }, // Mesa
      3: { cellWidth: 15, halign: 'center' }, // PAX
      4: { cellWidth: 25, halign: 'center' }, // Estado
      ...(options.includeNotes && { 5: { cellWidth: 40 } }) // Notas
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    didParseCell: function(data: any) {
      // Color-code status cells
      if (data.column.index === 4) { // Status column
        const status = data.cell.text[0]
        const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS]
        if (statusColor) {
          data.cell.styles.textColor = statusColor
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
    margin: { left: 20, right: 20 }
  })
}

function addFooter(doc: any, pageWidth: number, pageHeight: number) {
  doc.setDrawColor(...ENIGMA_COLORS.primary)
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25)

  doc.setTextColor(...ENIGMA_COLORS.muted)
  doc.setFontSize(8)
  doc.text('Carrer Justicia 6A, 03710 Calpe • +34 672 79 60 06 • info@enigmaconalma.com', pageWidth / 2, pageHeight - 15, { align: 'center' })
  doc.text('Documento generado por el sistema interno de gestión', pageWidth / 2, pageHeight - 10, { align: 'center' })
}

function getTableDisplay(reservation: Reservation): string {
  // Handle both legacy tableId and new table_ids array
  if (reservation.table_ids && reservation.table_ids.length > 0) {
    // Extract table numbers from IDs (e.g., "principal_s3" -> "S3")
    const tableNumbers = reservation.table_ids.map(id => {
      const parts = id.split('_')
      return parts[parts.length - 1].toUpperCase()
    })
    return tableNumbers.join(', ')
  }

  if (reservation.tableId) {
    const parts = reservation.tableId.split('_')
    return parts[parts.length - 1].toUpperCase()
  }

  return '-'
}