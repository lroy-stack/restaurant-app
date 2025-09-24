'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
// Badge import removed - not used
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Crown,
  Shield,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Star,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Trash2,
  Eye,
  UserCheck
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  isVip: boolean
  totalReservations: number
  totalSpent: number
  lastVisit?: string
  preferences?: string
  allergies?: string[]
  gdprConsent: boolean
  marketingConsent: boolean
  createdAt: string
  updatedAt: string
  // Computed fields
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  averageSpending: number
  visitFrequency: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface CompactCustomerListProps {
  customers: Customer[]
  loading: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onStatusUpdate?: (id: string, status: string) => void
  onVipUpdate?: (id: string, isVip: boolean) => void
  onGdprExport?: (id: string) => void
  onGdprDelete?: (id: string) => void
  bulkMode?: boolean
}

// Customer status indicators - Ultra compact
const roleStyles = {
  CUSTOMER: '👤',
  ADMIN: '👑', 
  STAFF: '👨‍🍳'
}

const roleLabels = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Administrador', 
  STAFF: 'Personal'
}

const loyaltyStyles = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎'
}

const frequencyStyles = {
  LOW: '📅',
  MEDIUM: '📆',
  HIGH: '🔥'
}

const frequencyLabels = {
  LOW: 'Ocasional',
  MEDIUM: 'Regular',
  HIGH: 'Frecuente'
}

function CompactCustomerItem({ 
  customer, 
  isSelected = false,
  onSelectionChange,
  onStatusUpdate,
  onVipUpdate,
  onGdprExport,
  onGdprDelete,
  showCheckbox = false
}: {
  customer: Customer
  isSelected?: boolean
  onSelectionChange?: (id: string, checked: boolean) => void
  onStatusUpdate?: (id: string, status: string) => void
  onVipUpdate?: (id: string, isVip: boolean) => void
  onGdprExport?: (id: string) => void
  onGdprDelete?: (id: string) => void
  showCheckbox?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Format last visit to compact version
  const formatLastVisit = (dateStr?: string) => {
    if (!dateStr) return 'Nunca'
    
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `${diffDays}d`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`
    
    return `${Math.floor(diffDays / 365)}a`
  }

  // Format spending
  const formatSpending = (amount: number) => {
    if (amount >= 1000) return `€${(amount / 1000).toFixed(1)}k`
    return `€${amount}`
  }

  const handleVipToggle = () => {
    onVipUpdate?.(customer.id, !customer.isVip)
  }

  const handleGdprExport = () => {
    onGdprExport?.(customer.id)
  }

  const handleGdprDelete = () => {
    onGdprDelete?.(customer.id)
  }

  return (
    <div 
      className={cn(
        "group border rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/50",
        isSelected ? "ring-2 ring-primary border-primary" : "border-border",
        customer.isVip && "bg-yellow-50/30 dark:bg-yellow-950/20",
        customer.role === 'ADMIN' && "bg-purple-50/30 dark:bg-purple-950/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LINE 1: Essential Info - MOBILE FIRST */}
      <div className="flex items-center gap-2 p-3 pb-2">
        {/* Checkbox for bulk operations */}
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange?.(customer.id, !!checked)}
            className="flex-shrink-0"
          />
        )}
        
        {/* Role Emoji */}
        <span className="text-lg flex-shrink-0" title={roleLabels[customer.role]}>
          {roleStyles[customer.role]}
        </span>
        
        {/* Customer Name + VIP Badge */}
        <div className="font-medium text-foreground truncate min-w-0 flex-1 flex items-center gap-1">
          {customer.name}
          {customer.isVip && (
            <Crown className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
          )}
          {customer.role === 'ADMIN' && (
            <Shield className="w-3 h-3 text-purple-500 dark:text-purple-400" />
          )}
        </div>
        
        {/* Loyalty Tier - Compact */}
        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0" title={customer.loyaltyTier}>
          <span className="text-lg">{loyaltyStyles[customer.loyaltyTier]}</span>
        </div>
        
        {/* Last Visit - Ultra compact */}
        <div className="text-sm text-gray-600 flex-shrink-0 font-mono">
          {formatLastVisit(customer.lastVisit)}
        </div>
        
        {/* Total Spent */}
        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
          <DollarSign className="w-3 h-3" />
          <span>{formatSpending(customer.totalSpent)}</span>
        </div>
        
        {/* Visit Frequency */}
        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0" title={frequencyLabels[customer.visitFrequency]}>
          <span className="text-lg">{frequencyStyles[customer.visitFrequency]}</span>
        </div>
        
        {/* Actions Dropdown - Always visible on mobile, hover on desktop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`
                w-8 h-8 p-0 flex-shrink-0
                ${isHovered ? 'opacity-100' : 'opacity-70 md:opacity-30'}
                transition-opacity duration-200
              `}
            >
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Customer Actions */}
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              Ver Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleVipToggle}>
              {customer.isVip ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2 text-gray-600" />
                  Quitar VIP
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Hacer VIP
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Contact Actions */}
            <DropdownMenuItem>
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* GDPR Actions */}
            <DropdownMenuItem onClick={handleGdprExport}>
              <Download className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              Exportar Datos
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleGdprDelete}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Datos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* LINE 2: Secondary Info - COLLAPSIBLE ON MOBILE */}
      <div className="px-3 pb-3 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
        {/* Contact Info - Truncated on mobile */}
        <span className="flex items-center gap-1 truncate min-w-0">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{customer.email}</span>
        </span>
        
        {customer.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{customer.phone}</span>
          </span>
        )}
        
        {/* Reservations Count */}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{customer.totalReservations} reservas</span>
        </span>
        
        {/* Average Spending */}
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{formatSpending(customer.averageSpending)} prom</span>
        </span>
        
        {/* GDPR Status */}
        {customer.gdprConsent && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>GDPR</span>
          </span>
        )}
        
        {customer.marketingConsent && (
          <span className="flex items-center gap-1 text-blue-600">
            <Mail className="w-3 h-3" />
            <span>Marketing</span>
          </span>
        )}
        
        {/* Preferences */}
        {customer.preferences && (
          <span className="flex items-center gap-1 text-orange-600" title={customer.preferences}>
            <Star className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{customer.preferences}</span>
          </span>
        )}
        
        {/* Allergies */}
        {customer.allergies && customer.allergies.length > 0 && (
          <span className="flex items-center gap-1 text-red-600" title={customer.allergies.join(', ')}>
            <AlertCircle className="w-3 h-3" />
            <span>{customer.allergies.length} alérgeno{customer.allergies.length !== 1 ? 's' : ''}</span>
          </span>
        )}
      </div>
    </div>
  )
}

export function CompactCustomerList({ 
  customers, 
  loading,
  selectedIds = [],
  onSelectionChange,
  onStatusUpdate,
  onVipUpdate,
  onGdprExport,
  onGdprDelete,
  bulkMode = false
}: CompactCustomerListProps) {
  const handleItemSelection = (id: string, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter(sid => sid !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange(customers.map(c => c.id))
    } else {
      onSelectionChange([])
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-6 mt-2 ml-13">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Sin clientes
          </h3>
          <p className="text-gray-500">
            No hay clientes que coincidan con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Bulk Selection Header */}
        {bulkMode && onSelectionChange && (
          <div className="flex items-center gap-3 pb-3 border-b mb-4">
            <Checkbox
              checked={selectedIds.length === customers.length && customers.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedIds.length > 0 
                ? `${selectedIds.length} seleccionado${selectedIds.length !== 1 ? 's' : ''}`
                : 'Seleccionar todos'
              }
            </span>
          </div>
        )}
        
        {/* Compact List */}
        <div className="space-y-2">
          {customers.map((customer) => {
            const itemProps: {
              key: string
              customer: Customer
              isSelected?: boolean
              onSelectionChange?: (id: string, checked: boolean) => void
              onStatusUpdate?: (id: string, status: string) => void
              onVipUpdate?: (id: string, isVip: boolean) => void
              onGdprExport?: (id: string) => void
              onGdprDelete?: (id: string) => void
              showCheckbox?: boolean
            } = {
              key: customer.id,
              customer,
            }

            if (selectedIds.includes(customer.id)) {
              itemProps.isSelected = true
            }

            if (handleItemSelection) {
              itemProps.onSelectionChange = handleItemSelection
            }

            if (onStatusUpdate) {
              itemProps.onStatusUpdate = onStatusUpdate
            }

            if (onVipUpdate) {
              itemProps.onVipUpdate = onVipUpdate
            }

            if (onGdprExport) {
              itemProps.onGdprExport = onGdprExport
            }

            if (onGdprDelete) {
              itemProps.onGdprDelete = onGdprDelete
            }

            if (bulkMode) {
              itemProps.showCheckbox = true
            }

            return <CompactCustomerItem key={customer.id} {...itemProps} />
          })}
        </div>
      </CardContent>
    </Card>
  )
}