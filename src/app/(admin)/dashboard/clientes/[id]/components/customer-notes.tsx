'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  StickyNote,
  Edit2,
  Save,
  X,
  MessageSquare,
  AlertTriangle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerNotesProps {
  customer: Customer
  onUpdate: (field: string, value: any) => Promise<boolean>
  canEdit: boolean
}

export function CustomerNotes({
  customer,
  onUpdate,
  canEdit
}: CustomerNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(customer.allergies || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    setIsUpdating(true)
    try {
      const success = await onUpdate('allergies', editValue)
      if (success) {
        setIsEditing(false)
        toast.success('Notas actualizadas correctamente')
      }
    } catch (error) {
      toast.error('Error al actualizar notas')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setEditValue(customer.allergies || '')
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-orange-600" />
            Notas y Observaciones
          </CardTitle>

          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Usa este espacio para notas especiales, alergias adicionales,
            preferencias específicas del cliente o cualquier información relevante.
          </AlertDescription>
        </Alert>

        {/* Notes Editor/Display */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            Notas del Cliente
          </Label>

          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Escribe notas importantes sobre este cliente..."
                rows={6}
                className="resize-none"
              />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                  ) : (
                    <Save className="h-3 w-3 mr-1" />
                  )}
                  Guardar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[100px] p-4 border rounded-lg bg-gray-50">
              {customer.allergies ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {customer.allergies}
                </p>
              ) : (
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notas registradas para este cliente.</p>
                  {canEdit && (
                    <p className="text-xs mt-1">Haz clic en "Editar" para agregar notas.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente desde:</span>
              <div className="font-medium">
                {formatDate(customer.createdAt)}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Última actualización:</span>
              <div className="font-medium">
                {formatDate(customer.updatedAt)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <span>Total visitas: {customer.totalVisits}</span>
            <span>Gasto total: €{customer.totalSpent}</span>
            <span>Estado: {customer.isVip ? 'VIP' : 'Regular'}</span>
          </div>
        </div>

        {/* GDPR Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Las notas del cliente son confidenciales y están protegidas bajo GDPR.
            Solo personal autorizado puede acceder a esta información.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}