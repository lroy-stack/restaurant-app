"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  User, Crown, Star, MapPin, Calendar, Phone, Mail, 
  Edit, Save, X, Plus, Trash2, Heart, Coffee, Utensils,
  TrendingUp, Users, Euro, Clock
} from "lucide-react"
import { toast } from "sonner"
import type { User as UserType, CustomerNote, TableLocation, Language } from "@prisma/client"

// Extended User type with customer intelligence data
type CustomerProfile = UserType & {
  customerNotes: CustomerNote[]
  recentReservations: Array<{
    id: string
    date: Date
    partySize: number
    occasion?: string
    totalSpent?: number
  }>
  favoriteItems: Array<{
    id: string
    name: string
    category: string
    orderCount: number
  }>
}

interface CustomerProfileProps {
  customer: CustomerProfile
  onUpdate?: (customer: Partial<CustomerProfile>) => Promise<void>
  onAddNote?: (note: { note: string; isImportant: boolean }) => Promise<void>
  onDeleteNote?: (noteId: string) => Promise<void>
  canEdit?: boolean
  staffMember?: UserType
  className?: string
}

const locationLabels: Record<string, string> = {
  TERRACE_1: "Terraza 1",
  VIP_ROOM: "Sala VIP",
  TERRACE_2: "Terraza 2",
  MAIN_ROOM: "Sala Principal",
}

const languageLabels: Record<Language, string> = {
  ES: "Español",
  EN: "English",
  DE: "Deutsch",
}

export function CustomerProfile({ 
  customer, 
  onUpdate, 
  onAddNote, 
  onDeleteNote, 
  canEdit = false,
  staffMember,
  className 
}: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<CustomerProfile>>({})
  const [newNote, setNewNote] = useState("")
  const [newNoteImportant, setNewNoteImportant] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const isVIP = customer.isVip || customer.totalSpent >= 1000 || customer.totalVisits >= 10
  const customerTier = getTierInfo(customer)
  
  const handleEdit = () => {
    setEditData({
      preferredLocation: customer.preferredLocation,
      dietaryRestrictions: customer.dietaryRestrictions,
      favoriteDisheIds: customer.favoriteDisheIds,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!onUpdate) return
    
    try {
      await onUpdate(editData)
      setIsEditing(false)
      setEditData({})
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar el perfil")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !onAddNote) return
    
    try {
      await onAddNote({
        note: newNote.trim(),
        isImportant: newNoteImportant,
      })
      setNewNote("")
      setNewNoteImportant(false)
      setIsAddingNote(false)
      toast.success("Nota añadida correctamente")
    } catch (error) {
      toast.error("Error al añadir la nota")
    }
  }

  const avgSpendPerVisit = customer.totalVisits > 0 
    ? parseFloat(customer.totalSpent.toString()) / customer.totalVisits
    : 0

  const daysSinceLastVisit = customer.lastVisit
    ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className={className}>
      {/* Header with VIP Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${customerTier.bgColor} ${customerTier.textColor}`}>
                  {customer.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                {isVIP && (
                  <Crown className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold">{customer.name}</h2>
                  <VIPBadge customer={customer} />
                  <TierBadge tier={customerTier} />
                </div>
                <p className="text-muted-foreground">{customer.email}</p>
                <p className="text-sm text-muted-foreground">
                  Cliente desde {new Date(customer.createdAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
            
            {canEdit && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Estadísticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {customer.totalVisits}
                </div>
                <div className="text-xs text-muted-foreground">Visitas</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  €{parseFloat(customer.totalSpent.toString()).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Gastado</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Promedio por visita:</span>
                <span className="font-medium">€{avgSpendPerVisit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tamaño promedio grupo:</span>
                <span className="font-medium">{customer.averagePartySize} personas</span>
              </div>
              {daysSinceLastVisit !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última visita:</span>
                  <span className="font-medium">
                    {daysSinceLastVisit === 0 
                      ? "Hoy" 
                      : daysSinceLastVisit === 1 
                      ? "Ayer" 
                      : `Hace ${daysSinceLastVisit} días`
                    }
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Contacto y Preferencias</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.preferredLanguage ? languageLabels[customer.preferredLanguage] : "No especificado"}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">MESA PREFERIDA</Label>
                {isEditing ? (
                  <Select 
                    value={editData.preferredLocation || customer.preferredLocation || ""} 
                    onValueChange={(value) => setEditData({...editData, preferredLocation: value as TableLocation})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar preferencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(locationLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {customer.preferredLocation ? locationLabels[customer.preferredLocation] : "Sin preferencia"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">RESTRICCIONES DIETÉTICAS</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.dietaryRestrictions?.join(", ") || customer.dietaryRestrictions.join(", ")}
                    onChange={(e) => setEditData({
                      ...editData, 
                      dietaryRestrictions: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Separar con comas..."
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <div className="mt-1">
                    {customer.dietaryRestrictions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {customer.dietaryRestrictions.map((restriction) => (
                          <Badge key={restriction} variant="outline" className="text-xs">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Ninguna especificada</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customer.recentReservations.slice(0, 3).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(reservation.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reservation.partySize} personas
                        {reservation.occasion && ` · ${reservation.occasion}`}
                      </div>
                    </div>
                  </div>
                  {reservation.totalSpent && (
                    <div className="text-sm font-medium text-green-600">
                      €{reservation.totalSpent}
                    </div>
                  )}
                </div>
              ))}
              
              {customer.recentReservations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay reservas recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Items */}
      {customer.favoriteItems.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Platos Favoritos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customer.favoriteItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.orderCount}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Notes */}
      {canEdit && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Notas del Personal</span>
              </CardTitle>
              <Button size="sm" onClick={() => setIsAddingNote(!isAddingNote)}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir Nota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAddingNote && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribir nota sobre el cliente..."
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newNoteImportant}
                        onChange={(e) => setNewNoteImportant(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Nota importante</span>
                    </label>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingNote(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {customer.customerNotes.map((note) => (
                <div key={note.id} className={`p-3 rounded-lg border ${note.isImportant ? "border-orange-200 bg-orange-50" : "bg-muted/30"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{note.note}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                        <span>{new Date(note.createdAt).toLocaleDateString('es-ES')}</span>
                        {note.isImportant && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Importante
                          </Badge>
                        )}
                      </div>
                    </div>
                    {onDeleteNote && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteNote(note.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {customer.customerNotes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay notas del personal para este cliente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// VIP Badge Component
interface VIPBadgeProps {
  customer: UserType
  size?: "sm" | "md" | "lg"
}

export function VIPBadge({ customer, size = "md" }: VIPBadgeProps) {
  if (!customer.isVip) return null

  const sizeClasses = {
    sm: "text-xs px-1 py-0",
    md: "text-sm px-2 py-1", 
    lg: "text-base px-3 py-1"
  }

  return (
    <Badge variant="secondary" className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-500 ${sizeClasses[size]}`}>
      <Crown className={`${size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} mr-1`} />
      VIP
    </Badge>
  )
}

// Tier Badge Component
interface TierInfo {
  name: string
  color: string
  bgColor: string
  textColor: string
}

function getTierInfo(customer: UserType): TierInfo {
  const totalSpent = parseFloat(customer.totalSpent.toString())
  const visits = customer.totalVisits

  if (customer.isVip || totalSpent >= 2000 || visits >= 20) {
    return {
      name: "VIP Elite",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600",
      textColor: "text-yellow-900"
    }
  } else if (totalSpent >= 1000 || visits >= 10) {
    return {
      name: "Cliente Oro",
      color: "from-amber-400 to-amber-600", 
      bgColor: "bg-gradient-to-r from-amber-400 to-amber-600",
      textColor: "text-amber-900"
    }
  } else if (totalSpent >= 500 || visits >= 5) {
    return {
      name: "Cliente Plata",
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gradient-to-r from-gray-400 to-gray-600", 
      textColor: "text-gray-900"
    }
  } else {
    return {
      name: "Cliente Regular",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-gradient-to-r from-blue-400 to-blue-600",
      textColor: "text-blue-900"
    }
  }
}

interface TierBadgeProps {
  tier: TierInfo
  size?: "sm" | "md" | "lg"
}

function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1 py-0",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1"
  }

  return (
    <Badge className={`bg-gradient-to-r ${tier.color} ${tier.textColor} border-0 ${sizeClasses[size]}`}>
      {tier.name}
    </Badge>
  )
}