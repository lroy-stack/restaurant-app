'use client'

import { useState, useEffect } from 'react'
// Removed React Hook Form - now using simple useState
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Mail,
  Phone,
  Search,
  Check,
  ChevronsUpDown,
  UserPlus,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isVip: boolean
  totalVisits: number
  language: string
}

interface CustomerSelectionProps {
  customers: Customer[]
  preselectedCustomerId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  customerId: string
  preferredLanguage: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onCustomerIdChange: (value: string) => void
  onLanguageChange: (value: string) => void
}

export function CustomerSelection({
  customers,
  preselectedCustomerId,
  firstName,
  lastName,
  email,
  phone,
  customerId,
  preferredLanguage,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCustomerIdChange,
  onLanguageChange
}: CustomerSelectionProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isNewCustomer, setIsNewCustomer] = useState(true)

  // Pre-select customer if provided
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === preselectedCustomerId)
      if (customer) {
        setSelectedCustomer(customer)
        setIsNewCustomer(false)
        populateCustomerData(customer)
        toast.success(`Cliente ${customer.firstName} ${customer.lastName} preseleccionado`)
      }
    }
  }, [preselectedCustomerId, customers])

  const populateCustomerData = (customer: Customer) => {
    onFirstNameChange(customer.firstName)
    onLastNameChange(customer.lastName)
    onEmailChange(customer.email)
    onPhoneChange(customer.phone || '')
    onLanguageChange(customer.language)
    onCustomerIdChange(customer.id)
  }

  const clearCustomerData = () => {
    onFirstNameChange('')
    onLastNameChange('')
    onEmailChange('')
    onPhoneChange('')
    onLanguageChange('ES')
    onCustomerIdChange('')
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsNewCustomer(false)
    populateCustomerData(customer)
    setOpen(false)
    toast.success(`Cliente ${customer.firstName} ${customer.lastName} seleccionado`)
  }

  const handleNewCustomer = () => {
    setSelectedCustomer(null)
    setIsNewCustomer(true)
    clearCustomerData()
    setOpen(false)
    toast.info('Modo nuevo cliente activado')
  }

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Cliente
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecciona un cliente existente o crea uno nuevo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isNewCustomer ? "default" : "secondary"}>
            {isNewCustomer ? "Nuevo Cliente" : "Cliente Existente"}
          </Badge>
          {selectedCustomer?.isVip && (
            <Badge variant="outline" className="border-yellow-400 text-yellow-600">
              <Star className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          )}
        </div>
      </div>

      {/* Customer Search/Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm">Cliente</Label>
              <Select value={customerId || 'new'} onValueChange={(value) => {
                onCustomerIdChange(value)
                if (value === 'new') {
                  handleNewCustomer()
                } else {
                  const customer = customers.find(c => c.id === value)
                  if (customer) {
                    handleCustomerSelect(customer)
                  }
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente existente o crear nuevo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Nuevo Cliente</span>
                    </div>
                  </SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{customer.firstName} {customer.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <Button
                type="button"
                variant="outline"
                onClick={handleNewCustomer}
                className="h-10"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            )}
          </div>

          {selectedCustomer && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.email} • {selectedCustomer.totalVisits} visitas
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedCustomer.isVip && (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                      VIP
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {selectedCustomer.language}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Fields - Simple inputs with useState */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Nombre del cliente"
            disabled={!isNewCustomer}
            className="h-10"
          />
        </div>

        <div>
          <Label htmlFor="lastName">Apellidos *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Apellidos del cliente"
            disabled={!isNewCustomer}
            className="h-10"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            type="email"
            placeholder="email@ejemplo.com"
            disabled={!isNewCustomer}
            className="h-10"
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            type="tel"
            placeholder="+34 666 777 888"
            disabled={!isNewCustomer}
            className="h-10"
          />
        </div>
      </div>

      {isNewCustomer && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Este cliente se creará automáticamente al confirmar la reserva
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}