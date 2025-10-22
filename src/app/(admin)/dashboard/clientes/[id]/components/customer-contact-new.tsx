'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Clock,
  Utensils,
  AlertTriangle,
  Save,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerContactNewProps {
  customer: Customer
  onUpdate: (field: string, value: unknown) => Promise<boolean>
  canEdit: boolean
}

const LANGUAGES = [
  { value: 'ES', label: 'Español' },
  { value: 'EN', label: 'English' },
  { value: 'DE', label: 'Deutsch' }
]

const TABLE_LOCATIONS = [
  { value: 'TERRACE_1', label: 'Terraza 1' },
  { value: 'VIP_ROOM', label: 'Sala VIP' },
  { value: 'TERRACE_2', label: 'Terraza 2' },
  { value: 'MAIN_ROOM', label: 'Sala Principal' }
]

const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetariano', icon: '🥬' },
  { value: 'vegan', label: 'Vegano', icon: '🌱' },
  { value: 'gluten_free', label: 'Sin Gluten', icon: '🚫🌾' },
  { value: 'lactose_free', label: 'Sin Lactosa', icon: '🚫🥛' },
  { value: 'halal', label: 'Halal', icon: '☪️' },
  { value: 'kosher', label: 'Kosher', icon: '✡️' }
]

export function CustomerContactNew({
  customer,
  onUpdate,
  canEdit
}: CustomerContactNewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: customer.email,
    phone: customer.phone || '',
    dateOfBirth: customer.dateOfBirth || '',
    language: customer.language,
    preferredTime: customer.preferredTime || '',
    preferredLocation: customer.preferredLocation || '',
    dietaryRestrictions: customer.dietaryRestrictions || [],
    allergies: customer.allergies || ''
  })

  const handleSave = async () => {
    try {
      // Single PATCH with all fields
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setIsEditing(false)
        toast.success('Información actualizada correctamente')

        // Update parent component state instead of full page reload
        if (result.customer && onUpdate) {
          // Trigger parent refetch with updated data
          Object.keys(formData).forEach(key => {
            onUpdate(key, formData[key as keyof typeof formData])
          })
        }
      } else {
        toast.error('Error al actualizar cliente')
      }
    } catch (error) {
      toast.error('Error al actualizar la información')
    }
  }

  const handleCancel = () => {
    setFormData({
      email: customer.email,
      phone: customer.phone || '',
      dateOfBirth: customer.dateOfBirth || '',
      language: customer.language,
      preferredTime: customer.preferredTime || '',
      preferredLocation: customer.preferredLocation || '',
      dietaryRestrictions: customer.dietaryRestrictions || [],
      allergies: customer.allergies || ''
    })
    setIsEditing(false)
  }

  const formatPhoneDisplay = (phone?: string) => {
    if (!phone) return 'No registrado'
    if (phone.match(/^(\+34|34)/)) {
      const cleaned = phone.replace(/^(\+34|34)/, '').trim()
      return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

  const getLanguageLabel = (language: string) => {
    return LANGUAGES.find(l => l.value === language)?.label || language
  }

  const getLocationLabel = (location?: string) => {
    if (!location) return 'Sin preferencia'
    return TABLE_LOCATIONS.find(l => l.value === location)?.label || location
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Información de Contacto
            </CardTitle>
            <CardDescription>
              Datos personales y preferencias del cliente
            </CardDescription>
          </div>
          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          /* FORMULARIO DE EDICIÓN - PATRÓN SHADCN */
          <div className="grid gap-6">
            {/* CONTACTO BÁSICO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 123 456 789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Idioma Preferido</Label>
                <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* PREFERENCIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="preferredTime">Hora Preferida</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="preferredLocation">Ubicación Preferida</Label>
                <Select value={formData.preferredLocation} onValueChange={(value) => setFormData({ ...formData, preferredLocation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {TABLE_LOCATIONS.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Describir alergias específicas"
              />
            </div>
          </div>
        ) : (
          /* VISTA DE SOLO LECTURA - COMPACTA Y HORIZONTAL */
          <div className="grid gap-4">
            {/* CONTACTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Teléfono</div>
                  <div className="text-sm text-muted-foreground">{formatPhoneDisplay(customer.phone)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Fecha de Nacimiento</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.dateOfBirth
                      ? new Date(customer.dateOfBirth).toLocaleDateString('es-ES')
                      : 'No registrado'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Idioma</div>
                  <div className="text-sm text-muted-foreground">{getLanguageLabel(customer.language)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* PREFERENCIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Hora Preferida</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.preferredTime || 'No registrado'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Ubicación Preferida</div>
                  <div className="text-sm text-muted-foreground">{getLocationLabel(customer.preferredLocation)}</div>
                </div>
              </div>
            </div>

            {/* RESTRICCIONES DIETÉTICAS */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Restricciones Dietéticas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {customer.dietaryRestrictions && customer.dietaryRestrictions.length > 0 ? (
                  customer.dietaryRestrictions.map((restriction) => {
                    const item = DIETARY_RESTRICTIONS.find(r => r.value === restriction)
                    return (
                      <Badge key={restriction} variant="secondary" className="text-xs">
                        {item?.icon} {item?.label || restriction}
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">Sin restricciones</span>
                )}
              </div>
            </div>

            {/* ALERGIAS */}
            {customer.allergies && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">Alergias</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{customer.allergies}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {isEditing && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}