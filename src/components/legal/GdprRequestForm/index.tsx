// components/legal/GdprRequestForm/index.tsx
// GDPR Rights Request Form - User-facing GDPR request submission
// PRP Implementation: Complete GDPR rights request interface

'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { GdprRequestType } from '@/types/legal'

// ============================================
// FORM SCHEMA
// ============================================

const GdprRequestFormSchema = z.object({
  requestType: GdprRequestType,
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  description: z.string().min(10, 'Please provide more details about your request'),
  preferredLanguage: z.enum(['es', 'en']).default('es'),
  identityConfirmation: z.boolean().refine(val => val === true, {
    message: 'You must confirm your identity to submit this request'
  }),
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: 'You must consent to data processing for this request'
  })
})

type GdprRequestFormData = z.infer<typeof GdprRequestFormSchema>

// ============================================
// PROPS INTERFACE
// ============================================

interface GdprRequestFormProps {
  language?: 'es' | 'en'
  onSuccess?: (referenceNumber: string) => void
}

// ============================================
// REQUEST TYPE DESCRIPTIONS
// ============================================

const REQUEST_TYPE_INFO = {
  access: {
    es: {
      title: 'Derecho de Acceso',
      description: 'Obtener información sobre qué datos personales procesamos'
    },
    en: {
      title: 'Right to Access',
      description: 'Get information about what personal data we process'
    }
  },
  rectification: {
    es: {
      title: 'Derecho de Rectificación',
      description: 'Corregir datos personales inexactos o incompletos'
    },
    en: {
      title: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete personal data'
    }
  },
  erasure: {
    es: {
      title: 'Derecho al Olvido',
      description: 'Solicitar la eliminación de sus datos personales'
    },
    en: {
      title: 'Right to be Forgotten',
      description: 'Request deletion of your personal data'
    }
  },
  restriction: {
    es: {
      title: 'Derecho de Limitación',
      description: 'Restringir el procesamiento de sus datos'
    },
    en: {
      title: 'Right to Restriction',
      description: 'Restrict the processing of your data'
    }
  },
  portability: {
    es: {
      title: 'Derecho de Portabilidad',
      description: 'Recibir sus datos en formato estructurado'
    },
    en: {
      title: 'Right to Portability',
      description: 'Receive your data in structured format'
    }
  },
  objection: {
    es: {
      title: 'Derecho de Oposición',
      description: 'Oponerse al procesamiento de sus datos'
    },
    en: {
      title: 'Right to Object',
      description: 'Object to the processing of your data'
    }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GdprRequestForm({ language = 'es', onSuccess }: GdprRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean
    message: string
    referenceNumber?: string
  } | null>(null)

  const form = useForm<GdprRequestFormData>({
    resolver: zodResolver(GdprRequestFormSchema),
    defaultValues: {
      preferredLanguage: language,
      identityConfirmation: false,
      dataProcessingConsent: false
    }
  })

  const selectedRequestType = form.watch('requestType')

  const onSubmit = async (data: GdprRequestFormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/legal/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          identityVerificationData: {
            method: 'form_submission',
            timestamp: new Date().toISOString(),
            ipAddress: 'client-side' // Will be set server-side
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitResult({
          success: true,
          message: result.message,
          referenceNumber: result.referenceNumber
        })

        if (onSuccess && result.referenceNumber) {
          onSuccess(result.referenceNumber)
        }

        form.reset()
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Error al procesar la solicitud'
        })
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Error de conexión. Por favor, inténtelo de nuevo.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const texts = {
    es: {
      title: 'Solicitar Derechos GDPR',
      description: 'Ejercite sus derechos de protección de datos según el RGPD',
      requestType: 'Tipo de Solicitud',
      selectRequestType: 'Seleccione el tipo de solicitud',
      email: 'Correo Electrónico',
      emailPlaceholder: 'su@email.com',
      fullName: 'Nombre Completo',
      fullNamePlaceholder: 'Su nombre completo',
      phoneNumber: 'Teléfono (Opcional)',
      phonePlaceholder: '+34 xxx xxx xxx',
      description: 'Descripción de la Solicitud',
      descriptionPlaceholder: 'Describa detalladamente su solicitud...',
      language: 'Idioma Preferido',
      identityConfirmation: 'Confirmo que soy la persona titular de los datos',
      dataProcessingConsent: 'Acepto el procesamiento de mis datos para esta solicitud',
      submit: 'Enviar Solicitud',
      submitting: 'Enviando...',
      processingTime: 'Tiempo de procesamiento: 30 días (máximo 60 días para casos complejos)',
      secureTransmission: 'Transmisión segura y confidencial'
    },
    en: {
      title: 'Request GDPR Rights',
      description: 'Exercise your data protection rights under GDPR',
      requestType: 'Request Type',
      selectRequestType: 'Select request type',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      phoneNumber: 'Phone Number (Optional)',
      phonePlaceholder: '+34 xxx xxx xxx',
      description: 'Request Description',
      descriptionPlaceholder: 'Describe your request in detail...',
      language: 'Preferred Language',
      identityConfirmation: 'I confirm that I am the data subject',
      dataProcessingConsent: 'I consent to data processing for this request',
      submit: 'Submit Request',
      submitting: 'Submitting...',
      processingTime: 'Processing time: 30 days (maximum 60 days for complex cases)',
      secureTransmission: 'Secure and confidential transmission'
    }
  }

  const t = texts[language]

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {submitResult && (
          <Alert variant={submitResult.success ? "default" : "destructive"}>
            {submitResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {submitResult.message}
              {submitResult.referenceNumber && (
                <div className="mt-2 font-mono text-sm bg-muted p-2 rounded">
                  <strong>Referencia:</strong> {submitResult.referenceNumber}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Request Type */}
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.requestType}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectRequestType} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(REQUEST_TYPE_INFO).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{info[language].title}</div>
                            <div className="text-sm text-muted-foreground">
                              {info[language].description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fullName}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.fullNamePlaceholder} {...field} />
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
                    <FormLabel>{t.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t.emailPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.phoneNumber}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.phonePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Request Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.descriptionPlaceholder}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language Preference */}
            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.language}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmations */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="identityConfirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {t.identityConfirmation}
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataProcessingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {t.dataProcessingConsent}
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Information Panel */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-1">
                <div>{t.processingTime}</div>
                <div className="text-sm">{t.secureTransmission}</div>
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default GdprRequestForm