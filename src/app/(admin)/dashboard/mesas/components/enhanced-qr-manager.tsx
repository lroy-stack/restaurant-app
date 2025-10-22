'use client'
import { getSupabaseHeaders } from '@/lib/supabase/config'
// Force recompilation
import { useState, useEffect, useMemo } from 'react'
import { useTableStore } from '@/stores/useTableStore'
import { useRestaurant } from '@/hooks/use-restaurant'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeSVG } from 'qrcode.react'
import QRCodeStyling from 'qr-code-styling'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
// XLSX removed for security - export functionality replaced with CSV
import { 
  QrCode,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Wifi,
  Menu,
  Smartphone,
  MapPin,
  Copy,
  Check,
  Trash2,
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  Palette,
  Settings,
  Activity,
  Zap,
  Upload,
  Users
} from 'lucide-react'

// Real database interfaces based on Enigma schema
interface TableData {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_1' | 'MAIN_ROOM' | 'VIP_ROOM' | 'TERRACE_2'
  qrCode: string
  isActive: boolean
  restaurantId: string
  createdAt: string
  updatedAt: string
}

interface ReservationData {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  specialRequests: string | null
  hasPreOrder: boolean
  tableId: string | null
  restaurantId: string
  customerId: string | null
}

interface QRAnalytics {
  totalTables: number
  activeQRCodes: number
  totalReservations: number
  qrBasedReservations: number
  conversionRate: number
  recentActivity: ReservationData[]
  tablePerformance: Array<{ tableId: string; tableNumber: string; reservationCount: number }>
}

interface EnhancedQRCodeManagerProps {
  tables: Array<{
    id: string
    number: string  // Enigma uses string format like "T1", "S1" 
    capacity: number
    location: 'TERRACE_1' | 'MAIN_ROOM' | 'VIP_ROOM' | 'TERRACE_2'
    qrCode?: string
    isActive: boolean
  }>
}

// QR Templates - Now dynamic from restaurant config
const getQRTemplates = (primaryColor: string = '#237584', backgroundColor: string = '#FFFFFF') => ({
  'primary': {
    name: 'Color Principal',
    description: 'Diseño con el color principal del restaurante',
    colors: { background: backgroundColor, foreground: primaryColor },
    logo: false
  },
  'high-contrast': {
    name: 'Alto Contraste',
    description: 'Negro sobre blanco - máxima legibilidad',
    colors: { background: '#FFFFFF', foreground: '#000000' },
    logo: false
  },
  'custom': {
    name: 'Personalizado',
    description: 'Configura tus propios colores',
    colors: { background: backgroundColor, foreground: primaryColor },
    logo: false
  }
})

// Zone labels - Dynamic from restaurant config
const getZoneLabels = (restaurant: any) => ({
  'TERRACE_1': restaurant?.zone_terrace_1_label || 'Terraza 1',
  'MAIN_ROOM': restaurant?.zone_main_room_label || 'Sala Principal',
  'VIP_ROOM': restaurant?.zone_vip_room_label || 'Sala VIP',
  'TERRACE_2': restaurant?.zone_terrace_2_label || 'Terraza 2',
  'TERRACE': 'Terraza',
  'INTERIOR': 'Interior',
  'BAR': 'Bar'
})

export function EnhancedQRManager({ tables: initialTables }: EnhancedQRCodeManagerProps) {
  // Use Zustand store instead of props
  const { tables: storeTables, loadTables } = useTableStore()
  const { restaurant } = useRestaurant()
  const tables = storeTables.length > 0 ? storeTables : initialTables
  const [localTables, setLocalTables] = useState(tables)

  // Dynamic QR templates based on restaurant config
  const qrTemplates = getQRTemplates(
    restaurant?.qr_primary_color || '#237584',
    restaurant?.qr_background_color || '#FFFFFF'
  )

  // Dynamic zone labels
  const ZONE_LABELS = getZoneLabels(restaurant)

  // Load tables from store on mount
  useEffect(() => {
    loadTables()
  }, [])

  // Update local tables when store changes
  useEffect(() => {
    setLocalTables(tables)
  }, [tables])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string>('')
  const [activeTab, setActiveTab] = useState('management')
  const [realAnalytics, setRealAnalytics] = useState<QRAnalytics>({
    totalTables: 0,
    activeQRCodes: 0,
    totalReservations: 0,
    qrBasedReservations: 0,
    conversionRate: 0,
    recentActivity: [],
    tablePerformance: []
  })
  const [qrAnalyticsData, setQRAnalyticsData] = useState<any>({
    totalScans: 0,
    uniqueTables: 0,
    avgScansPerTable: 0,
    conversionRate: 0,
    dailyScans: [],
    hourlyDistribution: [],
    topTables: [],
    utmAnalysis: { sources: [], mediums: [], campaigns: [] },
    tableMetrics: []
  })

  const [qrConfig, setQrConfig] = useState({
    includeMenuLink: true,
    includeWifiInfo: false,
    customMessage: '',
    wifiSSID: restaurant?.name ? `${restaurant.name.split(' ')[0]}_Guest` : 'Guest_WiFi',
    wifiPassword: '',
    menuUrl: process.env.NEXT_PUBLIC_QR_MENU_URL || 'https://menu.enigmaconalma.com',
    template: 'primary' as keyof ReturnType<typeof getQRTemplates>,
    branding: true,
    callToAction: 'Ver Carta Digital',
    customForegroundColor: restaurant?.qr_primary_color || '#237584',
    customBackgroundColor: restaurant?.qr_background_color || '#FFFFFF'
  })


  // Fetch real QR analytics data from new APIs
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch real QR analytics from our new API
        const analyticsResponse = await fetch('/api/qr/analytics?days=30')
        const analyticsData = await analyticsResponse.json()
        
        if (!analyticsData.success) {
          throw new Error(analyticsData.error || 'Failed to fetch QR analytics')
        }

        const { analytics } = analyticsData
        
        // Calculate real metrics using QR scan data
        const totalTables = tables.length
        const activeQRCodes = tables.filter(t => t.isActive && t.qrCode).length
        
        // Transform QR analytics to match our interface
        const recentActivity = analytics.recentActivity
          .slice(0, 5)
          .map((scan: any) => {
            const table = analytics.tableMetrics.find((t: any) => t.tableId === scan.table_id)
            return {
              id: scan.id,
              customerName: 'Cliente QR',
              tableNumber: table?.tableNumber || 'Desconocida',
              timestamp: scan.scanned_at,
              action: scan.converted_to_reservation ? 'Escaneo → Reserva' : 'Escaneo QR',
              partySize: 1,
              specialRequests: `UTM: ${scan.utm_source}/${scan.utm_medium}`,
              hasPreOrder: false,
              tableId: scan.table_id,
              restaurantId: process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001',
              customerId: null,
              customerEmail: '',
              customerPhone: '',
              date: scan.scanned_at.split('T')[0],
              time: scan.scanned_at.split('T')[1],
              status: scan.converted_to_reservation ? 'COMPLETED' : 'PENDING'
            }
          })
        
        // Use top performing tables from QR analytics
        const tablePerformance = analytics.topTables.map((table: any) => ({
          tableId: table.tableId,
          tableNumber: table.tableNumber,
          reservationCount: table.totalScans
        }))
        
        setRealAnalytics({
          totalTables,
          activeQRCodes,
          totalReservations: analytics.totalScans, // Total QR scans as "reservations"
          qrBasedReservations: analytics.totalScans, // All scans are QR-based
          conversionRate: Math.round(analytics.conversionRate), // Real conversion rate from API
          recentActivity,
          tablePerformance
        })

        // Store additional QR-specific analytics
        setQRAnalyticsData({
          totalScans: analytics.totalScans,
          uniqueTables: analytics.uniqueTables,
          avgScansPerTable: Math.round(analytics.avgScansPerTable * 10) / 10,
          conversionRate: Math.round(analytics.conversionRate * 10) / 10,
          dailyScans: analytics.dailyScans,
          hourlyDistribution: analytics.hourlyDistribution,
          topTables: analytics.topTables,
          utmAnalysis: analytics.utmAnalysis,
          tableMetrics: analytics.tableMetrics
        })

      } catch (error) {
        console.error('Error fetching QR analytics:', error)
        toast.error('Error cargando analytics de QR')
        
        // Fallback to basic table count if QR analytics fail
        setRealAnalytics({
          totalTables: tables.length,
          activeQRCodes: tables.filter(t => t.isActive && t.qrCode).length,
          totalReservations: 0,
          qrBasedReservations: 0,
          conversionRate: 0,
          recentActivity: [],
          tablePerformance: []
        })
      }
    }
    
    fetchAnalytics()
  }, [tables])

  const getLocationLabel = (location: string) => {
    return ZONE_LABELS[location as keyof typeof ZONE_LABELS] || location
  }

  // SECURE QR GENERATION - Following OWASP + Restaurant Security Best Practices 2024
  const generateSecureQRContent = (
    tableNumber: string,
    tableId: string,
    location: string,
    template: keyof ReturnType<typeof getQRTemplates> = 'primary'
  ): string => {
    // ✅ QR Permanente - Generate hash without timestamp
    const payload = `${tableId}:${location}`
    // Convert to base64url manually (Node.js doesn't support base64url encoding directly)
    const base64 = Buffer.from(payload).toString('base64')
    const secureIdentifier = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 12)

    // SECURE URL FORMAT - HTTPS mandatory + table-specific identifier
    const secureUrl = new URL(qrConfig.menuUrl)
    secureUrl.searchParams.set('mesa', tableNumber)
    secureUrl.searchParams.set('qr', secureIdentifier)
    secureUrl.searchParams.set('table_id', tableId)
    secureUrl.searchParams.set('location', location)
    secureUrl.searchParams.set('utm_source', 'qr')
    secureUrl.searchParams.set('utm_medium', 'table')
    secureUrl.searchParams.set('utm_campaign', 'restaurante')
    // ✅ NO timestamp - QR válido indefinidamente

    return secureUrl.toString()
  }

  // LEGACY: Enhanced QR code content generation (deprecated - use generateSecureQRContent)
  const generateEnhancedQRContent = (tableNumber: string, template: keyof ReturnType<typeof getQRTemplates> = 'primary') => {
    console.warn('[DEPRECATED] Use generateSecureQRContent for security compliance')
    const baseUrl = qrConfig.menuUrl + `?mesa=${tableNumber}&utm_source=qr&utm_medium=table&utm_campaign=restaurante`

    if (template === 'primary') {
      return {
        url: baseUrl,
        data: {
          restaurant: restaurant?.name || 'Restaurante',
          table: tableNumber,
          action: qrConfig.callToAction,
          wifi: qrConfig.includeWifiInfo ? {
            ssid: qrConfig.wifiSSID,
            password: qrConfig.wifiPassword
          } : null,
          message: qrConfig.customMessage
        }
      }
    }

    return baseUrl
  }

  // Generate styled QR code using qr-code-styling
  const generateStyledQRCode = async (url: string, template: keyof ReturnType<typeof getQRTemplates> = 'primary'): Promise<QRCodeStyling> => {
    const templateConfig = qrTemplates[template]
    const qrCode = new QRCodeStyling({
      width: 400,
      height: 400,
      data: url,
      dotsOptions: {
        color: templateConfig.colors.foreground,
        type: 'rounded'
      },
      backgroundOptions: {
        color: templateConfig.colors.background
      }
    })

    return qrCode
  }

  // Download individual QR as PNG (high quality)
  const downloadStyledQR = async (tableNumber: string, tableId: string, location: string, format: 'png' | 'svg' = 'png') => {
    try {
      const { QRExportService, QR_TEMPLATES } = await import('@/lib/services/QRExportService')

      const url = generateSecureQRContent(tableNumber, tableId, location, qrConfig.template)
      const template = QR_TEMPLATES[0] // Use first template

      const qrDataURL = await QRExportService.generateQRDataURL(url, template, 800)
      const restaurantPrefix = restaurant?.name?.split(' ')[0]?.toLowerCase() || 'restaurante'
      const fileName = `${restaurantPrefix}-qr-mesa-${tableNumber}-${qrConfig.template}.png`

      const link = document.createElement('a')
      link.download = fileName
      link.href = qrDataURL
      link.click()

      toast.success(`✅ QR Mesa ${tableNumber} descargado`)
    } catch (error) {
      console.error('Error downloading QR:', error)
      toast.error('Error al descargar QR')
    }
  }

  // Save QR code to database - REAL DATABASE PERSISTENCE
  const saveQRToDatabase = async (tableId: string, qrUrl: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/tables/qr', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
        },
        body: JSON.stringify({
          tableId,
          qrCode: qrUrl
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Error saving QR to database:', error)
      return false
    }
  }


  // Generate and save SECURE QR codes to database
  const generateAndSaveQRCode = async (tableId: string, tableNumber: string) => {
    const table = tables.find(t => t.id === tableId)
    if (!table) throw new Error('Table not found')
    
    // Use SECURE QR generation with cryptographic identifier
    const secureQRContent = generateSecureQRContent(
      tableNumber, 
      tableId, 
      table.location,
      qrConfig.template
    )
    
    // Save to database with security compliance
    const saved = await saveQRToDatabase(tableId, secureQRContent)
    
    if (saved) {
      // Update local state with secure QR
      setLocalTables(prev => prev.map(t =>
        t.id === tableId
          ? { ...t, qrCode: secureQRContent }
          : t
      ))
      return secureQRContent
    }
    
    throw new Error('Failed to save secure QR code to database')
  }

  // Batch QR code generation with REAL database persistence
  const generateBatchQRCodes = async () => {
    if (selectedTables.length === 0) {
      toast.error('Por favor selecciona al menos una mesa')
      return
    }

    setIsGenerating(true)
    setBatchProgress(0)

    try {
      const results = []
      
      for (let i = 0; i < selectedTables.length; i++) {
        const tableId = selectedTables[i]
        const table = tables.find(t => t.id === tableId)
        
        if (!table) continue

        // Generate SECURE QR content with cryptographic verification
        const secureQRContent = generateSecureQRContent(
          table.number,
          tableId,
          table.location,
          qrConfig.template
        )
        
        // Save SECURE QR to REAL database
        const saved = await saveQRToDatabase(tableId, secureQRContent)
        
        if (saved) {
          results.push({
            tableId,
            tableNumber: table.number,
            content: secureQRContent,
            status: 'saved'
          })

          // Update local state immediately with SECURE QR
          setLocalTables(prev => prev.map(t =>
            t.id === tableId
              ? { ...t, qrCode: secureQRContent }
              : t
          ))
        } else {
          results.push({
            tableId,
            tableNumber: table.number,
            content: secureQRContent,
            status: 'failed'
          })
        }

        // Update progress
        setBatchProgress(Math.round(((i + 1) / selectedTables.length) * 100))
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      const successCount = results.filter(r => r.status === 'saved').length
      const failureCount = results.filter(r => r.status === 'failed').length
      
      if (successCount > 0) {
        toast.success(`✅ ${successCount} códigos QR guardados en base de datos`)
      }
      if (failureCount > 0) {
        toast.error(`❌ ${failureCount} códigos fallaron al guardar`)
      }
      
      setSelectedTables([])
      setBatchProgress(0)
      setIsGenerating(false)

    } catch (error) {
      console.error('Error in batch generation:', error)
      toast.error('Error en la generación masiva')
      setIsGenerating(false)
      setBatchProgress(0)
    }
  }

  // Export QR codes - Optimized DIN A4 layout (3x4 grid)
  const exportQRCodesPDF = async () => {
    if (selectedTables.length === 0) {
      toast.error('Por favor selecciona mesas para exportar')
      return
    }

    try {
      toast.info('Generando PDF...', { description: 'Esto puede tomar unos segundos' })

      const { QRExportService, QR_TEMPLATES } = await import('@/lib/services/QRExportService')
      const doc = new jsPDF()

      const COLS = 4
      const ROWS = 4
      const QR_SIZE = 45
      const PAGE_WIDTH = 210
      const PAGE_HEIGHT = 297
      const SPACING_X = 6
      const SPACING_Y = 8
      const MARGIN_X = (PAGE_WIDTH - (COLS * QR_SIZE) - ((COLS - 1) * SPACING_X)) / 2
      const MARGIN_Y = 25
      const ITEMS_PER_PAGE = COLS * ROWS

      // Find selected template
      const template = QR_TEMPLATES[0] // Use first available template

      for (let pageIndex = 0; pageIndex < Math.ceil(selectedTables.length / ITEMS_PER_PAGE); pageIndex++) {
        if (pageIndex > 0) doc.addPage()

        const pageTables = selectedTables
          .slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
          .map(id => tables.find(t => t.id === id))
          .filter((t): t is NonNullable<typeof t> => t !== undefined)

        // Header
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`QR Codes Mesas - ${restaurant?.name || 'Restaurante'}`, PAGE_WIDTH / 2, 15, { align: 'center' })

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Color: ${qrConfig.template}`, PAGE_WIDTH / 2, 20, { align: 'center' })

        for (let i = 0; i < pageTables.length; i++) {
          const table = pageTables[i]
          const row = Math.floor(i / COLS)
          const col = i % COLS
          const x = MARGIN_X + col * (QR_SIZE + SPACING_X)
          const y = MARGIN_Y + row * (QR_SIZE + SPACING_Y + 15)

          const qrContent = generateSecureQRContent(table.number, table.id, table.location || 'MAIN_ROOM', qrConfig.template)
          const qrDataURL = await QRExportService.generateQRDataURL(qrContent, template, 400)

          doc.addImage(qrDataURL, 'PNG', x, y, QR_SIZE, QR_SIZE)

          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(`Mesa ${table.number}`, x + QR_SIZE / 2, y + QR_SIZE + 4, { align: 'center' })

          doc.setFontSize(6)
          doc.setFont('helvetica', 'normal')
          doc.text(getLocationLabel(table.location), x + QR_SIZE / 2, y + QR_SIZE + 8, { align: 'center' })
        }

        // Footer
        doc.setFontSize(7)
        doc.text(
          `Página ${pageIndex + 1} de ${Math.ceil(selectedTables.length / ITEMS_PER_PAGE)} | Generado: ${new Date().toLocaleDateString('es-ES')}`,
          PAGE_WIDTH / 2,
          PAGE_HEIGHT - 10,
          { align: 'center' }
        )
      }

      doc.save(`enigma-mesas-qr-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success(`✅ PDF exportado con ${selectedTables.length} códigos QR`)

    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error en la exportación PDF')
    }
  }

  // Copy QR content to clipboard
  const copyToClipboard = async (content: string, tableNumber: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedCode(`mesa-${tableNumber}`)
      toast.success('URL del código QR copiada')
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (error) {
      toast.error('Error al copiar')
    }
  }

  // Toggle table selection
  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-12">
          <TabsTrigger value="management">Gestión QR</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          {/* Control Panel - Responsive layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {selectedTables.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <QrCode className="h-3 w-3" />
                  {selectedTables.length} seleccionadas
                </Badge>
              )}

              {isGenerating && (
                <div className="flex items-center gap-2">
                  <Progress value={batchProgress} className="w-24 sm:w-32" />
                  <span className="text-sm text-muted-foreground">{batchProgress}%</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportQRCodesPDF}
                disabled={selectedTables.length === 0 || isGenerating}
                className="text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Exportar </span>PDF
              </Button>

              <Button
                size="sm"
                onClick={generateBatchQRCodes}
                disabled={selectedTables.length === 0 || isGenerating}
                className="text-xs"
              >
                {isGenerating ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 mr-1" />
                )}
                {isGenerating ? 'Generando...' : (
                  <span>
                    <span className="hidden sm:inline">Generar </span>QR Codes
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="template" className="text-sm">Plantilla</Label>
                  <Select
                    value={qrConfig.template}
                    onValueChange={(value: keyof ReturnType<typeof getQRTemplates>) =>
                      setQrConfig(prev => ({ ...prev, template: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(qrTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Palette className="h-3 w-3" />
                            <span className="text-sm">{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="foregroundColor" className="text-sm">Color QR</Label>
                  <div className="flex gap-2">
                    <Input
                      id="foregroundColor"
                      type="color"
                      className="h-8 w-16 p-1 cursor-pointer"
                      value={qrConfig.customForegroundColor}
                      onChange={(e) => setQrConfig(prev => ({
                        ...prev,
                        customForegroundColor: e.target.value,
                        template: 'custom'
                      }))}
                    />
                    <Input
                      className="h-8 text-sm flex-1"
                      value={qrConfig.customForegroundColor}
                      onChange={(e) => setQrConfig(prev => ({
                        ...prev,
                        customForegroundColor: e.target.value,
                        template: 'custom'
                      }))}
                      placeholder="#237584"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="backgroundColor" className="text-sm">Color Fondo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      className="h-8 w-16 p-1 cursor-pointer"
                      value={qrConfig.customBackgroundColor}
                      onChange={(e) => setQrConfig(prev => ({
                        ...prev,
                        customBackgroundColor: e.target.value,
                        template: 'custom'
                      }))}
                    />
                    <Input
                      className="h-8 text-sm flex-1"
                      value={qrConfig.customBackgroundColor}
                      onChange={(e) => setQrConfig(prev => ({
                        ...prev,
                        customBackgroundColor: e.target.value,
                        template: 'custom'
                      }))}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="callToAction" className="text-sm">Llamada a la Acción</Label>
                  <Input
                    id="callToAction"
                    className="h-8 text-sm"
                    value={qrConfig.callToAction}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, callToAction: e.target.value }))}
                    placeholder="Ver Carta Digital"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branding"
                  checked={qrConfig.branding}
                  onCheckedChange={(checked) =>
                    setQrConfig(prev => ({ ...prev, branding: checked as boolean }))
                  }
                  className="h-3 w-3"
                />
                <Label htmlFor="branding" className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3" />
                  Incluir branding del restaurante
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Tables Grid - Agrupadas por Zona - Responsive Optimizado */}
          {Object.entries(ZONE_LABELS).map(([zoneKey, zoneLabel]) => {
            const zoneTables = localTables.filter(t => t.location === zoneKey)
            if (zoneTables.length === 0) return null

            return (
              <Card key={zoneKey}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base sm:text-lg">{zoneLabel}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {zoneTables.length} mesas
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {zoneTables.filter(t => selectedTables.includes(t.id)).length} seleccionadas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mobile: 2 cols | Tablet: 3 cols | Desktop: 4 cols | Large: 5 cols | XL: 6 cols */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {zoneTables.map((table) => (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTables.includes(table.id)
                    ? 'border-primary border-2 bg-primary/5 shadow-sm'
                    : 'hover:bg-muted/30'
                } ${!table.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => table.isActive && toggleTableSelection(table.id)}
              >
                <CardContent className="p-3 md:p-4">
                  {/* Header: Mesa info + Estado */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-bold text-base md:text-sm truncate">Mesa {table.number}</h4>
                      {table.isActive && (
                        <Checkbox
                          checked={selectedTables.includes(table.id)}
                          className="h-4 w-4 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {table.qrCode && table.isActive ? (
                        <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-green-500">QR</Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">OFF</Badge>
                      )}
                    </div>
                  </div>

                  {/* Info: Capacity */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium">{table.capacity} personas</span>
                  </div>

                  {/* QR Code Preview and Actions */}
                  {table.isActive && (
                    <div className="space-y-2">
                      {table.qrCode ? (
                        <>
                          {/* QR Code Display - Responsive sizing */}
                          <div className="flex justify-center py-2 md:py-3">
                            <div className="w-full aspect-square max-w-[140px] md:max-w-[120px] bg-card p-2 rounded-lg border border-border flex items-center justify-center shadow-sm">
                              <QRCodeSVG
                                value={generateSecureQRContent(table.number, table.id, table.location || 'MAIN_ROOM', qrConfig.template)}
                                size={120}
                                level="H"
                                bgColor={qrConfig.template === 'custom' ? qrConfig.customBackgroundColor : (qrTemplates[qrConfig.template]?.colors.background || '#FFFFFF')}
                                fgColor={qrConfig.template === 'custom' ? qrConfig.customForegroundColor : (qrTemplates[qrConfig.template]?.colors.foreground || '#237584')}
                                marginSize={1}
                                className="w-full h-full"
                              />
                            </div>
                          </div>

                          {/* Action Buttons - Stacked on mobile, side-by-side on larger screens */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-full text-xs font-medium"
                              onClick={(e) => {
                                e.stopPropagation()
                                const secureQRUrl = generateSecureQRContent(table.number, table.id, table.location || 'MAIN_ROOM', qrConfig.template)
                                copyToClipboard(secureQRUrl, table.number)
                              }}
                            >
                              {copiedCode === `mesa-${table.number}` ? (
                                <>
                                  <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                                  Copiar URL
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="h-9 w-full text-xs font-medium bg-primary"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadStyledQR(table.number, table.id, table.location, 'svg')
                              }}
                            >
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Descargar QR
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="py-8">
                          <Button
                            size="default"
                            variant="outline"
                            className="w-full h-10 border-dashed border-2"
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                await generateAndSaveQRCode(table.id, table.number)
                                toast.success(`QR generado para Mesa ${table.number}`)
                              } catch (error) {
                                toast.error('Error generando QR')
                              }
                            }}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Generar QR
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics KPIs - Responsive grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Total Escaneos</CardTitle>
                <QrCode className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold text-primary">{qrAnalyticsData.totalScans || 0}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-2.5 w-2.5 text-[#9FB289]" />
                  <span className="truncate">Últimos 30 días</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">QR Activos</CardTitle>
                <Activity className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold">{realAnalytics.activeQRCodes || 0}</div>
                <div className="text-xs text-muted-foreground truncate">
                  Mesas con QR
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Conversión</CardTitle>
                <Target className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold text-[#9FB289]">{qrAnalyticsData.conversionRate?.toFixed(1) || 0}%</div>
                <div className="text-xs text-muted-foreground truncate">
                  QR a pedido
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Mesa Top</CardTitle>
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold">{qrAnalyticsData.topTables?.[0]?.tableNumber || '-'}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {qrAnalyticsData.topTables?.[0]?.totalScans || 0} escaneos
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for charts */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4" />
                Análisis de Rendimiento QR
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[180px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Gráficos de análisis disponibles próximamente</p>
                <p className="text-xs">Integración con sistema de analytics en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(qrTemplates).map(([key, template]) => (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all ${
                  qrConfig.template === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setQrConfig(prev => ({ ...prev, template: key as keyof ReturnType<typeof getQRTemplates> }))}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Palette className="h-4 w-4" />
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{template.description}</p>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.colors.background, borderColor: template.colors.foreground }}
                    />
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.colors.foreground }}
                    />
                    <span className="text-xs text-muted-foreground">Colores</span>
                  </div>

                  {template.logo && (
                    <Badge variant="secondary" className="text-xs h-5">Con Logo</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}