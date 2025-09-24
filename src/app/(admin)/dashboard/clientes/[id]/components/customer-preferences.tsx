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
  Clock,
  MapPin,
  Utensils,
  AlertTriangle,
  Edit2,
  Check,
  X,
  Heart,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerPreferencesProps {
  customer: Customer
  onUpdate: (field: string, value: unknown) => Promise<boolean>
  canEdit?: boolean
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

export function CustomerPreferences({
  customer,
  onUpdate,
  canEdit = true
}: CustomerPreferencesProps) {
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
        toast.success('Preferencia actualizada correctamente')
      }
    } catch {
      toast.error('Error al actualizar la preferencia')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
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
      <div className="space-y-3">
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
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isCurrentlyEditing ? (
          <div className="space-y-3">
            {type === 'select' && options ? (
              <Select
                value={tempValues[field] || ''}
                onValueChange={(val) => setTempValues({ ...tempValues, [field]: val })}
              >
                <SelectTrigger className="h-9">
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
                className="min-h-[80px] resize-none"
              />
            ) : isArray ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <div key={restriction.value} className="flex items-center space-x-3">
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
                      <Label htmlFor={restriction.value} className="text-sm cursor-pointer flex items-center gap-2">
                        <span>{restriction.icon}</span>
                        <span>{restriction.label}</span>
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
                className="h-9"
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
              <div className="flex flex-wrap gap-2">
                {(value || []).length > 0 ? (
                  (value || []).map((item: string) => {
                    const restriction = DIETARY_RESTRICTIONS.find(r => r.value === item)
                    return (
                      <Badge key={item} variant="secondary" className="text-xs">
                        <span className="mr-1">{restriction?.icon}</span>
                        {restriction?.label || item}
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">Sin restricciones</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-foreground">
                {field === 'language' ? getLanguageLabel(value) :
                 field === 'preferredLocation' ? getLocationLabel(value) :
                 value || 'No especificado'}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Preferencias del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preferencias Básicas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground border-b pb-2">
            Preferencias Básicas
          </h4>

          <EditableField
            field="language"
            label="Idioma Preferido"
            value={customer.language}
            icon={Globe}
            type="select"
            options={LANGUAGES}
          />

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
        </div>

        {/* Restricciones Alimentarias */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground border-b pb-2">
            Restricciones Alimentarias
          </h4>

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

        {/* Información Adicional */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            Información sobre Preferencias
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Las preferencias del cliente se utilizan para personalizar su experiencia
            y asegurar que sus necesidades específicas sean atendidas durante cada visita.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}