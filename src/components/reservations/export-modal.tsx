// components/reservations/export-modal.tsx - Modular Export Modal
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Settings,
  Users
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePDFExport, type ExportDateRange, type PDFExportOptions } from '@/hooks/usePDFExport'
import type { Reservation } from '@/types/reservation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  reservations: Reservation[]
  totalCount: number
}

interface DateRangeOption {
  value: ExportDateRange
  label: string
  description: string
  icon: React.ReactNode
  badge?: string
}

export function ExportModal({ isOpen, onClose, reservations, totalCount }: ExportModalProps) {
  const { generatePDF, isExporting, filterReservationsByDateRange } = usePDFExport()

  const [selectedRange, setSelectedRange] = useState<ExportDateRange>('today')
  const [includeDetails, setIncludeDetails] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [sortBy, setSortBy] = useState<'time' | 'name' | 'table'>('time')

  // Calculate preview counts for each date range
  const today = new Date()
  const dateRangeOptions: DateRangeOption[] = [
    {
      value: 'today',
      label: 'Hoy',
      description: format(today, "EEEE dd 'de' MMMM", { locale: es }),
      icon: <Calendar className="w-4 h-4" />,
      badge: filterReservationsByDateRange(reservations, 'today').length.toString()
    },
    {
      value: 'tomorrow',
      label: 'Mañana',
      description: format(addDays(today, 1), "EEEE dd 'de' MMMM", { locale: es }),
      icon: <Clock className="w-4 h-4" />,
      badge: filterReservationsByDateRange(reservations, 'tomorrow').length.toString()
    },
    {
      value: 'week',
      label: 'Esta Semana',
      description: `${format(startOfWeek(today, { weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(today, { weekStartsOn: 1 }), 'dd/MM')}`,
      icon: <Users className="w-4 h-4" />,
      badge: filterReservationsByDateRange(reservations, 'week').length.toString()
    }
  ]

  const selectedCount = parseInt(dateRangeOptions.find(opt => opt.value === selectedRange)?.badge || '0')

  const handleExport = async () => {
    const options: PDFExportOptions = {
      dateRange: selectedRange,
      includeDetails,
      includeNotes,
      sortBy
    }

    const result = await generatePDF(reservations, options)

    if (result.success) {
      if (result.error) {
        // Popup bloqueado, se descargó en su lugar
        toast.warning(result.error)
      } else {
        toast.success('PDF abierto para imprimir')
      }
      onClose()
    } else {
      toast.error(result.error || 'Error al generar PDF')
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="w-5 h-5 text-primary" />
            Exportar Reservas
          </DialogTitle>
          <DialogDescription>
            Abre el PDF en una nueva ventana lista para imprimir.
            <span className="block mt-1 text-xs text-muted-foreground">
              Total disponible: {totalCount} reservas
            </span>
            <span className="block mt-1 text-xs text-amber-600">
              💡 El PDF se abrirá con la ventana de impresión automáticamente
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Período a Exportar</Label>
            <RadioGroup
              value={selectedRange}
              onValueChange={(value: ExportDateRange) => setSelectedRange(value)}
              className="space-y-2"
            >
              {dateRangeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className={cn(
                      "flex items-center justify-between flex-1 cursor-pointer p-3 rounded-lg border transition-colors",
                      selectedRange === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant={selectedRange === option.value ? "default" : "secondary"}>
                      {option.badge} reservas
                    </Badge>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Opciones de Exportación</Label>
            </div>

            <div className="grid grid-cols-1 gap-3 pl-6">
              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Ordenar por:</Label>
                <Select value={sortBy} onValueChange={(value: 'time' | 'name' | 'table') => setSortBy(value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Hora de Reserva</SelectItem>
                    <SelectItem value="name">Nombre del Cliente</SelectItem>
                    <SelectItem value="table">Número de Mesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include Notes */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeNotes"
                  checked={includeNotes}
                  onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                />
                <Label htmlFor="includeNotes" className="text-sm">
                  Incluir notas y solicitudes especiales
                </Label>
              </div>

              {/* Include Details */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDetails"
                  checked={includeDetails}
                  onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                />
                <Label htmlFor="includeDetails" className="text-sm">
                  Incluir información de contacto
                </Label>
              </div>
            </div>
          </div>

          {/* Preview Summary */}
          {selectedCount > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Vista Previa</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Se exportarán <strong>{selectedCount} reservación{selectedCount !== 1 ? 'es' : ''}</strong> del período seleccionado.
                {selectedCount > 20 && (
                  <div className="text-amber-600 mt-1">
                    ⚠️ Documento largo - puede dividirse en múltiples páginas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedCount === 0}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </div>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Abrir e Imprimir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}