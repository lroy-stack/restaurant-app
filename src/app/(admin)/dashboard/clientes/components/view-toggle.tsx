'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  List,
  Download,
  Plus,
  Filter,
  FileText,
  Shield
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface ViewToggleProps {
  currentView: 'calendar' | 'list'
  totalCount: number
  loading?: boolean
  onNewCustomer?: () => void
  onExport?: () => void
  onGdprReport?: () => void
  showFilters?: boolean
  onToggleFilters?: () => void
}

export function ViewToggle({ 
  currentView, 
  totalCount,
  loading = false,
  onNewCustomer,
  onExport,
  onGdprReport,
  showFilters = false,
  onToggleFilters
}: ViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleViewChange = (newView: 'calendar' | 'list') => {
    const params = new URLSearchParams(searchParams.toString())
    if (newView === 'list') {
      params.delete('view') // Default is list
    } else {
      params.set('view', newView)
    }
    router.push(`/dashboard/clientes?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Left side - View Toggle + Count */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-white shadow-sm">
          <Button
            variant={currentView === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('list')}
            disabled={loading}
            className="flex items-center gap-2 transition-all duration-200"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </Button>
          
          <Button
            variant={currentView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('calendar')}
            disabled={loading}
            className="flex items-center gap-2 transition-all duration-200"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendario</span>
          </Button>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-medium">
            {totalCount} cliente{totalCount !== 1 ? 's' : ''}
          </Badge>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Filters toggle (mobile) */}
        {onToggleFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Ocultar' : 'Filtros'}
          </Button>
        )}

        {/* GDPR Report button */}
        {onGdprReport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGdprReport}
            disabled={loading || totalCount === 0}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">GDPR</span>
          </Button>
        )}

        {/* Export button */}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={loading || totalCount === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        )}

        {/* New customer button */}
        {onNewCustomer && (
          <Button
            size="sm"
            onClick={onNewCustomer}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </Button>
        )}
      </div>
    </div>
  )
}

// Hook para manejar el estado de la vista
export function useViewMode() {
  const searchParams = useSearchParams()
  const currentView = (searchParams.get('view') as 'calendar' | 'list') || 'list'
  
  return {
    currentView,
    isCalendarView: currentView === 'calendar',
    isListView: currentView === 'list'
  }
}