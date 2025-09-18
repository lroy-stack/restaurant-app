"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, Clock, Users, Euro, Phone, Mail, MapPin, 
  Globe, Wifi, Shield, Bell, Palette, Save, RotateCcw,
  Crown, Star, UserPlus, Trash2, Edit
} from "lucide-react"
import { toast } from "sonner"
import type { User, UserRole } from "@prisma/client"

// Business Hours Schema
const businessHoursSchema = z.object({
  monday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  tuesday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  wednesday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  thursday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  friday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  saturday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  sunday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
})

// Restaurant Settings Schema
const restaurantSettingsSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  address: z.string().min(5, "La dirección es requerida"),
  phone: z.string().min(9, "Teléfono válido requerido"),
  email: z.string().email("Email válido requerido"),
  capacity: z.number().min(1, "Capacidad mínima 1").max(200, "Capacidad máxima 200"),
  minReservationHours: z.number().min(1).max(72),
  maxPartySize: z.number().min(2).max(20),
  enableOnlineReservations: z.boolean(),
  requireConfirmation: z.boolean(),
  allowWalkIns: z.boolean(),
  defaultReservationDuration: z.number().min(60).max(240), // in minutes
})

type BusinessHoursFormData = z.infer<typeof businessHoursSchema>
type RestaurantSettingsFormData = z.infer<typeof restaurantSettingsSchema>

interface BusinessSettingsProps {
  initialSettings?: Partial<RestaurantSettingsFormData>
  initialHours?: Partial<BusinessHoursFormData>
  staffMembers?: User[]
  onSettingsUpdate?: (settings: RestaurantSettingsFormData) => Promise<void>
  onHoursUpdate?: (hours: BusinessHoursFormData) => Promise<void>
  onStaffUpdate?: (userId: string, role: UserRole) => Promise<void>
  onStaffRemove?: (userId: string) => Promise<void>
  onStaffInvite?: (email: string, role: UserRole) => Promise<void>
  className?: string
}

const dayLabels = {
  monday: "Lunes",
  tuesday: "Martes", 
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  STAFF: "Personal",
  CUSTOMER: "Cliente",
}

const roleColors: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-800",
  MANAGER: "bg-blue-100 text-blue-800",
  STAFF: "bg-green-100 text-green-800", 
  CUSTOMER: "bg-gray-100 text-gray-800",
}

export function BusinessSettings({
  initialSettings,
  initialHours,
  staffMembers = [],
  onSettingsUpdate,
  onHoursUpdate,
  onStaffUpdate,
  onStaffRemove,
  onStaffInvite,
  className
}: BusinessSettingsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "hours" | "staff">("general")
  const [isSaving, setIsSaving] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [newStaffEmail, setNewStaffEmail] = useState("")
  const [newStaffRole, setNewStaffRole] = useState<UserRole>("STAFF")

  // General Settings Form
  const settingsForm = useForm<RestaurantSettingsFormData>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
      name: "Enigma Cocina Con Alma",
      description: "Restaurante de cocina atlántico-mediterránea en el casco antiguo de Calpe",
      address: "Carrer Justicia 6A, 03710 Calpe, Alicante",
      phone: "+34 672 79 60 06",
      email: "info@enigmaconalma.com",
      capacity: 50,
      minReservationHours: 6,
      maxPartySize: 12,
      enableOnlineReservations: true,
      requireConfirmation: true,
      allowWalkIns: true,
      defaultReservationDuration: 150,
      ...initialSettings,
    }
  })

  // Business Hours Form
  const hoursForm = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: {
      monday: { isOpen: false },
      tuesday: { isOpen: true, openTime: "18:00", closeTime: "23:00" },
      wednesday: { isOpen: true, openTime: "18:00", closeTime: "23:00" },
      thursday: { isOpen: true, openTime: "18:00", closeTime: "23:00" },
      friday: { isOpen: true, openTime: "18:00", closeTime: "23:00" },
      saturday: { isOpen: true, openTime: "18:00", closeTime: "23:00" },
      sunday: { isOpen: true, openTime: "18:00", closeTime: "23:00" },
      ...initialHours,
    }
  })

  const handleSettingsSave = async (data: RestaurantSettingsFormData) => {
    if (!onSettingsUpdate) return
    
    setIsSaving(true)
    try {
      await onSettingsUpdate(data)
      toast.success("Configuración actualizada correctamente")
    } catch (error) {
      toast.error("Error al actualizar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  const handleHoursSave = async (data: BusinessHoursFormData) => {
    if (!onHoursUpdate) return
    
    setIsSaving(true)
    try {
      await onHoursUpdate(data)
      toast.success("Horarios actualizados correctamente")
    } catch (error) {
      toast.error("Error al actualizar los horarios")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStaffInvite = async () => {
    if (!newStaffEmail.trim() || !onStaffInvite) return
    
    setIsInviting(true)
    try {
      await onStaffInvite(newStaffEmail.trim(), newStaffRole)
      setNewStaffEmail("")
      setNewStaffRole("STAFF")
      toast.success("Invitación enviada correctamente")
    } catch (error) {
      toast.error("Error al enviar la invitación")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    if (!onStaffUpdate) return
    
    try {
      await onStaffUpdate(userId, role)
      toast.success("Rol actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar el rol")
    }
  }

  const handleStaffRemove = async (userId: string) => {
    if (!onStaffRemove) return
    
    try {
      await onStaffRemove(userId)
      toast.success("Personal eliminado correctamente")
    } catch (error) {
      toast.error("Error al eliminar el personal")
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "hours", label: "Horarios", icon: Clock },
    { id: "staff", label: "Personal", icon: Users },
  ]

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Configuración del Restaurante</h2>
        <p className="text-muted-foreground">
          Gestiona la configuración general, horarios y personal
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <form onSubmit={settingsForm.handleSubmit(handleSettingsSave)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Información General</span>
              </CardTitle>
              <CardDescription>
                Configuración básica del restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Restaurante</Label>
                  <Input
                    id="name"
                    {...settingsForm.register("name")}
                    className="text-base"
                  />
                  {settingsForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {settingsForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad Total</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...settingsForm.register("capacity", { valueAsNumber: true })}
                    className="text-base"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...settingsForm.register("description")}
                  rows={3}
                  className="text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  {...settingsForm.register("address")}
                  className="text-base"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    {...settingsForm.register("phone")}
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...settingsForm.register("email")}
                    className="text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Reservas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minReservationHours">Horas mínimas de antelación</Label>
                  <Input
                    id="minReservationHours"
                    type="number"
                    {...settingsForm.register("minReservationHours", { valueAsNumber: true })}
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxPartySize">Tamaño máximo de grupo</Label>
                  <Input
                    id="maxPartySize"
                    type="number"
                    {...settingsForm.register("maxPartySize", { valueAsNumber: true })}
                    className="text-base"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultReservationDuration">Duración por defecto (minutos)</Label>
                <Input
                  id="defaultReservationDuration"
                  type="number"
                  {...settingsForm.register("defaultReservationDuration", { valueAsNumber: true })}
                  className="text-base"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reservas online habilitadas</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir reservas a través del sitio web
                    </p>
                  </div>
                  <Switch
                    {...settingsForm.register("enableOnlineReservations")}
                    checked={settingsForm.watch("enableOnlineReservations")}
                    onCheckedChange={(checked) => settingsForm.setValue("enableOnlineReservations", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requerir confirmación</Label>
                    <p className="text-sm text-muted-foreground">
                      Las reservas necesitan confirmación del staff
                    </p>
                  </div>
                  <Switch
                    {...settingsForm.register("requireConfirmation")}
                    checked={settingsForm.watch("requireConfirmation")}
                    onCheckedChange={(checked) => settingsForm.setValue("requireConfirmation", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir walk-ins</Label>
                    <p className="text-sm text-muted-foreground">
                      Aceptar clientes sin reserva previa
                    </p>
                  </div>
                  <Switch
                    {...settingsForm.register("allowWalkIns")}
                    checked={settingsForm.watch("allowWalkIns")}
                    onCheckedChange={(checked) => settingsForm.setValue("allowWalkIns", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => settingsForm.reset()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </form>
      )}

      {/* Business Hours */}
      {activeTab === "hours" && (
        <form onSubmit={hoursForm.handleSubmit(handleHoursSave)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Horarios de Apertura</span>
              </CardTitle>
              <CardDescription>
                Configura los días y horas de operación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(dayLabels).map(([day, label]) => {
                const dayData = hoursForm.watch(day as keyof BusinessHoursFormData)
                return (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-24">
                        <Label className="font-medium">{label}</Label>
                      </div>
                      <Switch
                        checked={dayData.isOpen}
                        onCheckedChange={(checked) => 
                          hoursForm.setValue(`${day}.isOpen` as any, checked)
                        }
                      />
                    </div>
                    
                    {dayData.isOpen && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={dayData.openTime || "18:00"}
                          onChange={(e) => 
                            hoursForm.setValue(`${day}.openTime` as any, e.target.value)
                          }
                          className="w-24"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={dayData.closeTime || "24:00"}
                          onChange={(e) => 
                            hoursForm.setValue(`${day}.closeTime` as any, e.target.value)
                          }
                          className="w-24"
                        />
                      </div>
                    )}
                    
                    {!dayData.isOpen && (
                      <Badge variant="secondary">Cerrado</Badge>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => hoursForm.reset()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Horarios"}
            </Button>
          </div>
        </form>
      )}

      {/* Staff Management */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          {/* Invite New Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Invitar Personal</span>
              </CardTitle>
              <CardDescription>
                Enviar invitación por email para unirse al equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="email@ejemplo.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={newStaffRole} onValueChange={(value) => setNewStaffRole(value as UserRole)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Personal</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStaffInvite} 
                  disabled={!newStaffEmail.trim() || isInviting}
                >
                  {isInviting ? "Enviando..." : "Invitar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Equipo Actual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staffMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.name?.charAt(0)?.toUpperCase() || "U"}
                        {member.isVip && (
                          <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={roleColors[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                      
                      {member.role !== "ADMIN" && (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleRoleUpdate(member.id, value as UserRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STAFF">Personal</SelectItem>
                              <SelectItem value="MANAGER">Gerente</SelectItem>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStaffRemove(member.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {staffMembers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay miembros del personal registrados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}