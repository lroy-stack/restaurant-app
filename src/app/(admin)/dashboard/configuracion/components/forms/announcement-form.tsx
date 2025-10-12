'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types/announcements'

const announcementFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  titleEn: z.string().optional(),
  titleDe: z.string().optional(),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  contentEn: z.string().optional(),
  contentDe: z.string().optional(),
  type: z.enum(['event', 'daily_dish', 'promotion', 'news', 'menu_update']),
  displayType: z.enum(['popup', 'banner', 'toast', 'sidebar']),
  badgeText: z.string().optional(),
  badgeColor: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isDismissible: z.boolean().default(true),
  showOncePerDay: z.boolean().default(true),
  pages: z.array(z.string()).default(['all'])
})

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>

interface AnnouncementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement?: Announcement | null
  onSubmit: (data: AnnouncementFormValues) => Promise<void>
  isLoading?: boolean
}

export function AnnouncementForm({
  open,
  onOpenChange,
  announcement,
  onSubmit,
  isLoading = false
}: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    values: announcement ? {
      title: announcement.title,
      titleEn: announcement.titleEn || '',
      titleDe: announcement.titleDe || '',
      content: announcement.content,
      contentEn: announcement.contentEn || '',
      contentDe: announcement.contentDe || '',
      type: announcement.type,
      displayType: announcement.displayType,
      badgeText: announcement.badgeText || '',
      badgeColor: announcement.badgeColor || '#EF4444',
      ctaText: announcement.ctaText || '',
      ctaUrl: announcement.ctaUrl || '',
      backgroundColor: announcement.backgroundColor || '#237584',
      textColor: announcement.textColor || '#FFFFFF',
      imageUrl: announcement.imageUrl || '',
      startDate: announcement.startDate ? new Date(announcement.startDate) : undefined,
      endDate: announcement.endDate ? new Date(announcement.endDate) : undefined,
      isDismissible: announcement.isDismissible,
      showOncePerDay: announcement.showOncePerDay,
      pages: announcement.pages || ['all']
    } : {
      title: '',
      titleEn: '',
      titleDe: '',
      content: '',
      contentEn: '',
      contentDe: '',
      type: 'news',
      displayType: 'popup',
      badgeText: '',
      badgeColor: '#EF4444',
      ctaText: '',
      ctaUrl: '',
      backgroundColor: '#237584',
      textColor: '#FFFFFF',
      imageUrl: '',
      isDismissible: true,
      showOncePerDay: true,
      pages: ['all']
    }
  })

  const handleSubmit = async (data: AnnouncementFormValues) => {
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
          </DialogTitle>
          <DialogDescription>
            Configura el anuncio que se mostrará en tu web
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Contenido Básico */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contenido</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Menú Especial San Valentín" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título EN (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="English title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="titleDe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título DE (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Deutscher Titel..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido (ES)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del anuncio..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Puedes usar HTML básico: &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido EN (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="English content..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentDe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido DE (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deutscher Inhalt..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo y Visualización */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="daily_dish">Plato del Día</SelectItem>
                        <SelectItem value="promotion">Promoción</SelectItem>
                        <SelectItem value="news">Noticia</SelectItem>
                        <SelectItem value="menu_update">Actualización Menú</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visualización</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cómo mostrar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="popup">Pop-up Modal</SelectItem>
                        <SelectItem value="banner">Banner Superior</SelectItem>
                        <SelectItem value="toast">Notificación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Badge */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="badgeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="NUEVO, SOLO HOY..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="badgeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color del Badge</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto Botón CTA (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Reservar Ahora, Ver Menú..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Botón CTA</FormLabel>
                    <FormControl>
                      <Input placeholder="/menu, /reservas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Colores */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color de Fondo</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color de Texto</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Selecciona fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Selecciona fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Opciones */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Comportamiento</h3>

              <FormField
                control={form.control}
                name="isDismissible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Puede cerrarse</FormLabel>
                      <FormDescription>
                        Usuarios pueden cerrar el anuncio
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showOncePerDay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Mostrar una vez al día</FormLabel>
                      <FormDescription>
                        Cada usuario lo ve máximo 1 vez por día
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {announcement ? 'Actualizar' : 'Crear'} Anuncio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
