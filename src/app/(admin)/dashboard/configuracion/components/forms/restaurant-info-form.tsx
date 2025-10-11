/**
 * RESTAURANT INFO FORM
 * Formulario completo con react-hook-form + Zod validation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save } from 'lucide-react'
import type { RestaurantConfig } from '../../types/config.types'

// Zod validation schema
const restaurantInfoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+?[0-9\s-]{9,}$/, 'Teléfono inválido'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  ambiente: z.string().min(10, 'La descripción del ambiente debe tener al menos 10 caracteres'),
  google_rating: z.number().min(0).max(5),
  monthly_customers: z.number().min(0),
  hours_operation: z.string().min(5, 'Horario requerido'),
  awards: z.string().optional(),
  hero_title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),

  // Historia
  historia_hero_title: z.string().min(5, 'Título requerido'),
  historia_hero_subtitle: z.string().min(10, 'Subtítulo requerido'),
  historia_pasion_title: z.string().min(5, 'Título requerido'),
  historia_pasion_paragraph1: z.string().min(20, 'Contenido requerido'),
  historia_pasion_paragraph2: z.string().min(20, 'Contenido requerido'),
  historia_valor_tradicion_content: z.string().min(20, 'Contenido requerido'),
  historia_valor_pasion_content: z.string().min(20, 'Contenido requerido'),
  historia_valor_comunidad_content: z.string().min(20, 'Contenido requerido'),
  historia_location_title: z.string().min(5, 'Título requerido'),
  historia_location_content: z.string().min(20, 'Contenido requerido'),
  historia_quote: z.string().min(10, 'Quote requerido'),
  vive_historia_title: z.string().min(5, 'Título requerido'),
  vive_historia_content: z.string().min(20, 'Contenido requerido'),

  // Galería
  galeria_experiencia_title: z.string().min(5, 'Título requerido'),
  galeria_ambiente_title: z.string().min(5, 'Título requerido'),
  galeria_ambiente_content: z.string().min(20, 'Contenido requerido'),
  galeria_cocina_title: z.string().min(5, 'Título requerido'),
  galeria_cocina_content: z.string().min(20, 'Contenido requerido'),

  // Contacto
  contacto_final_title: z.string().min(5, 'Título requerido'),
  contacto_final_content: z.string().min(20, 'Contenido requerido'),

  // Social Media
  instagram_url: z.string().url('URL inválida').optional().or(z.literal('')),
  facebook_url: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp_number: z.string().regex(/^\+?[0-9\s-]{9,}$/, 'Número inválido'),

  // Footer
  footer_newsletter_title: z.string().min(5, 'Título requerido'),
  footer_newsletter_description: z.string().min(10, 'Descripción requerida'),
  footer_newsletter_image_url: z.string().url('URL inválida'),
  footer_tripadvisor_url: z.string().url('URL inválida').optional().or(z.literal('')),
  footer_copyright_text: z.string().min(10, 'Texto requerido'),
})

type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>

interface RestaurantInfoFormProps {
  data: RestaurantConfig | null
  onSubmit: (data: Partial<RestaurantConfig>) => Promise<void>
  loading: boolean
}

export function RestaurantInfoForm({ data, onSubmit, loading }: RestaurantInfoFormProps) {
  const form = useForm<RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      address: data?.address || '',
      description: data?.description || '',
      ambiente: data?.ambiente || '',
      google_rating: data?.google_rating || 4.8,
      monthly_customers: data?.monthly_customers || 200,
      hours_operation: data?.hours_operation || '',
      awards: data?.awards || '',
      hero_title: data?.hero_title || '',
      // Historia
      historia_hero_title: data?.historia_hero_title || '',
      historia_hero_subtitle: data?.historia_hero_subtitle || '',
      historia_pasion_title: data?.historia_pasion_title || '',
      historia_pasion_paragraph1: data?.historia_pasion_paragraph1 || '',
      historia_pasion_paragraph2: data?.historia_pasion_paragraph2 || '',
      historia_valor_tradicion_content: data?.historia_valor_tradicion_content || '',
      historia_valor_pasion_content: data?.historia_valor_pasion_content || '',
      historia_valor_comunidad_content: data?.historia_valor_comunidad_content || '',
      historia_location_title: data?.historia_location_title || '',
      historia_location_content: data?.historia_location_content || '',
      historia_quote: data?.historia_quote || '',
      vive_historia_title: data?.vive_historia_title || '',
      vive_historia_content: data?.vive_historia_content || '',
      // Galería
      galeria_experiencia_title: data?.galeria_experiencia_title || '',
      galeria_ambiente_title: data?.galeria_ambiente_title || '',
      galeria_ambiente_content: data?.galeria_ambiente_content || '',
      galeria_cocina_title: data?.galeria_cocina_title || '',
      galeria_cocina_content: data?.galeria_cocina_content || '',
      // Contacto
      contacto_final_title: data?.contacto_final_title || '',
      contacto_final_content: data?.contacto_final_content || '',
      // Social
      instagram_url: data?.instagram_url || '',
      facebook_url: data?.facebook_url || '',
      whatsapp_number: data?.whatsapp_number || '',
      // Footer
      footer_newsletter_title: data?.footer_newsletter_title || '',
      footer_newsletter_description: data?.footer_newsletter_description || '',
      footer_newsletter_image_url: data?.footer_newsletter_image_url || '',
      footer_tripadvisor_url: data?.footer_tripadvisor_url || '',
      footer_copyright_text: data?.footer_copyright_text || '',
    },
  })

  const handleFormSubmit = async (values: RestaurantInfoFormValues) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="historia">Historia</TabsTrigger>
            <TabsTrigger value="galeria">Galería</TabsTrigger>
            <TabsTrigger value="contacto">Contacto</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* TAB: BÁSICO */}
          <TabsContent value="basico" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Restaurante</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enigma Cocina Con Alma"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Hero</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Título principal de la página"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="info@enigmaconalma.com"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+34 672 79 60 06"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="google_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating Google</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        className="enigma-config-input"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Valoración de 0 a 5</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_customers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clientes Mensuales</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="enigma-config-input"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección Completa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Carrer Justicia 6A, 03710 Calpe, Alicante"
                      className="enigma-config-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historia - Párrafo 1 (Description)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enigma es la historia de una segunda oportunidad..."
                      className="enigma-config-input min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Primer párrafo sección "Una Pasión Que Nace del Corazón" (también usado en hero de historia)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ambiente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historia - Párrafo 2 (Ambiente)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Pasión y alma nos definen..."
                      className="enigma-config-input min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Segundo párrafo sección "Una Pasión Que Nace del Corazón"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hours_operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario de Operación</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lun-Sab: 18:30 - 23:00"
                      className="enigma-config-input"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Horario que se muestra en el footer y páginas públicas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="awards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premios y Reconocimientos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Restaurante Recomendado"
                      className="enigma-config-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* TAB: HISTORIA */}
          <TabsContent value="historia" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-semibold">Sección Hero</h3>
                <FormField
                  control={form.control}
                  name="historia_hero_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Hero</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tradición y Pasión"
                          className="enigma-config-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historia_hero_subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtítulo Hero</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enigma es la historia..."
                          className="enigma-config-input min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pasión Section */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-semibold">Una Pasión Que Nace del Corazón</h3>
                <p className="text-sm text-muted-foreground">
                  Nota: También puedes usar los campos "description" y "ambiente" del tab Básico
                </p>
                <FormField
                  control={form.control}
                  name="historia_pasion_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Sección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Una Pasión Que Nace del Corazón"
                          className="enigma-config-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historia_pasion_paragraph1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Párrafo 1</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enigma es la historia..."
                          className="enigma-config-input min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historia_pasion_paragraph2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Párrafo 2</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Pasión y alma nos definen..."
                          className="enigma-config-input min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Valores (3 tarjetas) */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-semibold">Tarjetas de Valores</h3>
                <FormField
                  control={form.control}
                  name="historia_valor_tradicion_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor: Tradición</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Respetamos las raíces culinarias..."
                          className="enigma-config-input min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historia_valor_pasion_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor: Pasión</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cada plato se elabora..."
                          className="enigma-config-input min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historia_valor_comunidad_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor: Comunidad</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Somos parte del corazón de Calpe..."
                          className="enigma-config-input min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Un Lugar Con Historia */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-semibold">Un Lugar Con Historia</h3>
                <FormField
                  control={form.control}
                  name="historia_location_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Ubicación</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Un Lugar Con Historia"
                          className="enigma-config-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="historia_location_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido Ubicación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="El casco antiguo de Calpe es un testimonio vivo..."
                        className="enigma-config-input min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="historia_quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Destacada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Entre callejones históricos rodeados de plantas..."
                        className="enigma-config-input min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              {/* Vive Nuestra Historia */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-semibold">Vive Nuestra Historia (CTA)</h3>
                <FormField
                  control={form.control}
                  name="vive_historia_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título CTA Final</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Vive Nuestra Historia"
                          className="enigma-config-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vive_historia_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido CTA Final</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Te invitamos a ser parte de nuestra historia..."
                          className="enigma-config-input min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB: GALERÍA */}
          <TabsContent value="galeria" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="galeria_experiencia_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Experiencia Visual</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Una Experiencia Visual Única"
                      className="enigma-config-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ambiente Histórico</h3>
              <FormField
                control={form.control}
                name="galeria_ambiente_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Ambiente</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ambiente Histórico"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="galeria_ambiente_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido Ambiente</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nuestro restaurante se encuentra en el corazón..."
                        className="enigma-config-input min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cocina Con Alma</h3>
              <FormField
                control={form.control}
                name="galeria_cocina_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Cocina</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cocina Con Alma"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="galeria_cocina_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido Cocina</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cada plato es una obra de arte culinaria..."
                        className="enigma-config-input min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* TAB: CONTACTO */}
          <TabsContent value="contacto" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="contacto_final_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Final Contacto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Te Esperamos en Enigma"
                      className="enigma-config-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contacto_final_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido Final Contacto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Entre callejones históricos rodeados de plantas..."
                      className="enigma-config-input min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Texto de cierre en la página de contacto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* TAB: SOCIAL */}
          <TabsContent value="social" className="space-y-6 mt-6">
            {/* Redes Sociales */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
              <h3 className="font-semibold">Redes Sociales</h3>
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.instagram.com/enigmaconalma/"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.facebook.com/enigma.restaurante.calpe/"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+34 672 79 60 06"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Número con código de país (ej: +34)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footer_tripadvisor_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TripAdvisor URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.tripadvisor.es/..."
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link a las reseñas de TripAdvisor (aparece en footer)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Newsletter del Footer */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
              <h3 className="font-semibold">Newsletter (Footer)</h3>
              <FormField
                control={form.control}
                name="footer_newsletter_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Newsletter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mantente al día con nuestro newsletter"
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footer_newsletter_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Newsletter</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descubre nuestros platos especiales..."
                        className="enigma-config-input min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footer_newsletter_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen de Fondo Newsletter</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://ik.imagekit.io/..."
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL de la imagen de fondo de la sección newsletter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Copyright del Footer */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
              <h3 className="font-semibold">Copyright</h3>
              <FormField
                control={form.control}
                name="footer_copyright_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto Copyright</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enigma Cocina Con Alma. Todos los derechos reservados."
                        className="enigma-config-input"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Texto que aparece al final del footer (sin el año, se agrega automáticamente)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex items-center gap-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={loading}
            className="enigma-config-save-btn"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
