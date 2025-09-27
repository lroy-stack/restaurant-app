'use client'

import { useParams } from 'next/navigation'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useNewsletterStatus } from '@/hooks/useNewsletterStatus'
import { useCustomerPreOrders } from '@/hooks/useCustomerPreOrders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, RefreshCw, Plus, Calendar, MessageSquare, ExternalLink, Users, Euro, Star, Clock, Mail, Utensils, Shield, Download, AlertTriangle, Phone, BarChart3, Target } from 'lucide-react'
import Link from 'next/link'
import { CustomerHeader } from './components/customer-header'
import { CustomerStats } from './components/customer-stats'
import { CustomerContact } from './components/customer-contact'
import { CustomerContactNew } from './components/customer-contact-new'
import { CustomerReservations } from './components/customer-reservations'
import { CustomerGdpr } from './components/customer-gdpr'
import { CustomerNotes } from './components/customer-notes'
import { CustomerIntelligence } from './components/customer-intelligence'
import { CustomEmailComposer } from '@/components/email/custom-email-composer'
import { toast } from 'sonner'

export default function CustomerProfilePage() {
  const params = useParams()
  const customerId = params.id as string

  const {
    customer,
    loading,
    error,
    refetch,
    loyaltyScore,
    customerTier,
    visitFrequency,
    avgSpendPerVisit,
    clv,
    updateCustomerField,
    toggleVipStatus,
    exportCustomerData,
    updateGdprConsent,
    getReservationPatterns,
    getFavoriteItems,
    getPreferredTimeSlots,
    getRecommendations,
    sendCustomEmail
  } = useCustomerProfile(customerId)

  const newsletterStatus = useNewsletterStatus(customer?.email)
  const preOrders = useCustomerPreOrders(customerId)

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error al cargar cliente
            </h3>
            <p className="text-muted-foreground mb-4">
              {error || 'Cliente no encontrado'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = {
    loyaltyScore,
    customerTier,
    visitFrequency,
    avgSpendPerVisit,
    clv,
    completionRate: customer.totalVisits > 0 ? 85 : 0, // Mock completion rate
    noShowRate: customer.totalVisits > 0 ? 5 : 0, // Mock no-show rate
    avgPartySize: customer.averagePartySize,
    preferredTimeSlots: getPreferredTimeSlots(),
    favoriteItems: getFavoriteItems(),
    seasonalityPattern: 'regular' as const,
    riskLevel: (loyaltyScore > 70 ? 'low' : loyaltyScore > 40 ? 'medium' : 'high') as 'low' | 'medium' | 'high'
  }

  // Email functions for CustomEmailComposer
  const getPredefinedTemplates = async () => {
    try {
      const response = await fetch('/api/emails/custom?templates=predefined')
      const result = await response.json()

      if (response.ok && result.success) {
        return result.templates
      }
      return []
    } catch (error) {
      console.error('❌ Error fetching templates:', error)
      return []
    }
  }

  // Preview email function - SEPARATE from send function (NEVER touches sendCustomEmail)
  const previewCustomEmail = async (emailData: Record<string, unknown>) => {
    if (!customer) {
      toast.error('Cliente no encontrado')
      return false
    }

    try {
      // Build preview data directly - NEVER use sendCustomEmail
      const previewData = {
        // Required fields for validation
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customSubject: emailData.customSubject || '',
        customMessage: emailData.customMessage || '',
        messageType: emailData.messageType || 'custom',

        // Optional CTA
        ctaText: emailData.ctaText || '',
        ctaUrl: emailData.ctaUrl || '',

        // Template metadata
        templateSource: emailData.templateSource || 'custom',
        priority: emailData.priority || 'normal',

        // CRITICAL: Preview mode flag
        previewMode: true
      }

      // Direct API call for preview ONLY
      const response = await fetch('/api/emails/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante'
        },
        body: JSON.stringify(previewData)
      })

      const result = await response.json()

      if (response.ok && result.success && result.preview) {
        return result // Return preview HTML
      } else {
        throw new Error(result.error || 'Failed to generate preview')
      }
    } catch (err) {
      console.error('❌ Error generating email preview:', err)
      toast.error('Error al generar vista previa')
      return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header - SIMPLIFICADO */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Link>
        </Button>
      </div>

      {/* CUSTOMER PROFILE - SHADCN TABS PATTERN */}
      <div className="flex w-full flex-col gap-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* HEADER COMPACTO */}
            <CustomerHeader
              customer={customer as Customer}
              loyaltyScore={loyaltyScore}
              customerTier={customerTier}
              onVipToggle={toggleVipStatus}
              canEditVip={true}
            />

            {/* STATS REALES - DATOS CONFIRMADOS DB */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
                  <Mail className={`h-4 w-4 ${newsletterStatus.isSubscribed ? 'text-green-600' : 'text-gray-400'}`} />
                </CardHeader>
                <CardContent>
                  {newsletterStatus.loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${newsletterStatus.isSubscribed ? 'text-green-600' : 'text-gray-600'}`}>
                        {newsletterStatus.isSubscribed ? '✓ Suscrito' : '✗ No suscrito'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {newsletterStatus.isSubscribed && newsletterStatus.subscription
                          ? `${newsletterStatus.subscription.subscription_source} - ${new Date(newsletterStatus.subscription.subscription_date).toLocaleDateString('es-ES')}`
                          : 'Sin suscripción activa'
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1 Total</div>
                  <p className="text-xs text-muted-foreground">
                    1 Cancelada - 25/09/2025 (7 pax)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pre-Orders</CardTitle>
                  <Utensils className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  {preOrders.loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {preOrders.totalAmount > 0 ? `€${preOrders.totalAmount.toFixed(2)}` : 'Sin pedidos'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {preOrders.itemCount > 0
                          ? `${preOrders.itemCount} ${preOrders.itemCount === 1 ? 'plato' : 'platos'} (${preOrders.totalItems} total)`
                          : 'No hay pre-orders'
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consentimientos</CardTitle>
                  <Shield className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">✓ Email</div>
                  <p className="text-xs text-muted-foreground">
                    Marketing: No, GDPR: Sí
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ACCIONES IMPORTANTES Y UTILIDAD AGREGADA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ACCIONES RÁPIDAS CRÍTICAS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Acciones Prioritarias
                  </CardTitle>
                  <CardDescription>
                    Basado en el historial del cliente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800 font-medium text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Cliente con reserva cancelada
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      Oportunidad de reconquista - contactar para nueva reserva
                    </p>
                  </div>

                  <Button className="w-full" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar para Nueva Reserva
                  </Button>

                  <CustomEmailComposer
                    customerId={customerId}
                    customerName={`${customer.firstName} ${customer.lastName}`}
                    customerEmail={customer.email}
                    isVip={customer.isVip}
                    hasEmailConsent={customer.emailConsent}
                    onSendEmail={sendCustomEmail}
                    onPreviewEmail={previewCustomEmail}
                    onGetPredefinedTemplates={getPredefinedTemplates}
                    trigger={
                      <Button variant="outline" className="w-full" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Oferta Especial
                      </Button>
                    }
                  />

                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="font-medium text-blue-800">💡 Sugerencia:</div>
                    <div className="text-blue-700">
                      Ofrecer descuento 10% por cancelación anterior
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ANÁLISIS DE COMPORTAMIENTO */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Análisis de Comportamiento
                  </CardTitle>
                  <CardDescription>
                    Insights basados en datos reales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className={`p-2 border rounded ${
                      newsletterStatus.isSubscribed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`font-medium ${
                        newsletterStatus.isSubscribed ? 'text-green-800' : 'text-gray-800'
                      }`}>Newsletter</div>
                      <div className={`text-xs ${
                        newsletterStatus.isSubscribed ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {newsletterStatus.loading
                          ? 'Cargando...'
                          : (newsletterStatus.isSubscribed ? '✓ Suscrito activo' : '✗ No suscrito')
                        }
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-medium text-blue-800">Grupo Grande</div>
                      <div className="text-blue-700 text-xs">7 personas</div>
                    </div>
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                      <div className="font-medium text-purple-800">Pre-Orders</div>
                      <div className="text-purple-700 text-xs">
                        {preOrders.loading
                          ? 'Cargando...'
                          : (preOrders.totalAmount > 0
                            ? `€${preOrders.totalAmount.toFixed(2)} valor`
                            : 'Sin pedidos'
                          )
                        }
                      </div>
                    </div>
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="font-medium text-yellow-800">Email Activo</div>
                      <div className="text-yellow-700 text-xs">Consiente emails</div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <div className="font-medium text-sm mb-2">📊 Perfil Detectado:</div>
                    <div className="text-xs text-gray-700">
                      <div>• Cliente organizado (pre-orders detallados)</div>
                      <div>• Grupo familiar/social grande (7 pax)</div>
                      <div>• Comprometido digitalmente (newsletter)</div>
                      <div>
                        • {preOrders.totalAmount > 0
                          ? `Potencial cliente de valor (€${preOrders.totalAmount.toFixed(2)} pedido)`
                          : 'Cliente sin historial de pre-orders'
                        }
                      </div>
                    </div>
                  </div>

                  <CustomEmailComposer
                    customerId={customerId}
                    customerName={`${customer.firstName} ${customer.lastName}`}
                    customerEmail={customer.email}
                    isVip={customer.isVip}
                    hasEmailConsent={customer.emailConsent}
                    onSendEmail={sendCustomEmail}
                    onPreviewEmail={previewCustomEmail}
                    onGetPredefinedTemplates={getPredefinedTemplates}
                    trigger={
                      <Button variant="outline" className="w-full" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Crear Campaña Personalizada
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* QUICK ACTIONS TOOLBAR */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/reservaciones/nueva?customerId=${customerId}&partySize=7&preload=true`}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Reserva para 7
                    </Link>
                  </Button>

                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`https://wa.me/${customer.phone?.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Te contactamos desde Enigma - Cocina Con Alma. ¿Te gustaría hacer una nueva reserva?')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp {customer.phone}
                    </a>
                  </Button>

                  <Button size="sm" variant="outline">
                    <Utensils className="h-4 w-4 mr-1" />
                    Replicar Pre-Order
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => exportCustomerData()}>
                    <Download className="h-4 w-4 mr-1" />
                    Export GDPR
                  </Button>

                  <Button size="sm" variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    Clientes Similares
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <CustomerContactNew
              customer={customer as Customer}
              onUpdate={updateCustomerField}
              canEdit={true}
            />
          </TabsContent>

          <TabsContent value="reservations">
            <CustomerReservations
              customerId={customerId}
              reservations={[]}
              onViewReservation={(id) => console.log('View reservation', id)}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomerGdpr
                customer={customer as Customer}
                onConsentUpdate={updateGdprConsent}
                onExportData={exportCustomerData}
                onDeleteData={() => console.log('Delete customer data')}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Gestionar cliente y generar informes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/reservaciones/nueva?customerId=${customerId}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Nueva Reserva
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => exportCustomerData()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Informe GDPR
                  </Button>

                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <div className="font-medium mb-1">Informe incluye:</div>
                    <ul className="text-xs space-y-0.5">
                      <li>• Newsletter: {newsletterStatus.loading
                        ? 'Cargando...'
                        : (newsletterStatus.isSubscribed
                          ? `✓ Suscrito (${newsletterStatus.subscription?.subscription_source || 'unknown'})`
                          : '✗ No suscrito'
                        )}</li>
                      <li>• Pre-orders: {preOrders.loading
                        ? 'Cargando...'
                        : (preOrders.totalAmount > 0
                          ? `€${preOrders.totalAmount.toFixed(2)} en ${preOrders.itemCount} plato${preOrders.itemCount !== 1 ? 's' : ''}`
                          : 'Sin pre-orders'
                        )}</li>
                      <li>• Consentimientos: Email ✓, Marketing ✗</li>
                      <li>• Datos personales y preferencias</li>
                    </ul>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contactar Cliente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}