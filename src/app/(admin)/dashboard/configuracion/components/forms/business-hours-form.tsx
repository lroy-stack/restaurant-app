/**
 * BUSINESS HOURS FORM
 * Formulario para gestión de horarios por día
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Save, X } from 'lucide-react'
import type { BusinessHoursConfig } from '../../types/config.types'
import { sortDaysSpanishWeek, getDayName } from '@/lib/business-hours-utils'

interface BusinessHoursFormProps {
  businessHours: BusinessHoursConfig[]
  onUpdate: (dayOfWeek: number, updates: Partial<BusinessHoursConfig>) => Promise<void>
  loading: boolean
}

export function BusinessHoursForm({ businessHours, onUpdate, loading }: BusinessHoursFormProps) {
  // Sort to show Monday first (Spanish week)
  const sortedBusinessHours = sortDaysSpanishWeek(businessHours)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<BusinessHoursConfig>>({})

  const handleEdit = (day: BusinessHoursConfig) => {
    setEditingDay(day.day_of_week)
    setEditData({
      is_open: day.is_open,
      open_time: day.open_time,
      close_time: day.close_time,
      last_reservation_time: day.last_reservation_time,
      lunch_enabled: day.lunch_enabled,
      lunch_open_time: day.lunch_open_time || '13:00',
      lunch_close_time: day.lunch_close_time || '16:00',
    })
  }

  const handleCancel = () => {
    setEditingDay(null)
    setEditData({})
  }

  const handleSave = async (dayOfWeek: number) => {
    await onUpdate(dayOfWeek, editData)
    setEditingDay(null)
    setEditData({})
  }

  return (
    <div className="enigma-config-hours-grid">
      {sortedBusinessHours.map((day) => {
        const isEditing = editingDay === day.day_of_week
        const dayData = isEditing ? editData : day

        return (
          <div
            key={day.day_of_week}
            className="enigma-config-day-row"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between w-full flex-wrap gap-4">
              <div className="flex items-center gap-4 min-w-[150px]">
                <span className="font-semibold text-foreground w-24">
                  {getDayName(day.day_of_week)}
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dayData.is_open ?? false}
                      onCheckedChange={(checked) =>
                        setEditData(prev => ({ ...prev, is_open: checked }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {dayData.is_open ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                ) : (
                  <span className={`text-sm font-medium ${
                    day.is_open ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {day.is_open ? 'Abierto' : 'Cerrado'}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSave(day.day_of_week)}
                      disabled={loading}
                      className="h-8"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(day)}
                    disabled={loading}
                    className="h-8"
                  >
                    Editar
                  </Button>
                )}
              </div>
            </div>

            {/* Hours Details */}
            {(dayData.is_open || isEditing) && (
              <div className="w-full mt-4 space-y-4">
                <Separator />

                {/* Dinner Service */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Horario Cena</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {isEditing ? (
                        <>
                          <Input
                            type="time"
                            value={dayData.open_time || '18:30'}
                            onChange={(e) =>
                              setEditData(prev => ({ ...prev, open_time: e.target.value }))
                            }
                            className="h-9"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            type="time"
                            value={dayData.close_time || '23:00'}
                            onChange={(e) =>
                              setEditData(prev => ({ ...prev, close_time: e.target.value }))
                            }
                            className="h-9"
                          />
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {day.open_time} - {day.close_time}
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div>
                      <Label className="text-sm font-medium">Última Reserva</Label>
                      <Input
                        type="time"
                        value={dayData.last_reservation_time || '22:30'}
                        onChange={(e) =>
                          setEditData(prev => ({ ...prev, last_reservation_time: e.target.value }))
                        }
                        className="h-9 mt-2"
                      />
                    </div>
                  )}
                </div>

                {/* Lunch Service */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Switch
                          checked={dayData.lunch_enabled ?? false}
                          onCheckedChange={(checked) =>
                            setEditData(prev => ({ ...prev, lunch_enabled: checked }))
                          }
                        />
                        <Label className="text-sm font-medium cursor-pointer">
                          Servicio de Almuerzo
                        </Label>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {day.lunch_enabled ? '🍽️ Almuerzo disponible' : 'Solo cena'}
                      </span>
                    )}
                  </div>

                  {dayData.lunch_enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-8">
                      <div>
                        <Label className="text-sm font-medium">Horario Almuerzo</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {isEditing ? (
                            <>
                              <Input
                                type="time"
                                value={dayData.lunch_open_time || '13:00'}
                                onChange={(e) =>
                                  setEditData(prev => ({ ...prev, lunch_open_time: e.target.value }))
                                }
                                className="h-9"
                              />
                              <span className="text-muted-foreground">-</span>
                              <Input
                                type="time"
                                value={dayData.lunch_close_time || '16:00'}
                                onChange={(e) =>
                                  setEditData(prev => ({ ...prev, lunch_close_time: e.target.value }))
                                }
                                className="h-9"
                              />
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {day.lunch_open_time} - {day.lunch_close_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
