'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageCircle, Loader2, User, Mail, Phone, FileText } from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'
import { largeGroupContactSchema, type LargeGroupContactFormData } from '@/types/large-group-request'

interface LargeGroupContactFormProps {
  dateTime: string
  partySize: number
  language: Language
  onSubmit: (data: LargeGroupContactFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

const content = {
  es: {
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Juan García López',
    email: 'Email',
    phone: 'Teléfono',
    phonePlaceholder: '+34 600 000 000',
    notes: 'Notas adicionales (opcional)',
    notesPlaceholder: 'Alergias, preferencias, ocasión especial...',
    cancel: 'Cancelar',
    submit: 'Abrir WhatsApp',
    submitting: 'Enviando...',
    reservationDetails: 'Detalles de tu Reserva',
    date: 'Fecha',
    time: 'Hora',
    people: 'Personas'
  },
  en: {
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Smith',
    email: 'Email',
    phone: 'Phone',
    phonePlaceholder: '+44 7700 900000',
    notes: 'Additional notes (optional)',
    notesPlaceholder: 'Allergies, preferences, special occasion...',
    cancel: 'Cancel',
    submit: 'Open WhatsApp',
    submitting: 'Sending...',
    reservationDetails: 'Your Reservation Details',
    date: 'Date',
    time: 'Time',
    people: 'People'
  },
  de: {
    fullName: 'Vollständiger Name',
    fullNamePlaceholder: 'Hans Müller',
    email: 'E-Mail',
    phone: 'Telefon',
    phonePlaceholder: '+49 151 12345678',
    notes: 'Zusätzliche Notizen (optional)',
    notesPlaceholder: 'Allergien, Vorlieben, besonderer Anlass...',
    cancel: 'Abbrechen',
    submit: 'WhatsApp öffnen',
    submitting: 'Wird gesendet...',
    reservationDetails: 'Ihre Reservierungsdetails',
    date: 'Datum',
    time: 'Uhrzeit',
    people: 'Personen'
  }
}

/**
 * Formulario reutilizable para solicitud de grupo grande
 * Puede usarse en modal, página standalone, o drawer
 */
export function LargeGroupContactForm({
  dateTime,
  partySize,
  language,
  onSubmit,
  onCancel,
  loading = false
}: LargeGroupContactFormProps) {
  const t = content[language]

  const form = useForm<LargeGroupContactFormData>({
    resolver: zodResolver(largeGroupContactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      notes: ''
    }
  })

  const handleSubmit = async (data: LargeGroupContactFormData) => {
    await onSubmit(data)
  }

  // Formatear fecha y hora para mostrar (sin conversión de timezone)
  const date = new Date(dateTime)

  // Extraer componentes UTC directamente (que son la hora local guardada)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()

  // Crear fecha local con esos valores (sin conversión de timezone)
  const localDate = new Date(year, month, day, hours, minutes)

  const dateStr = localDate.toLocaleDateString(
    language === 'es' ? 'es-ES' : language === 'en' ? 'en-GB' : 'de-DE',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )
  const timeStr = localDate.toLocaleTimeString(
    language === 'es' ? 'es-ES' : language === 'en' ? 'en-GB' : 'de-DE',
    { hour: '2-digit', minute: '2-digit' }
  )

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Resumen de reserva */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {t.reservationDetails}
        </h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">{t.date}</p>
            <p className="font-medium capitalize">{dateStr}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.time}</p>
            <p className="font-medium">{timeStr}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.people}</p>
            <p className="font-medium">{partySize}</p>
          </div>
        </div>
      </div>

      {/* Formulario de contacto */}
      {/* Nombre completo */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {t.fullName}
        </Label>
        <Input
          id="fullName"
          placeholder={t.fullNamePlaceholder}
          {...form.register('fullName')}
          disabled={loading}
          className="h-10"
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {t.email}
        </Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          disabled={loading}
          className="h-10"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {t.phone}
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder={t.phonePlaceholder}
          {...form.register('phone')}
          disabled={loading}
          className="h-10"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t.notes}
        </Label>
        <Textarea
          id="notes"
          placeholder={t.notesPlaceholder}
          {...form.register('notes')}
          disabled={loading}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Botones */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t.cancel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.submitting}
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              {t.submit}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
