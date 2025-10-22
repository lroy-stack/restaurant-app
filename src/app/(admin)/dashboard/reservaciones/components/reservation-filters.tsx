'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBusinessHours } from '@/hooks/useBusinessHours'

interface Table {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_1' | 'VIP_ROOM' | 'TERRACE_2' | 'MAIN_ROOM'
}

interface ReservationFiltersProps {
  tables: Table[]
  loading?: boolean
  error?: string | null
  currentFilters: {
    date?: string
    status?: string
    tableId?: string
    search?: string
  }
}

const statusOptions = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'SEATED', label: 'En Mesa' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: 'NO_SHOW', label: 'No Show' }
]

const locationOptions = [
  { value: 'all', label: 'Todas las Ubicaciones' },
  { value: 'TERRACE_1', label: 'Terraza 1' },
  { value: 'TERRACE_2', label: 'Terraza 2' },
  { value: 'MAIN_ROOM', label: 'Sala Principal' },
  { value: 'VIP_ROOM', label: 'Sala VIP' }
]

export function ReservationFilters({
  tables,
  loading = false,
  error = null,
  currentFilters
}: ReservationFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')
  const [date, setDate] = useState<Date | undefined>(
    currentFilters.date ? new Date(currentFilters.date) : undefined
  )

  // Sync local state with URL parameters when they change
  useEffect(() => {
    setDate(currentFilters.date ? new Date(currentFilters.date) : undefined)
    setSearchTerm(currentFilters.search || '')
  }, [currentFilters.date, currentFilters.search])

  // Business hours for calendar validation
  const {
    closedDays,
    minAdvanceMinutes
  } = useBusinessHours()

  // Custom date validation for filters (allows ALL dates including past and closed days)
  const isDateDisabledForFilter = (date: Date): boolean => {
    // Allow ALL dates for filtering - no restrictions for historical view
    return false
  }

  const getDisabledReasonForFilter = (date: Date): string => {
    if (closedDays.includes(date.getDay())) {
      const dayOfWeek = date.getDay()
      const dayNames = {
        0: 'domingos',
        1: 'lunes',
        2: 'martes',
        3: 'miércoles',
        4: 'jueves',
        5: 'viernes',
        6: 'sábados'
      }
      const dayName = dayNames[dayOfWeek as keyof typeof dayNames]
      return `Los ${dayName} permanecemos cerrados`
    }
    return ''
  }

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/dashboard/reservaciones?${params.toString()}`)
  }

  const handleSearch = () => {
    updateFilter('search', searchTerm || undefined)
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    updateFilter('date', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDate(undefined)
    router.push('/dashboard/reservaciones')
  }

  const activeFiltersCount = [
    currentFilters.search,
    currentFilters.status && currentFilters.status !== 'all' ? currentFilters.status : null,
    currentFilters.tableId && currentFilters.tableId !== 'all' ? currentFilters.tableId : null,
    currentFilters.date
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label className="text-sm font-medium">Filtros y Búsqueda</Label>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar Filtros
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <Label htmlFor="search" className="text-xs">Búsqueda</Label>
          <div className="flex gap-1">
            <Input
              id="search"
              placeholder="Nombre, email, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleSearch}>
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1 min-w-0">
          <Label className="text-xs">Fecha</Label>
          <CustomCalendar
            value={date ? format(date, 'yyyy-MM-dd') : ''}
            onChange={(dateString) => handleDateChange(dateString ? new Date(dateString) : undefined)}
            placeholder="Seleccionar fecha"
            className="h-9"
            closedDays={[]}
            minAdvanceMinutes={0}
            isDateDisabled={() => false}
            allowPastDates={true}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1 min-w-0">
          <Label className="text-xs">Estado</Label>
          <Select
            value={currentFilters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger className="text-sm min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table Filter */}
        <div className="space-y-1 min-w-0 lg:col-span-2">
          <Label className="text-xs">Mesa</Label>
          <Select
            value={currentFilters.tableId || 'all'}
            onValueChange={(value) => updateFilter('tableId', value)}
            disabled={loading}
          >
            <SelectTrigger className="text-sm min-w-0">
              <SelectValue placeholder={loading ? "Cargando..." : error ? "Error" : "Todas"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">Todas las Mesas</SelectItem>
              <SelectItem value="unassigned">Sin Mesa</SelectItem>
              {!loading && !error && (
                <div className="max-h-48 overflow-y-auto">
                  {tables.map((table) => {
                    const locationLabel = {
                      'TERRACE_1': 'T.Camp',
                      'TERRACE_2': 'T.Just',
                      'MAIN_ROOM': 'S.Prin',
                      'VIP_ROOM': 'VIP'
                    }[table.location] || table.location

                    return (
                      <SelectItem key={table.id} value={table.id}>
                        M{table.number} • {table.capacity}P • {locationLabel}
                      </SelectItem>
                    )
                  })}
                </div>
              )}
              {error && (
                <SelectItem value="error" disabled>
                  Error: {error}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Label className="text-xs text-muted-foreground">Filtros Activos:</Label>
          {currentFilters.search && (
            <Badge variant="outline" className="text-xs">
              Búsqueda: {currentFilters.search}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => {
                  setSearchTerm('')
                  updateFilter('search', undefined)
                }}
              />
            </Badge>
          )}
          {currentFilters.status && currentFilters.status !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Estado: {statusOptions.find(s => s.value === currentFilters.status)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('status', undefined)}
              />
            </Badge>
          )}
          {currentFilters.tableId && currentFilters.tableId !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Mesa: {tables.find(t => t.id === currentFilters.tableId)?.number || 'Desconocida'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('tableId', undefined)}
              />
            </Badge>
          )}
          {currentFilters.date && (
            <Badge variant="outline" className="text-xs">
              Fecha: {format(new Date(currentFilters.date), "dd/MM/yyyy", { locale: es })}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => {
                  setDate(undefined)
                  updateFilter('date', undefined)
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}