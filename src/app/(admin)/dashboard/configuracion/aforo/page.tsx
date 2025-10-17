'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AforoConfigPage() {
  const [capacity, setCapacity] = useState(63)
  const [occupancy, setOccupancy] = useState(80)
  const [saving, setSaving] = useState(false)

  // Calcular límites en tiempo real
  const targetCapacity = Math.floor((capacity * occupancy) / 100)
  const turn1Max = Math.ceil(targetCapacity / 7)
  const turn2Max = Math.ceil(targetCapacity / 6)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Actualizar todos los días de la semana
      const response = await fetch('/api/admin/capacity-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCapacity: capacity,
          targetOccupancy: occupancy / 100
        })
      })

      if (response.ok) {
        toast.success('Configuración guardada correctamente')
      } else {
        toast.error('Error al guardar configuración')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Aforo</h1>
        <p className="text-muted-foreground">
          Sistema dinámico de capacidad por turnos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aforo Total</CardTitle>
          <CardDescription>
            Configura según las salas abiertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Salas Abiertas</Label>
            <Select value={capacity.toString()} onValueChange={(v) => setCapacity(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="63">Base (63 asientos)</SelectItem>
                <SelectItem value="81">+ Sala Justicia (81 asientos)</SelectItem>
                <SelectItem value="93">+ VIP Completo (93 asientos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Objetivo de Ocupación</Label>
              <span className="text-sm font-medium">{occupancy}%</span>
            </div>
            <Slider
              value={[occupancy]}
              onValueChange={([v]) => setOccupancy(v)}
              min={70}
              max={95}
              step={5}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {targetCapacity} personas = {capacity} × {occupancy}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Límites Calculados Automáticamente</AlertTitle>
        <AlertDescription className="space-y-3 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold text-primary mb-1">Primera Sentada (18:30-20:00)</p>
              <p className="text-3xl font-bold">{turn1Max} px/slot</p>
              <p className="text-xs text-muted-foreground mt-1">
                7 slots × {turn1Max}px = {turn1Max * 7} personas
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-sm font-semibold text-secondary mb-1">Segunda Sentada (20:45-22:15)</p>
              <p className="text-3xl font-bold">{turn2Max} px/slot</p>
              <p className="text-xs text-muted-foreground mt-1">
                6 slots × {turn2Max}px = {turn2Max * 6} personas
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">
              Capacidad total por noche: <span className="text-lg font-bold text-primary">{turn1Max * 7 + turn2Max * 6}</span> personas
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Button size="lg" onClick={handleSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </Button>
    </div>
  )
}
