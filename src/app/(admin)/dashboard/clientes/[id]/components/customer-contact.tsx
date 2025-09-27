'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Clock,
  Utensils,
  AlertTriangle,
  Edit2,
  Check,
  X,
  Heart
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerContactProps {
  customer: Customer
  onUpdate: (field: string, value: unknown) => Promise<boolean>
  isEditing: boolean
  canEdit: boolean
}

const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetariano', icon: '🥬' },
  { value: 'vegan', label: 'Vegano', icon: '🌱' },
  { value: 'gluten_free', label: 'Sin Gluten', icon: '🚫🌾' },
  { value: 'lactose_free', label: 'Sin Lactosa', icon: '🚫🥛' },
  { value: 'halal', label: 'Halal', icon: '☪️' },
  { value: 'kosher', label: 'Kosher', icon: '✡️' }
]

const LANGUAGES = [
  { value: 'ES', label: 'Español' },
  { value: 'EN', label: 'English' },
  { value: 'DE', label: 'Deutsch' }
]

const TABLE_LOCATIONS = [
  { value: 'TERRACE_CAMPANARI', label: 'Terraza Campanari' },
  { value: 'SALA_VIP', label: 'Sala VIP' },
  { value: 'TERRACE_JUSTICIA', label: 'Terraza Justicia' },
  { value: 'SALA_PRINCIPAL', label: 'Sala Principal' }
]

export function CustomerContact({
  customer,
  onUpdate,
  canEdit
}: CustomerContactProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Record<string, unknown>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  const handleEdit = (field: string, currentValue: unknown) => {
    if (!canEdit) {
      toast.error('No tienes permisos para editar')
      return
    }
    setEditingField(field)
    setTempValues({ [field]: currentValue })
  }

  const handleSave = async (field: string) => {
    setIsUpdating(true)
    try {
      const success = await onUpdate(field, tempValues[field])
      if (success) {
        setEditingField(null)
        setTempValues({})
        toast.success('Campo actualizado correctamente')
      }
    } catch (error) {
      toast.error('Error al actualizar el campo')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
  }

  const formatPhoneDisplay = (phone?: string) => {
    if (!phone) return 'No registrado'
    // Format Spanish phone numbers
    if (phone.match(/^(\+34|34)/)) {
      const cleaned = phone.replace(/^(\+34|34)/, '').trim()
      return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

  const formatDateOfBirth = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'No registrado'
    return new Date(dateOfBirth).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getLanguageLabel = (language: string) => {
    return LANGUAGES.find(l => l.value === language)?.label || language
  }

  const getLocationLabel = (location?: string) => {
    if (!location) return 'Sin preferencia'
    return TABLE_LOCATIONS.find(l => l.value === location)?.label || location
  }

  const EditableField = ({
    field,
    label,
    value,
    icon: Icon,
    type = 'text',
    options = undefined,
    multiline = false,
    isArray = false
  }: {
    field: string
    label: string
    value: unknown
    icon: React.ComponentType<{ className?: string }>
    type?: string
    options?: { value: string; label: string }[]
    multiline?: boolean
    isArray?: boolean
  }) => {
    const isCurrentlyEditing = editingField === field

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
          </Label>

          {canEdit && !isCurrentlyEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(field, value)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isCurrentlyEditing ? (
          <div className="space-y-2">
            {type === 'select' && options ? (
              <Select
                value={tempValues[field] || ''}
                onValueChange={(val) => setTempValues({ ...tempValues, [field]: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : multiline ? (
              <Textarea
                value={tempValues[field] || ''}
                onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
                placeholder={`Ingrese ${label.toLowerCase()}`}
                rows={3}
              />
            ) : isArray ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <div key={restriction.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction.value}
                        checked={(tempValues[field] || []).includes(restriction.value)}
                        onCheckedChange={(checked) => {
                          const currentArray = tempValues[field] || []
                          const newArray = checked
                            ? [...currentArray, restriction.value]
                            : currentArray.filter((item: string) => item !== restriction.value)
                          setTempValues({ ...tempValues, [field]: newArray })
                        }}
                      />
                      <Label htmlFor={restriction.value} className="text-sm cursor-pointer">
                        {restriction.icon} {restriction.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Input
                type={type}
                value={tempValues[field] || ''}
                onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
                placeholder={`Ingrese ${label.toLowerCase()}`}
              />
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleSave(field)}
                disabled={isUpdating}
                className="h-8"
              >
                {isUpdating ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isUpdating}
                className="h-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[36px] flex items-center">
            {isArray ? (
              <div className="flex flex-wrap gap-1">
                {(value || []).length > 0 ? (
                  (value || []).map((item: string) => {
                    const restriction = DIETARY_RESTRICTIONS.find(r => r.value === item)
                    return (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {restriction?.icon} {restriction?.label || item}
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">Sin restricciones</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-foreground">
                {field === 'phone' ? formatPhoneDisplay(value) :
                 field === 'dateOfBirth' ? formatDateOfBirth(value) :
                 field === 'language' ? getLanguageLabel(value) :
                 field === 'preferredLocation' ? getLocationLabel(value) :
                 value || 'No registrado'}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Contacto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Contact Info */}
        <div className="space-y-4">
          <EditableField
            field="email"
            label="Email"
            value={customer.email}
            icon={Mail}
            type="email"
          />

          <EditableField
            field="phone"
            label="Teléfono"
            value={customer.phone}
            icon={Phone}
            type="tel"
          />

          <EditableField
            field="dateOfBirth"
            label="Fecha de Nacimiento"
            value={customer.dateOfBirth}
            icon={Calendar}
            type="date"
          />

          <EditableField
            field="language"
            label="Idioma Preferido"
            value={customer.language}
            icon={Globe}
            type="select"
            options={LANGUAGES}
          />
        </div>

        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Preferencias
          </h4>

          <div className="space-y-4">
            <EditableField
              field="preferredTime"
              label="Hora Preferida"
              value={customer.preferredTime}
              icon={Clock}
              type="time"
            />

            <EditableField
              field="preferredLocation"
              label="Ubicación Preferida"
              value={customer.preferredLocation}
              icon={MapPin}
              type="select"
              options={TABLE_LOCATIONS}
            />

            <EditableField
              field="dietaryRestrictions"
              label="Restricciones Dietéticas"
              value={customer.dietaryRestrictions}
              icon={Utensils}
              isArray={true}
            />

            <EditableField
              field="allergies"
              label="Alergias Adicionales"
              value={customer.allergies}
              icon={AlertTriangle}
              multiline={true}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente desde:</span>
              <div className="font-medium">
                {new Date(customer.createdAt).toLocaleDateString('es-ES')}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Última actualización:</span>
              <div className="font-medium">
                {new Date(customer.updatedAt).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}