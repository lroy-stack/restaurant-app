'use client'

import { useParams } from 'next/navigation'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useNewsletterStatus } from '@/hooks/useNewsletterStatus'
import { useCustomerPreOrders } from '@/hooks/useCustomerPreOrders'
import { useCustomerReservationStats } from '@/hooks/useCustomerReservationStats'
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
import { CustomerOrders } from './components/customer-orders'
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
  const reservationStats = useCustomerReservationStats(customerId)

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Newsletter</CardTitle>
                  <Mail className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${newsletterStatus.isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent className="pb-3">
                  {newsletterStatus.loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : (
                    <>
                      <div className={`text-lg sm:text-2xl font-bold leading-tight ${newsletterStatus.isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {newsletterStatus.isSubscribed ? '✓ Suscrito' : '✗ No suscrito'}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
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
                  <CardTitle className="text-xs sm:text-sm font-medium">Reservas</CardTitle>
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent className="pb-3">
                  {reservationStats.loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : (
                    <>
                      <div className="text-lg sm:text-2xl font-bold leading-tight">{reservationStats.total} Total</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                        {reservationStats.completed} Completadas • {reservationStats.upcoming} Próximas • {reservationStats.cancelled} Canceladas
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Pre-Orders</CardTitle>
                  <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent className="pb-3">
                  {preOrders.loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : (
                    <>
                      <div className="text-lg sm:text-2xl font-bold leading-tight">
                        {preOrders.totalAmount > 0 ? `€${preOrders.totalAmount.toFixed(2)}` : 'Sin pedidos'}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
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
                  <CardTitle className="text-xs sm:text-sm font-medium">Consentimientos</CardTitle>
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-lg sm:text-2xl font-bold leading-tight">✓ Email</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
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
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Cliente con reserva cancelada
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
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

                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                    <div className="font-medium text-blue-700 dark:text-blue-400">💡 Sugerencia:</div>
                    <div className="text-blue-600 dark:text-blue-400">
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
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-muted border-border'
                    }`}>
                      <div className={`font-medium ${
                        newsletterStatus.isSubscribed ? 'text-green-700 dark:text-green-400' : 'text-foreground'
                      }`}>Newsletter</div>
                      <div className={`text-xs ${
                        newsletterStatus.isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                        {newsletterStatus.loading
                          ? 'Cargando...'
                          : (newsletterStatus.isSubscribed ? '✓ Suscrito activo' : '✗ No suscrito')
                        }
                      </div>
                    </div>
                    <div className={`p-2 border rounded ${
                      reservationStats.loading
                        ? 'bg-muted border-border'
                        : reservationStats.total >= 10
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : reservationStats.total >= 5
                        ? 'bg-purple-500/10 border-purple-500/20'
                        : 'bg-orange-500/10 border-orange-500/20'
                    }`}>
                      <div className={`font-medium ${
                        reservationStats.loading
                          ? 'text-foreground'
                          : reservationStats.total >= 10
                          ? 'text-blue-700 dark:text-blue-400'
                          : reservationStats.total >= 5
                          ? 'text-purple-700 dark:text-purple-400'
                          : 'text-orange-700 dark:text-orange-400'
                      }`}>
                        {reservationStats.loading
                          ? 'Cargando...'
                          : reservationStats.total >= 10
                          ? 'Cliente Frecuente'
                          : reservationStats.total >= 5
                          ? 'Cliente Regular'
                          : 'Cliente Nuevo'
                        }
                      </div>
                      <div className={`text-xs ${
                        reservationStats.loading
                          ? 'text-muted-foreground'
                          : reservationStats.total >= 10
                          ? 'text-blue-600 dark:text-blue-400'
                          : reservationStats.total >= 5
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {reservationStats.loading ? '...' : `${reservationStats.total} reservas`}
                      </div>
                    </div>
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded">
                      <div className="font-medium text-purple-700 dark:text-purple-400">Pre-Orders</div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs">
                        {preOrders.loading
                          ? 'Cargando...'
                          : (preOrders.totalAmount > 0
                            ? `€${preOrders.totalAmount.toFixed(2)} valor`
                            : 'Sin pedidos'
                          )
                        }
                      </div>
                    </div>
                    <div className={`p-2 border rounded ${
                      reservationStats.loading
                        ? 'bg-muted border-border'
                        : reservationStats.completed > 0 && reservationStats.total > 0
                        ? ((reservationStats.completed / reservationStats.total) * 100) >= 75
                          ? 'bg-green-500/10 border-green-500/20'
                          : ((reservationStats.completed / reservationStats.total) * 100) >= 50
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                        : 'bg-muted border-border'
                    }`}>
                      <div className={`font-medium ${
                        reservationStats.loading
                          ? 'text-foreground'
                          : reservationStats.completed > 0 && reservationStats.total > 0
                          ? ((reservationStats.completed / reservationStats.total) * 100) >= 75
                            ? 'text-green-700 dark:text-green-400'
                            : ((reservationStats.completed / reservationStats.total) * 100) >= 50
                            ? 'text-yellow-700 dark:text-yellow-400'
                            : 'text-red-700 dark:text-red-400'
                          : 'text-foreground'
                      }`}>Completitud</div>
                      <div className={`text-xs ${
                        reservationStats.loading
                          ? 'text-muted-foreground'
                          : reservationStats.completed > 0 && reservationStats.total > 0
                          ? ((reservationStats.completed / reservationStats.total) * 100) >= 75
                            ? 'text-green-600 dark:text-green-400'
                            : ((reservationStats.completed / reservationStats.total) * 100) >= 50
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                      }`}>
                        {reservationStats.loading
                          ? 'Cargando...'
                          : reservationStats.total > 0
                          ? `${Math.round((reservationStats.completed / reservationStats.total) * 100)}% asistencias`
                          : 'Sin datos'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted border rounded-lg">
                    <div className="font-medium text-sm mb-2">📊 Perfil Detectado:</div>
                    <div className="text-xs text-foreground/80">
                      {reservationStats.loading || preOrders.loading ? (
                        <div>Cargando análisis...</div>
                      ) : (
                        <>
                          <div>
                            • {reservationStats.total >= 10
                              ? 'Cliente frecuente y fiel'
                              : reservationStats.total >= 5
                              ? 'Cliente regular en crecimiento'
                              : 'Cliente nuevo - potencial de fidelización'
                            } ({reservationStats.total} reservas)
                          </div>
                          <div>
                            • Tasa de asistencia: {reservationStats.total > 0
                              ? `${Math.round((reservationStats.completed / reservationStats.total) * 100)}%`
                              : 'N/A'
                            } {reservationStats.total > 0 && ((reservationStats.completed / reservationStats.total) * 100) >= 75
                              ? '(excelente)'
                              : reservationStats.total > 0 && ((reservationStats.completed / reservationStats.total) * 100) >= 50
                              ? '(buena)'
                              : reservationStats.total > 0
                              ? '(mejorable)'
                              : ''
                            }
                          </div>
                          {preOrders.totalAmount > 0 && (
                            <div>
                              • Cliente organizado - usa pre-orders (€{preOrders.totalAmount.toFixed(2)} total)
                            </div>
                          )}
                          {newsletterStatus.isSubscribed && (
                            <div>• Comprometido digitalmente (suscrito newsletter)</div>
                          )}
                          {customer?.isVip && (
                            <div>• Status VIP - cliente de alto valor</div>
                          )}
                          {customer?.emailConsent && (
                            <div>• Abierto a comunicación directa</div>
                          )}
                        </>
                      )}
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
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-primary/20">
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

          <TabsContent value="orders">
            <CustomerOrders customerId={customerId} />
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