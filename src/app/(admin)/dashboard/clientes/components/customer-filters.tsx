'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, subMonths, startOfMonth } from 'date-fns'
import { CalendarIcon, Search, X, Filter, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerFiltersProps {
  loading?: boolean
  currentFilters: {
    status?: string
    vipStatus?: string
    search?: string
    dateRange?: string
  }
}

const statusOptions = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INACTIVE', label: 'Inactivos' },
  { value: 'NEW', label: 'Nuevos (Este Mes)' }
]

const vipOptions = [
  { value: 'all', label: 'Todos los Clientes' },
  { value: 'true', label: 'Solo VIP' },
  { value: 'false', label: 'Solo Regulares' }
]

const loyaltyOptions = [
  { value: 'all', label: 'Todos los Niveles' },
  { value: 'BRONZE', label: 'Bronce' },
  { value: 'SILVER', label: 'Plata' },
  { value: 'GOLD', label: 'Oro' },
  { value: 'PLATINUM', label: 'Platino' }
]

const dateRangeOptions = [
  { value: 'all', label: 'Todo el Tiempo' },
  { value: 'last_month', label: 'Último Mes' },
  { value: 'last_3_months', label: 'Últimos 3 Meses' },
  { value: 'last_6_months', label: 'Últimos 6 Meses' },
  { value: 'last_year', label: 'Último Año' },
  { value: 'custom', label: 'Rango Personalizado' }
]

const frequencyOptions = [
  { value: 'all', label: 'Todas las Frecuencias' },
  { value: 'HIGH', label: 'Alta Frecuencia' },
  { value: 'MEDIUM', label: 'Frecuencia Media' },
  { value: 'LOW', label: 'Baja Frecuencia' }
]

export function CustomerFilters({ 
  loading = false, 
  currentFilters 
}: CustomerFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/dashboard/clientes?${params.toString()}`)
  }

  const handleSearch = () => {
    updateFilter('search', searchTerm || undefined)
  }

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomDateRange(true)
      return
    }
    
    setShowCustomDateRange(false)
    updateFilter('dateRange', value)
  }

  const handleCustomDateRange = () => {
    if (dateRange.from && dateRange.to) {
      const customRange = `${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`
      updateFilter('dateRange', customRange)
      setShowCustomDateRange(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDateRange({ from: undefined, to: undefined })
    setShowCustomDateRange(false)
    router.push('/dashboard/clientes')
  }

  const activeFiltersCount = [
    currentFilters.search,
    currentFilters.status && currentFilters.status !== 'all' ? currentFilters.status : null,
    currentFilters.vipStatus && currentFilters.vipStatus !== 'all' ? currentFilters.vipStatus : null,
    currentFilters.dateRange && currentFilters.dateRange !== 'all' ? currentFilters.dateRange : null
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label className="text-sm font-medium">Filtros y Búsqueda CRM</Label>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="space-y-1 lg:col-span-2">
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

        {/* Status Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Estado del Cliente</Label>
          <Select
            value={currentFilters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger className="text-sm">
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

        {/* VIP Status Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Estado VIP</Label>
          <Select
            value={currentFilters.vipStatus || 'all'}
            onValueChange={(value) => updateFilter('vipStatus', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vipOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loyalty Tier Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Nivel de Lealtad</Label>
          <Select
            value={searchParams.get('loyaltyTier') || 'all'}
            onValueChange={(value) => updateFilter('loyaltyTier', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {loyaltyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Período de Actividad</Label>
          <Select
            value={showCustomDateRange ? 'custom' : (currentFilters.dateRange || 'all')}
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomDateRange && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <Label className="text-sm font-medium mb-3 block">Seleccionar Rango Personalizado</Label>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal text-sm",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yy") : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal text-sm",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yy") : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleCustomDateRange}
                disabled={!dateRange.from || !dateRange.to}
              >
                Aplicar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowCustomDateRange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

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
          {currentFilters.vipStatus && currentFilters.vipStatus !== 'all' && (
            <Badge variant="outline" className="text-xs">
              VIP: {vipOptions.find(v => v.value === currentFilters.vipStatus)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('vipStatus', undefined)}
              />
            </Badge>
          )}
          {currentFilters.dateRange && currentFilters.dateRange !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Período: {dateRangeOptions.find(d => d.value === currentFilters.dateRange)?.label || 'Personalizado'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('dateRange', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}