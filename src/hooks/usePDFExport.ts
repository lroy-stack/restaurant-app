// hooks/usePDFExport.ts - Enhanced PDF Export with Pre-orders and Full Details
'use client'

import { useState, useCallback } from 'react'
import { format, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Reservation } from '@/types/reservation'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

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

interface ReservationItem {
  id: string
  quantity: number
  notes?: string
  menuItemId: string
  menuItem: {
    name: string
    nameEn?: string
    price: number
    type: 'WINE' | 'FOOD'
  }
}

interface EnhancedReservation extends Reservation {
  preOrderItems?: ReservationItem[]
}

// Enigma Brand Colors for PDF (OKLCH to RGB conversion)
const ENIGMA_COLORS = {
  primary: [55, 117, 133] as [number, number, number], // Atlantic Blue
  secondary: [159, 178, 137] as [number, number, number], // Sage Green
  accent: [203, 89, 16] as [number, number, number], // Burnt Orange
  text: [33, 40, 51] as [number, number, number], // Dark foreground
  muted: [115, 125, 140] as [number, number, number], // Muted text
  border: [224, 224, 230] as [number, number, number], // Light border
  warning: [255, 193, 7] as [number, number, number], // Amber for allergies
  danger: [220, 53, 69] as [number, number, number], // Red for important
  success: [40, 167, 69] as [number, number, number], // Green
} as const

const STATUS_COLORS = {
  CONFIRMED: [46, 125, 50] as [number, number, number],
  PENDING: [255, 152, 0] as [number, number, number],
  SEATED: [33, 150, 243] as [number, number, number],
  COMPLETED: [76, 175, 80] as [number, number, number],
  CANCELLED: [244, 67, 54] as [number, number, number],
  NO_SHOW: [158, 158, 158] as [number, number, number],
} as const

const STATUS_LABELS = {
  CONFIRMED: 'Confirmada',
  PENDING: 'Pendiente',
  SEATED: 'En Mesa',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Asistió',
}

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false)

  const fetchReservationItems = async (reservationId: string): Promise<ReservationItem[]> => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/items`)
      if (!response.ok) return []
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error fetching reservation items:', error)
      return []
    }
  }

  const enhanceReservationsWithItems = async (
    reservations: Reservation[]
  ): Promise<EnhancedReservation[]> => {
    const enhanced = await Promise.all(
      reservations.map(async (reservation) => {
        if (reservation.hasPreOrder) {
          const items = await fetchReservationItems(reservation.id)
          return { ...reservation, preOrderItems: items }
        }
        return { ...reservation, preOrderItems: [] }
      })
    )
    return enhanced
  }

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
        startDate = startOfWeek(baseDate, { weekStartsOn: 1 })
        endDate = endOfWeek(baseDate, { weekStartsOn: 1 })
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

      // Filter and sort reservations
      const filteredReservations = filterReservationsByDateRange(reservations, options.dateRange)
      const sortedReservations = sortReservations(filteredReservations, options.sortBy)

      if (sortedReservations.length === 0) {
        return {
          success: false,
          error: 'No hay reservas para el período seleccionado'
        }
      }

      // Enhance with pre-order items
      const enhancedReservations = await enhanceReservationsWithItems(sortedReservations)

      // Initialize PDF
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header with Enigma branding
      addHeader(doc, pageWidth, options.dateRange)

      // Summary stats
      const startY = addSummarySection(doc, enhancedReservations, 50)

      // Detailed reservations (new format)
      addDetailedReservations(doc, enhancedReservations, options, startY + 5, pageWidth, pageHeight)

      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const rangeStr = options.dateRange === 'today' ? 'hoy' :
                       options.dateRange === 'tomorrow' ? 'mañana' : 'semana'
      const filename = `enigma-reservas-${rangeStr}-${dateStr}.pdf`

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

// ==================== HELPER FUNCTIONS ====================

function addHeader(doc: any, pageWidth: number, dateRange: ExportDateRange) {
  // Header background
  doc.setFillColor(...ENIGMA_COLORS.primary)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('ENIGMA COCINA CON ALMA', pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Lista Detallada de Reservas', pageWidth / 2, 23, { align: 'center' })

  // Date range
  const today = new Date()
  const rangeText = dateRange === 'today' ? format(today, "EEEE dd 'de' MMMM, yyyy", { locale: es }) :
                   dateRange === 'tomorrow' ? format(addDays(today, 1), "EEEE dd 'de' MMMM, yyyy", { locale: es }) :
                   `Semana del ${format(startOfWeek(today, { weekStartsOn: 1 }), 'dd/MM', { locale: es })} al ${format(endOfWeek(today, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: es })}`

  doc.setFontSize(9)
  doc.text(rangeText, pageWidth / 2, 30, { align: 'center' })

  // Metadata
  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFontSize(8)
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 15, 42)
}

function addSummarySection(doc: any, reservations: EnhancedReservation[], startY: number): number {
  const stats = reservations.reduce((acc, res) => {
    acc.total++
    acc.totalPax += res.partySize
    acc.totalChildren += res.childrenCount || 0
    acc.withPreOrder += res.hasPreOrder ? 1 : 0
    acc.withAllergies += res.dietaryNotes ? 1 : 0
    acc.byStatus[res.status] = (acc.byStatus[res.status] || 0) + 1
    return acc
  }, {
    total: 0,
    totalPax: 0,
    totalChildren: 0,
    withPreOrder: 0,
    withAllergies: 0,
    byStatus: {} as Record<string, number>
  })

  // Summary box
  doc.setDrawColor(...ENIGMA_COLORS.border)
  doc.setFillColor(248, 250, 252)
  doc.rect(15, startY, 180, 35, 'DF')

  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN DEL SERVICIO', 20, startY + 8)

  // Main stats
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Total Reservas: ${stats.total}`, 20, startY + 16)
  doc.text(`Comensales: ${stats.totalPax} (${stats.totalChildren} niños)`, 20, startY + 22)
  doc.text(`Con Pre-pedido: ${stats.withPreOrder}`, 20, startY + 28)

  if (stats.withAllergies > 0) {
    doc.setTextColor(...ENIGMA_COLORS.warning)
    doc.text(`⚠ Alergias/Dietas: ${stats.withAllergies}`, 90, startY + 28)
  }

  // Status breakdown
  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.text('Por Estado:', 90, startY + 16)
  doc.setFont('helvetica', 'normal')

  let y = startY + 22
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || ENIGMA_COLORS.muted
    const statusLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status
    doc.setTextColor(...statusColor)
    doc.text(`${statusLabel}: ${count}`, 90, y)
    y += 6
  })

  return startY + 35
}

function addDetailedReservations(
  doc: any,
  reservations: EnhancedReservation[],
  options: PDFExportOptions,
  startY: number,
  pageWidth: number,
  pageHeight: number
) {
  let currentY = startY
  const margin = 15
  const cardWidth = pageWidth - (margin * 2)

  reservations.forEach((reservation, index) => {
    // Calculate card height dynamically
    let cardHeight = 35 // Base height
    if (reservation.occasion) cardHeight += 5
    if (reservation.dietaryNotes) cardHeight += 8
    if (reservation.specialRequests) cardHeight += 8
    if (reservation.hasPreOrder && reservation.preOrderItems && reservation.preOrderItems.length > 0) {
      cardHeight += 10 + (reservation.preOrderItems.length * 5)
    }

    // Check if we need a new page
    if (currentY + cardHeight > pageHeight - 30) {
      doc.addPage()
      currentY = 15
      // Add mini header on new page
      doc.setFontSize(10)
      doc.setTextColor(...ENIGMA_COLORS.text)
      doc.text('Reservas (continuación)', margin, currentY)
      currentY += 8
    }

    // Draw card
    drawReservationCard(doc, reservation, margin, currentY, cardWidth, options)

    currentY += cardHeight + 5 // Card + spacing
  })

  // Footer on last page
  addFooter(doc, pageWidth, pageHeight)
}

function drawReservationCard(
  doc: any,
  reservation: EnhancedReservation,
  x: number,
  y: number,
  width: number,
  options: PDFExportOptions
) {
  // Card border
  doc.setDrawColor(...ENIGMA_COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(x, y, width, 'auto', 'S')

  // Status badge
  const statusColor = STATUS_COLORS[reservation.status as keyof typeof STATUS_COLORS] || ENIGMA_COLORS.muted
  doc.setFillColor(...statusColor)
  doc.rect(x, y, 30, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  const statusLabel = STATUS_LABELS[reservation.status as keyof typeof STATUS_LABELS] || reservation.status
  doc.text(statusLabel, x + 15, y + 4, { align: 'center' })

  // Time badge
  doc.setFillColor(...ENIGMA_COLORS.primary)
  doc.rect(x + 35, y, 25, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(format(new Date(reservation.time), 'HH:mm'), x + 47.5, y + 4, { align: 'center' })

  // Main info
  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(reservation.customerName, x + 5, y + 13)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...ENIGMA_COLORS.muted)
  doc.text(reservation.customerEmail, x + 5, y + 18)
  doc.text(reservation.customerPhone, x + 5, y + 23)

  // Tables and PAX
  doc.setTextColor(...ENIGMA_COLORS.text)
  doc.setFontSize(9)
  const tableDisplay = getTableDisplay(reservation)
  doc.text(`Mesa: ${tableDisplay}`, x + 110, y + 13)

  const paxDisplay = reservation.childrenCount && reservation.childrenCount > 0
    ? `${reservation.partySize} PAX (${reservation.partySize - reservation.childrenCount} adultos + ${reservation.childrenCount} niños)`
    : `${reservation.partySize} PAX`
  doc.text(paxDisplay, x + 110, y + 18)

  // Language
  if (reservation.preferredLanguage !== 'ES') {
    doc.setTextColor(...ENIGMA_COLORS.accent)
    doc.text(`Idioma: ${reservation.preferredLanguage}`, x + 110, y + 23)
  }

  let detailY = y + 28

  // Occasion
  if (reservation.occasion) {
    doc.setTextColor(...ENIGMA_COLORS.accent)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('🎉 Ocasión Especial: ', x + 5, detailY)
    doc.setFont('helvetica', 'normal')
    doc.text(reservation.occasion, x + 35, detailY)
    detailY += 5
  }

  // Dietary notes (DESTACADO)
  if (reservation.dietaryNotes) {
    doc.setFillColor(255, 243, 205) // Light yellow background
    doc.rect(x + 2, detailY - 3, width - 4, 6, 'F')
    doc.setTextColor(...ENIGMA_COLORS.danger)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠ ALERGIAS/DIETA: ', x + 5, detailY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...ENIGMA_COLORS.text)
    doc.text(reservation.dietaryNotes, x + 35, detailY)
    detailY += 8
  }

  // Special requests
  if (reservation.specialRequests) {
    doc.setTextColor(...ENIGMA_COLORS.text)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(`Nota: ${reservation.specialRequests}`, x + 5, detailY)
    detailY += 8
  }

  // Pre-order section
  if (reservation.hasPreOrder && reservation.preOrderItems && reservation.preOrderItems.length > 0) {
    doc.setDrawColor(...ENIGMA_COLORS.secondary)
    doc.setLineWidth(0.2)
    doc.line(x + 5, detailY, x + width - 5, detailY)
    detailY += 4

    doc.setTextColor(...ENIGMA_COLORS.success)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('PRE-PEDIDO:', x + 5, detailY)
    detailY += 5

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...ENIGMA_COLORS.text)
    doc.setFontSize(7)

    let total = 0
    reservation.preOrderItems.forEach(item => {
      const itemTotal = item.quantity * item.menuItem.price
      total += itemTotal
      const itemName = item.menuItem.nameEn || item.menuItem.name
      doc.text(`${item.quantity}x ${itemName}`, x + 8, detailY)
      doc.text(`€${itemTotal.toFixed(2)}`, x + width - 20, detailY, { align: 'right' })
      detailY += 4
    })

    // Total
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL PRE-PEDIDO:', x + 8, detailY)
    doc.text(`€${total.toFixed(2)}`, x + width - 20, detailY, { align: 'right' })
  }
}

function addFooter(doc: any, pageWidth: number, pageHeight: number) {
  doc.setDrawColor(...ENIGMA_COLORS.primary)
  doc.setLineWidth(0.5)
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20)

  doc.setTextColor(...ENIGMA_COLORS.muted)
  doc.setFontSize(7)
  doc.text('Carrer Justicia 6A, 03710 Calpe • +34 672 79 60 06 • info@enigmaconalma.com', pageWidth / 2, pageHeight - 13, { align: 'center' })
  doc.text('www.enigmaconalma.com', pageWidth / 2, pageHeight - 9, { align: 'center' })
  doc.setFontSize(6)
  doc.text('Documento confidencial - Uso interno exclusivo del restaurante', pageWidth / 2, pageHeight - 5, { align: 'center' })
}

function getTableDisplay(reservation: EnhancedReservation): string {
  if (reservation.table_ids && reservation.table_ids.length > 0) {
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

  return 'Sin asignar'
}
