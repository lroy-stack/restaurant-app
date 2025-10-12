'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Eye, Pencil, Trash2, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import type { Announcement, CreateAnnouncementInput } from '@/types/announcements'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnnouncementForm } from '../forms/announcement-form'
import { AnnouncementPreview } from '../preview/announcement-preview'

export function AnnouncementsSection() {
  const queryClient = useQueryClient()
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  // Fetch all announcements (admin view - show ALL, not just active/published)
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn: async () => {
      const response = await fetch('/api/announcements/admin')
      if (!response.ok) {
        // Fallback: fetch public announcements if admin endpoint doesn't exist
        const fallbackResponse = await fetch('/api/announcements')
        if (!fallbackResponse.ok) throw new Error('Error loading announcements')
        const fallbackResult = await fallbackResponse.json()
        return fallbackResult.data as Announcement[]
      }
      const result = await response.json()
      return result.data as Announcement[]
    }
  })

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateAnnouncementInput) => {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate?.toISOString(),
          endDate: data.endDate?.toISOString()
        })
      })
      if (!response.ok) throw new Error('Failed to create announcement')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] })
      toast.success('Anuncio creado correctamente')
      setFormOpen(false)
    },
    onError: (error) => {
      toast.error('Error al crear anuncio: ' + error.message)
    }
  })

  // Update announcement mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAnnouncementInput> }) => {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate?.toISOString(),
          endDate: data.endDate?.toISOString()
        })
      })
      if (!response.ok) throw new Error('Failed to update announcement')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] })
      toast.success('Anuncio actualizado correctamente')
      setFormOpen(false)
      setEditingAnnouncement(null)
    },
    onError: (error) => {
      toast.error('Error al actualizar anuncio: ' + error.message)
    }
  })

  // Publish/unpublish mutation (makes announcement live)
  const publishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !isPublished,
          isActive: !isPublished // Auto-activate when publishing
        })
      })
      if (!response.ok) throw new Error('Failed to publish announcement')
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] })
      toast.success(variables.isPublished ? 'Anuncio despublicado' : 'Anuncio publicado y activado')
    },
    onError: () => {
      toast.error('Error al actualizar anuncio')
    }
  })

  // Toggle active mutation (only for published announcements)
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (!response.ok) throw new Error('Failed to update announcement')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] })
      toast.success('Estado actualizado')
    },
    onError: () => {
      toast.error('Error al actualizar estado')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete announcement')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] })
      toast.success('Anuncio eliminado')
    },
    onError: () => {
      toast.error('Error al eliminar anuncio')
    }
  })

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      event: 'Evento',
      daily_dish: 'Plato del Día',
      promotion: 'Promoción',
      news: 'Noticia',
      menu_update: 'Actualización Menú'
    }
    return labels[type] || type
  }

  const getDisplayTypeLabel = (displayType: string) => {
    const labels: Record<string, string> = {
      popup: 'Pop-up',
      banner: 'Banner',
      toast: 'Notificación',
      sidebar: 'Panel Lateral'
    }
    return labels[displayType] || displayType
  }

  const handleCreateOrUpdate = async (data: CreateAnnouncementInput) => {
    if (editingAnnouncement) {
      await updateMutation.mutateAsync({
        id: editingAnnouncement.id,
        data
      })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingAnnouncement(null)
    setFormOpen(true)
  }

  const handlePreview = (announcement: Announcement) => {
    setPreviewAnnouncement(announcement)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Announcement Preview Dialog */}
      <AnnouncementPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        announcement={previewAnnouncement}
      />

      {/* Announcement Form Dialog */}
      <AnnouncementForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingAnnouncement(null)
        }}
        announcement={editingAnnouncement}
        onSubmit={handleCreateOrUpdate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Gestión de Anuncios</CardTitle>
            <CardDescription>
              Crea y gestiona anuncios pop-up para tu web
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Anuncio
          </Button>
        </CardHeader>
      </Card>

      {/* Announcements Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando anuncios...
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No hay anuncios creados</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer anuncio
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Visualización</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{announcement.title}</p>
                        {announcement.badgeText && (
                          <Badge
                            variant="outline"
                            className="mt-1 text-xs"
                            style={{ backgroundColor: announcement.badgeColor }}
                          >
                            {announcement.badgeText}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getTypeLabel(announcement.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getDisplayTypeLabel(announcement.displayType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {announcement.startDate && (
                          <p className="text-muted-foreground">
                            Inicio: {format(new Date(announcement.startDate), 'dd MMM yyyy', { locale: es })}
                          </p>
                        )}
                        {announcement.endDate && (
                          <p className="text-muted-foreground">
                            Fin: {format(new Date(announcement.endDate), 'dd MMM yyyy', { locale: es })}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                          {announcement.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {announcement.isPublished && (
                          <Badge variant="outline">Publicado</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          {announcement.viewsCount} vistas
                        </p>
                        <p className="text-muted-foreground">
                          {announcement.clicksCount} clicks
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(announcement)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Vista Previa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => publishMutation.mutate({
                              id: announcement.id,
                              isPublished: announcement.isPublished
                            })}
                          >
                            {announcement.isPublished ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Publicar y Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          {announcement.isPublished && (
                            <DropdownMenuItem
                              onClick={() => toggleActiveMutation.mutate({
                                id: announcement.id,
                                isActive: announcement.isActive
                              })}
                            >
                              {announcement.isActive ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Reanudar
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('¿Eliminar este anuncio?')) {
                                deleteMutation.mutate(announcement.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
