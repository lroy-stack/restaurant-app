'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shield, Download, Trash2, Mail, MessageSquare, Newspaper, Database } from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerGdprProps {
  customer: Customer
  onConsentUpdate: (consentType: string, granted: boolean) => Promise<boolean>
  onExportData: () => Promise<boolean>
  onDeleteData: () => void
}

interface ConsentStatus {
  emailConsent: boolean
  smsConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
  lastUpdated?: string
}

export function CustomerGdpr({
  customer,
  onConsentUpdate,
  onExportData,
  onDeleteData
}: CustomerGdprProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
    emailConsent: customer.emailConsent,
    smsConsent: customer.smsConsent,
    marketingConsent: customer.marketingConsent,
    dataProcessingConsent: customer.dataProcessingConsent,
  })

  // Fetch current consent status from cookie_consents table
  const fetchConsentStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}/gdpr`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.consentStatus) {
          setConsentStatus(data.consentStatus)
        }
      }
    } catch (error) {
      console.error('Error fetching consent status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConsentStatus()
  }, [customer.id])

  const handleConsentToggle = async (consentType: string, newValue: boolean) => {
    setUpdating(consentType)

    try {
      const success = await onConsentUpdate(consentType, newValue)

      if (success) {
        // Update local state
        setConsentStatus(prev => ({
          ...prev,
          [`${consentType}Consent`]: newValue,
          lastUpdated: new Date().toISOString()
        }))

        toast.success(`Consentimiento ${newValue ? 'otorgado' : 'retirado'} correctamente`)
      } else {
        toast.error('Error al actualizar consentimiento')
      }
    } catch (error) {
      console.error('Error updating consent:', error)
      toast.error('Error al actualizar consentimiento')
    } finally {
      setUpdating(null)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const success = await onExportData()
      if (success) {
        toast.success('Datos exportados correctamente')
      } else {
        toast.error('Error al exportar datos')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Error al exportar datos')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            GDPR
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Email Marketing */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <Label htmlFor="email-marketing" className="text-sm font-medium">
              Email Marketing
            </Label>
          </div>
          <Switch
            id="email-marketing"
            checked={consentStatus.emailConsent}
            onCheckedChange={(checked) => handleConsentToggle('email', checked)}
            disabled={updating === 'email'}
          />
        </div>

        {/* SMS Marketing */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <Label htmlFor="sms-marketing" className="text-sm font-medium">
              SMS Marketing
            </Label>
          </div>
          <Switch
            id="sms-marketing"
            checked={consentStatus.smsConsent}
            onCheckedChange={(checked) => handleConsentToggle('sms', checked)}
            disabled={updating === 'sms'}
          />
        </div>

        {/* Newsletter */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-purple-600" />
            <Label htmlFor="newsletter" className="text-sm font-medium">
              Newsletter
            </Label>
          </div>
          <Switch
            id="newsletter"
            checked={consentStatus.marketingConsent}
            onCheckedChange={(checked) => handleConsentToggle('marketing', checked)}
            disabled={updating === 'marketing'}
          />
        </div>

        {/* Data Processing - Required */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-red-600" />
            <div>
              <Label htmlFor="data-processing" className="text-sm font-medium">
                Procesamiento de Datos
              </Label>
              <Badge variant="secondary" className="ml-2 text-xs">
                Requerido
              </Badge>
            </div>
          </div>
          <Switch
            id="data-processing"
            checked={consentStatus.dataProcessingConsent}
            disabled={true}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={isExporting}
            className="flex-1 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            {isExporting ? 'Exportando...' : 'Exportar Datos'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteData}
            className="flex-1 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar Datos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}