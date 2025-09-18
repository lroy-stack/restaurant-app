'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Eye,
  Waves,
  Utensils,
  Wine,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import type { Language } from '@/lib/validations/reservation-multilingual'

// Table interface matching Enigma Restaurant structure
interface Table {
  id: string
  number: number
  capacity: number
  zone: 'TERRACE_SEA_VIEW' | 'TERRACE_STANDARD' | 'INTERIOR_WINDOW' | 'INTERIOR_STANDARD' | 'BAR_AREA'
  shape: 'ROUND' | 'SQUARE' | 'RECTANGLE'
  status: 'available' | 'reserved' | 'occupied' | 'maintenance'
  position: { x: number; y: number }
  isActive: boolean
  features?: string[]
  currentReservation?: {
    customerName: string
    time: string
    partySize: number
  }
}

// Multilingual content
const content = {
  es: {
    title: "Selecciona tu Mesa",
    subtitle: "Elige la experiencia perfecta para tu visita",
    zones: {
      'TERRACE_SEA_VIEW': 'Terraza Vista al Mar',
      'TERRACE_STANDARD': 'Terraza Estándar', 
      'INTERIOR_WINDOW': 'Interior con Ventana',
      'INTERIOR_STANDARD': 'Interior Estándar',
      'BAR_AREA': 'Zona de Barra'
    },
    status: {
      available: 'Disponible',
      reserved: 'Reservada',
      occupied: 'Ocupada', 
      maintenance: 'Mantenimiento'
    },
    features: {
      'sea_view': 'Vista al mar',
      'quiet': 'Zona tranquila',
      'chef_interaction': 'Interacción con chef',
      'romantic': 'Ambiente romántico',
      'family_friendly': 'Familiar'
    },
    filters: {
      allZones: 'Todas las zonas',
      partySize: 'Comensales',
      showAvailable: 'Solo disponibles'
    },
    actions: {
      select: 'Seleccionar Mesa',
      selected: 'Mesa Seleccionada',
      viewDetails: 'Ver Detalles',
      resetView: 'Reiniciar Vista'
    }
  },
  en: {
    title: "Select Your Table", 
    subtitle: "Choose the perfect experience for your visit",
    zones: {
      'TERRACE_SEA_VIEW': 'Sea View Terrace',
      'TERRACE_STANDARD': 'Standard Terrace',
      'INTERIOR_WINDOW': 'Window Interior',
      'INTERIOR_STANDARD': 'Standard Interior', 
      'BAR_AREA': 'Bar Area'
    },
    status: {
      available: 'Available',
      reserved: 'Reserved',
      occupied: 'Occupied',
      maintenance: 'Maintenance'
    },
    features: {
      'sea_view': 'Sea view',
      'quiet': 'Quiet area',
      'chef_interaction': 'Chef interaction',
      'romantic': 'Romantic ambiance',
      'family_friendly': 'Family friendly'
    },
    filters: {
      allZones: 'All zones',
      partySize: 'Party size', 
      showAvailable: 'Available only'
    },
    actions: {
      select: 'Select Table',
      selected: 'Table Selected',
      viewDetails: 'View Details',
      resetView: 'Reset View'
    }
  }
}

interface InteractiveTableFloorPlanProps {
  tables: Table[]
  selectedTableId?: string
  partySize: number
  date: string
  time: string
  language: Language
  onTableSelect: (table: Table) => void
  onAvailabilityCheck?: (tableId: string, date: string, time: string) => Promise<boolean>
  className?: string
}

export function InteractiveTableFloorPlan({
  tables,
  selectedTableId,
  partySize,
  date,
  time,
  language,
  onTableSelect,
  onAvailabilityCheck,
  className = ''
}: InteractiveTableFloorPlanProps) {
  const [selectedZone, setSelectedZone] = useState<string>('ALL')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState<string | null>(null)

  const t = content[language]

  // Filter tables based on criteria
  const filteredTables = useMemo(() => {
    return tables.filter(table => {
      const zoneMatch = selectedZone === 'ALL' || table.zone === selectedZone
      const capacityMatch = table.capacity >= partySize
      const availabilityMatch = !showAvailableOnly || table.status === 'available'
      return zoneMatch && capacityMatch && availabilityMatch && table.isActive
    })
  }, [tables, selectedZone, partySize, showAvailableOnly])

  // Zone options
  const zoneOptions = [
    { value: 'ALL', label: t.filters.allZones },
    { value: 'TERRACE_SEA_VIEW', label: t.zones.TERRACE_SEA_VIEW },
    { value: 'TERRACE_STANDARD', label: t.zones.TERRACE_STANDARD },
    { value: 'INTERIOR_WINDOW', label: t.zones.INTERIOR_WINDOW },
    { value: 'INTERIOR_STANDARD', label: t.zones.INTERIOR_STANDARD },
    { value: 'BAR_AREA', label: t.zones.BAR_AREA }
  ]

  // Get status styling
  const getTableStyling = (table: Table) => {
    const isSelected = selectedTableId === table.id
    const isHovered = hoveredTable === table.id
    const isAvailable = table.status === 'available'
    const hasCapacity = table.capacity >= partySize
    
    if (isSelected) {
      return 'bg-green-100 border-green-500 shadow-lg scale-105 ring-2 ring-green-400'
    }
    
    if (!hasCapacity) {
      return 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
    }
    
    switch (table.status) {
      case 'available':
        return `bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer ${isHovered ? 'shadow-md scale-102' : ''}`
      case 'reserved':
        return 'bg-yellow-50 border-yellow-300 cursor-not-allowed opacity-75'
      case 'occupied':
        return 'bg-red-50 border-red-300 cursor-not-allowed opacity-75'
      case 'maintenance':
        return 'bg-blue-50 border-blue-300 cursor-not-allowed opacity-75'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'reserved':
        return <Clock className="h-3 w-3 text-yellow-600" />
      case 'occupied':
        return <AlertCircle className="h-3 w-3 text-red-600" />
      case 'maintenance':
        return <Settings className="h-3 w-3 text-blue-600" />
      default:
        return <CheckCircle className="h-3 w-3 text-green-600" />
    }
  }

  // Get zone icon
  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'TERRACE_SEA_VIEW':
        return <Eye className="h-4 w-4" />
      case 'TERRACE_STANDARD':
        return <Waves className="h-4 w-4" />
      case 'INTERIOR_WINDOW':
        return <Eye className="h-4 w-4" />
      case 'INTERIOR_STANDARD':
        return <Utensils className="h-4 w-4" />
      case 'BAR_AREA':
        return <Wine className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  // Handle table click
  const handleTableClick = async (table: Table) => {
    if (table.capacity < partySize || table.status !== 'available') {
      toast.error(
        language === 'es' 
          ? 'Esta mesa no está disponible para tu reserva'
          : 'This table is not available for your reservation'
      )
      return
    }

    // Real-time availability check if provided
    if (onAvailabilityCheck) {
      setCheckingAvailability(table.id)
      try {
        const isAvailable = await onAvailabilityCheck(table.id, date, time)
        if (!isAvailable) {
          toast.error(
            language === 'es'
              ? 'Mesa no disponible en el horario seleccionado'
              : 'Table not available at selected time'
          )
          return
        }
      } catch (error) {
        toast.error(
          language === 'es'
            ? 'Error al verificar disponibilidad'
            : 'Error checking availability'
        )
        return
      } finally {
        setCheckingAvailability(null)
      }
    }

    onTableSelect(table)
    toast.success(
      language === 'es'
        ? `Mesa ${table.number} seleccionada`
        : `Table ${table.number} selected`
    )
  }

  // Table component
  const TableComponent = ({ table }: { table: Table }) => (
    <motion.div
      className={`
        relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
        ${getTableStyling(table)}
        ${table.shape === 'ROUND' ? 'rounded-full' : ''}
        min-w-[80px] min-h-[80px] flex flex-col items-center justify-center
      `}
      style={{
        left: `${table.position.x}%`,
        top: `${table.position.y}%`,
        transform: `scale(${zoom / 100})`
      }}
      onClick={() => handleTableClick(table)}
      onMouseEnter={() => setHoveredTable(table.id)}
      onMouseLeave={() => setHoveredTable(null)}
      whileHover={{ scale: table.capacity >= partySize ? 1.05 : 1 }}
      whileTap={{ scale: table.capacity >= partySize ? 0.95 : 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Table number and status */}
      <div className="flex items-center gap-1 mb-1">
        {getStatusIcon(table.status)}
        <span className="font-semibold text-sm">#{table.number}</span>
      </div>
      
      {/* Capacity */}
      <div className="text-xs text-gray-600 flex items-center gap-1">
        <Users className="h-3 w-3" />
        {table.capacity}
      </div>
      
      {/* Zone indicator */}
      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
        {getZoneIcon(table.zone)}
      </div>
      
      {/* Loading indicator */}
      {checkingAvailability === table.id && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      {/* Selection indicator */}
      {selectedTableId === table.id && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t.subtitle}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2 min-w-[50px] text-center">{zoom}%</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                disabled={zoom >= 150}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Reset button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setZoom(100)
                setSelectedZone('ALL')
                setShowAvailableOnly(false)
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zoneOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">{t.filters.showAvailable}</span>
          </label>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {partySize} {language === 'es' ? 'personas' : 'people'}
          </Badge>
        </div>
        
        {/* Floor Plan */}
        <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 min-h-[500px] overflow-hidden">
          <AnimatePresence>
            {filteredTables.map((table) => (
              <TableComponent key={table.id} table={table} />
            ))}
          </AnimatePresence>
          
          {filteredTables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {language === 'es' ? 'No hay mesas disponibles' : 'No tables available'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'es' 
                    ? 'Prueba con otros filtros o horarios'
                    : 'Try different filters or times'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-green-300 border rounded"></div>
            <span>{t.status.available}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-yellow-300 border rounded"></div>
            <span>{t.status.reserved}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-red-300 border rounded"></div>
            <span>{t.status.occupied}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-blue-300 border rounded"></div>
            <span>{t.status.maintenance}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InteractiveTableFloorPlan