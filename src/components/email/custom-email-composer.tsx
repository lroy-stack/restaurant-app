'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mail, Send, Eye, Sparkles, Gift, MessageSquare, Crown,
  AlertCircle, Loader2, Target, Calendar, Utensils,
  Globe, ExternalLink, User, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CustomEmailData } from '@/lib/email/types/emailTypes'

interface PredefinedTemplate {
  id: string
  name: string
  messageType: 'offer' | 'promotion' | 'followup' | 'custom'
  description: string
  defaultSubject: string
  defaultMessage: string
  defaultCtaText: string
  icon: string
  category: string
}

interface CustomEmailComposerProps {
  customerId: string
  customerName: string
  customerEmail: string
  isVip?: boolean
  hasEmailConsent?: boolean
  onSendEmail?: (emailData: Partial<CustomEmailData>) => Promise<boolean | any>
  onPreviewEmail?: (emailData: Partial<CustomEmailData>) => Promise<any>
  onGetPredefinedTemplates?: () => Promise<PredefinedTemplate[]>
  trigger?: React.ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const DEFAULT_TRIGGER = (
  <Button variant="outline" size="sm" className="gap-2">
    <Mail className="h-4 w-4" />
    Enviar Email
  </Button>
)

const MESSAGE_TYPE_ICONS = {
  offer: Gift,
  promotion: Sparkles,
  followup: MessageSquare,
  custom: Mail
} as const

const MESSAGE_TYPE_LABELS = {
  offer: 'Oferta Especial',
  promotion: 'Promoción',
  followup: 'Seguimiento',
  custom: 'Personalizado'
} as const

const PRIORITY_ICONS = {
  low: Target,
  normal: User,
  high: AlertCircle
} as const

export function CustomEmailComposer({
  customerId,
  customerName,
  customerEmail,
  isVip = false,
  hasEmailConsent = true,
  onSendEmail,
  onPreviewEmail,
  onGetPredefinedTemplates,
  trigger = DEFAULT_TRIGGER,
  defaultOpen = false,
  onOpenChange
}: CustomEmailComposerProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [predefinedTemplates, setPredefinedTemplates] = useState<PredefinedTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // Form state
  const [emailData, setEmailData] = useState<Partial<CustomEmailData>>({
    messageType: 'custom',
    customSubject: '',
    customMessage: '',
    ctaText: '',
    ctaUrl: '',
    priority: 'normal',
    templateSource: 'custom'
  })

  // Handle dialog open/close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)

    if (!newOpen) {
      // Reset form when closing
      setEmailData({
        messageType: 'custom',
        customSubject: '',
        customMessage: '',
        ctaText: '',
        ctaUrl: '',
        priority: 'normal',
        templateSource: 'custom'
      })
      setSelectedTemplate('')
      setPreviewMode(false)
    }
  }

  // Load predefined templates when dialog opens
  useEffect(() => {
    if (open && onGetPredefinedTemplates) {
      onGetPredefinedTemplates().then(setPredefinedTemplates).catch(console.error)
    }
  }, [open, onGetPredefinedTemplates])

  // Apply predefined template
  const applyTemplate = (template: PredefinedTemplate) => {
    setEmailData(prev => ({
      ...prev,
      messageType: template.messageType,
      customSubject: template.defaultSubject.replace('{customerName}', customerName).replace('{restaurantName}', 'Enigma Cocina Con Alma'),
      customMessage: template.defaultMessage,
      ctaText: template.defaultCtaText,
      templateSource: 'predefined'
    }))
    setSelectedTemplate(template.id)
  }

  // Handle form field changes
  const updateField = (field: keyof CustomEmailData, value: any) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
    if (selectedTemplate && field !== 'templateSource') {
      setSelectedTemplate('') // Clear template selection if manually editing
    }
  }

  // Validate form - ensure actual content exists
  const isFormValid = () => {
    const subject = emailData.customSubject?.trim() || ''
    const message = emailData.customMessage?.trim() || ''
    const type = emailData.messageType || ''

    return subject.length > 0 &&
           message.length > 0 &&
           type.length > 0
  }

  // Handle preview with example data if form is empty
  const handlePreview = async () => {
    setLoading(true)
    setPreviewMode(true)

    try {
      // Build preview data - use form data or examples
      const previewData = {
        messageType: emailData.messageType || 'custom',
        customSubject: (emailData.customSubject || '').trim() || 'Vista previa del email personalizado',
        customMessage: (emailData.customMessage || '').trim() || `
          <p>Estimado/a <strong>${customerName}</strong>,</p>
          <p>Este es un ejemplo de vista previa del email que enviarías desde <strong>Enigma Cocina Con Alma</strong>.</p>
          <p>Aquí aparecería tu mensaje personalizado con el contenido que escribas en el formulario.</p>
          <p>Gracias por confiar en nosotros.</p>
        `,
        customerName: customerName || 'Cliente Ejemplo',
        customerEmail: customerEmail || 'cliente@ejemplo.com',
        ctaText: (emailData.ctaText || '').trim() || 'Ver Más',
        ctaUrl: (emailData.ctaUrl || '').trim() || 'https://enigmaconalma.com',
        priority: emailData.priority || 'normal',
        templateSource: emailData.templateSource || 'custom',
        previewMode: true
      }

      // Use external preview or internal fallback
      const result = onPreviewEmail ? await onPreviewEmail(previewData) : await handlePreviewInternal(previewData)

      if (result && typeof result === 'object' && result.html) {
        // Show preview in new window
        const previewWindow = window.open('', 'emailPreview', 'width=800,height=600,scrollbars=yes')
        if (previewWindow) {
          previewWindow.document.write(result.html)
          previewWindow.document.title = 'Vista Previa - ' + previewData.customSubject
        }
        toast.success('Vista previa generada correctamente')
      } else {
        throw new Error('Preview result did not contain HTML content')
      }
    } catch (error) {
      console.error('❌ Preview error:', error)
      toast.error('Error al generar vista previa')
    } finally {
      setLoading(false)
      setPreviewMode(false)
    }
  }

  // Internal email sending - AUTOCONTENIDO
  const sendEmailInternal = async (emailData: any) => {
    try {
      const response = await fetch('/api/emails/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante'
        },
        body: JSON.stringify({
          // ✅ FIXED: Spread emailData but filter out empty optional fields
          messageType: emailData.messageType,
          customSubject: emailData.customSubject,
          customMessage: emailData.customMessage,
          priority: emailData.priority,
          templateSource: emailData.templateSource,
          customerName,
          customerEmail,
          // Only include CTA fields if they have actual content
          ...(emailData.ctaText?.trim() && { ctaText: emailData.ctaText.trim() }),
          ...(emailData.ctaUrl?.trim() && { ctaUrl: emailData.ctaUrl.trim() }),
          // Basic client context
          clientContext: {
            hasEmailConsent: hasEmailConsent,
            hasMarketingConsent: hasEmailConsent
          }
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (emailData.previewMode) {
          return result // Return preview data
        }
        return true
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('❌ Error sending email:', error)
      throw error
    }
  }

  // Internal preview handling - AUTOCONTENIDO
  const handlePreviewInternal = async (previewData: any) => {
    try {
      const result = await sendEmailInternal({ ...previewData, previewMode: true })
      return result
    } catch (error) {
      console.error('❌ Error generating preview:', error)
      throw error
    }
  }

  // Handle send email - USA FUNCIÓN EXTERNA O INTERNA
  const handleSend = async () => {
    if (!isFormValid()) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const sendData = {
        ...emailData,
        customerName,
        customerEmail
      }

      // Use external function if provided, otherwise use internal
      const success = onSendEmail ? await onSendEmail(sendData) : await sendEmailInternal(sendData)

      if (success) {
        toast.success(`Email ${emailData.messageType} enviado correctamente`)
        handleOpenChange(false)
      }
    } catch (error) {
      console.error('Send error:', error)
      toast.error('Error al enviar email')
    } finally {
      setLoading(false)
    }
  }

  const MessageTypeIcon = MESSAGE_TYPE_ICONS[emailData.messageType as keyof typeof MESSAGE_TYPE_ICONS] || Mail

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Componer Email Personalizado
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Enviar a {customerName} • {customerEmail}</span>
            {isVip && (
              <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                <Crown className="h-3 w-3" />
                VIP
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Email Consent Warning */}
            {!hasEmailConsent && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Este cliente no ha dado consentimiento para recibir emails de marketing.
                  Considera contactarlo de otra manera.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Template Selector - Dropdown for mobile/tablet, List for desktop */}
              {predefinedTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Plantillas Predefinidas
                  </Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={(value) => {
                      const template = predefinedTemplates.find(t => t.id === value)
                      if (template) applyTemplate(template)
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecciona una plantilla..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedTemplates.map((template) => {
                        const TemplateIcon = MESSAGE_TYPE_ICONS[template.messageType as keyof typeof MESSAGE_TYPE_ICONS] || Mail
                        return (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <TemplateIcon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-muted-foreground">{template.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Email Form */}
              <div className="space-y-6">
                  {/* Message Type & Priority Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Tipo de Mensaje
                      </Label>
                      <Select
                        value={emailData.messageType}
                        onValueChange={(value: any) => updateField('messageType', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(MESSAGE_TYPE_LABELS).map(([type, label]) => {
                            const Icon = MESSAGE_TYPE_ICONS[type as keyof typeof MESSAGE_TYPE_ICONS]
                            return (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Prioridad
                      </Label>
                      <Select
                        value={emailData.priority}
                        onValueChange={(value: any) => updateField('priority', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              Baja
                            </div>
                          </SelectItem>
                          <SelectItem value="normal">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              Normal
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              Alta
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Asunto <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      value={emailData.customSubject || ''}
                      onChange={(e) => updateField('customSubject', e.target.value)}
                      placeholder="Escribe el asunto del email..."
                      className="h-10"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-primary" />
                      Mensaje <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={emailData.customMessage || ''}
                      onChange={(e) => updateField('customMessage', e.target.value)}
                      placeholder="Escribe tu mensaje personalizado aquí... Puedes usar HTML básico para dar formato."
                      rows={6}
                      className="resize-none min-h-[120px]"
                    />
                  </div>

                  {/* CTA Section */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-primary" />
                        Call to Action (Opcional)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Añade un botón de acción para dirigir al cliente a una página específica
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="ctaText" className="text-xs text-muted-foreground">Texto del botón</Label>
                        <Input
                          id="ctaText"
                          value={emailData.ctaText || ''}
                          onChange={(e) => updateField('ctaText', e.target.value)}
                          placeholder="Ej: Reservar Ahora"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="ctaUrl" className="text-xs text-muted-foreground">URL del enlace</Label>
                        <Input
                          id="ctaUrl"
                          value={emailData.ctaUrl || ''}
                          onChange={(e) => updateField('ctaUrl', e.target.value)}
                          placeholder="https://enigmaconalma.com/..."
                          className="h-9"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={loading}
                      className="gap-2 flex-1"
                    >
                      {previewMode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      Vista Previa
                    </Button>

                    <Button
                      onClick={handleSend}
                      disabled={loading || !isFormValid() || !hasEmailConsent}
                      className="gap-2 flex-1"
                    >
                      {loading && !previewMode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Enviar Email
                    </Button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CustomEmailComposer