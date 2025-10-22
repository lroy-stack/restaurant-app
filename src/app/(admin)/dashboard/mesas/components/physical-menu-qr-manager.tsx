'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useRestaurant } from '@/hooks/use-restaurant'
import { toast } from 'sonner'
import { Plus, Download, QrCode, MapPin, Menu as MenuIcon, Check, Copy, Power, PowerOff, TrendingUp } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { QRExportService, QR_TEMPLATES } from '@/lib/services/QRExportService'

interface PhysicalMenu {
  id: string
  code: string
  type: 'CARTA_FISICA' | 'CARTELERIA'
  location?: string
  description?: string
  qr_code: string
  qr_url: string
  is_active: boolean
  total_scans: number
  last_scanned_at?: string
  created_at: string
}

export function PhysicalMenuQRManager() {
  const { restaurant } = useRestaurant()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [existingMenus, setExistingMenus] = useState<PhysicalMenu[]>([])
  const [batchRange, setBatchRange] = useState({ from: 1, to: 40 })
  const [menuType, setMenuType] = useState<'CARTA_FISICA' | 'CARTELERIA'>('CARTA_FISICA')
  const [activeTab, setActiveTab] = useState<'CARTA_FISICA' | 'CARTELERIA'>('CARTA_FISICA')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [customForegroundColor, setCustomForegroundColor] = useState(restaurant?.qr_primary_color || '#237584')
  const [customBackgroundColor, setCustomBackgroundColor] = useState(restaurant?.qr_background_color || '#FFFFFF')
  const [useCustomColors, setUseCustomColors] = useState(false)

  // Dynamic template based on restaurant config
  const getDynamicTemplate = () => ({
    id: 'custom',
    name: useCustomColors ? 'Personalizado' : 'Color Principal',
    dotsColor: useCustomColors ? customForegroundColor : (restaurant?.qr_primary_color || '#237584'),
    backgroundColor: useCustomColors ? customBackgroundColor : (restaurant?.qr_background_color || '#FFFFFF'),
    cornerSquareColor: useCustomColors ? customForegroundColor : (restaurant?.qr_primary_color || '#237584'),
    cornerDotColor: useCustomColors ? customForegroundColor : (restaurant?.qr_primary_color || '#237584')
  })

  const selectedTemplate = getDynamicTemplate()

  const BASE_URL = process.env.NEXT_PUBLIC_QR_MENU_URL || 'https://menu.enigmaconalma.com'

  // Load existing menus
  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/physical-menus')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`)
      }

      const { data } = await response.json()
      setExistingMenus(data || [])
    } catch (error) {
      console.error('Load menus error:', error)
      toast.error(`Error: ${error instanceof Error ? error.message : 'Error al cargar códigos QR'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Stats
  const cartaFisicaMenus = existingMenus.filter(m => m.type === 'CARTA_FISICA')
  const carteleriaMenus = existingMenus.filter(m => m.type === 'CARTELERIA')
  const totalScans = existingMenus.reduce((sum, m) => sum + m.total_scans, 0)
  const activeCount = existingMenus.filter(m => m.is_active).length

  // Batch Generate
  const handleBatchGenerate = async () => {
    setIsGenerating(true)

    try {
      const count = batchRange.to - batchRange.from + 1
      const menus: Omit<PhysicalMenu, 'id' | 'created_at'>[] = []

      for (let i = batchRange.from; i <= batchRange.to; i++) {
        const code = String(i).padStart(2, '0')
        const urlParam = menuType === 'CARTA_FISICA' ? 'carta' : 'exterior'
        const qrUrl = `${BASE_URL}?${urlParam}=${code}`

        menus.push({
          code,
          type: menuType,
          location: menuType === 'CARTA_FISICA' ? `Carta Física ${code}` : `Exterior ${code}`,
          description: menuType === 'CARTA_FISICA'
            ? `Menú digital para carta física número ${code}`
            : `Cartelería exterior ${code}`,
          qr_code: `physical_menu_${code}`,
          qr_url: qrUrl,
          is_active: true,
          total_scans: 0
        })
      }

      const response = await fetch('/api/physical-menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menus })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Error al guardar')
      }

      toast.success(`✅ ${count} códigos QR generados`, {
        description: `Tipo: ${menuType === 'CARTA_FISICA' ? 'Cartas Físicas' : 'Cartelería Exterior'}`
      })

      // Reload
      await loadMenus()

    } catch (error) {
      console.error('Batch generation error:', error)
      toast.error(`Error: ${error instanceof Error ? error.message : 'Error al generar'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Export PDF Grid 3x4 (12 QRs per page - optimized for DIN A4)
  const handleExportPDF = async (type: 'CARTA_FISICA' | 'CARTELERIA') => {
    const menusToExport = existingMenus.filter(m => m.type === type)

    if (menusToExport.length === 0) {
      toast.error('No hay códigos QR para exportar')
      return
    }

    try {
      toast.info('Generando PDF...', { description: 'Esto puede tomar unos segundos' })

      const doc = new jsPDF()
      const COLS = 5
      const ROWS = 5
      const QR_SIZE = 35
      const PAGE_WIDTH = 210
      const PAGE_HEIGHT = 297
      const SPACING_X = 5
      const SPACING_Y = 6
      const MARGIN_X = (PAGE_WIDTH - (COLS * QR_SIZE) - ((COLS - 1) * SPACING_X)) / 2
      const MARGIN_Y = 25
      const ITEMS_PER_PAGE = COLS * ROWS

      for (let pageIndex = 0; pageIndex < Math.ceil(menusToExport.length / ITEMS_PER_PAGE); pageIndex++) {
        if (pageIndex > 0) doc.addPage()

        const pageMenus = menusToExport.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)

        // Header
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(
          type === 'CARTA_FISICA' ? `Cartas Físicas - ${restaurant?.name || 'Restaurante'}` : `Cartelería Exterior - ${restaurant?.name || 'Restaurante'}`,
          PAGE_WIDTH / 2,
          15,
          { align: 'center' }
        )

        // Template info
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Color: ${selectedTemplate.dotsColor}`,
          PAGE_WIDTH / 2,
          20,
          { align: 'center' }
        )

        for (let i = 0; i < pageMenus.length; i++) {
          const menu = pageMenus[i]
          const row = Math.floor(i / COLS)
          const col = i % COLS
          const x = MARGIN_X + col * (QR_SIZE + SPACING_X)
          const y = MARGIN_Y + row * (QR_SIZE + SPACING_Y + 10)

          const qrDataURL = await QRExportService.generateQRDataURL(
            menu.qr_url,
            selectedTemplate,
            400
          )

          doc.addImage(qrDataURL, 'PNG', x, y, QR_SIZE, QR_SIZE)

          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.text(
            `${type === 'CARTA_FISICA' ? 'Carta' : 'Exterior'} #${menu.code}`,
            x + QR_SIZE / 2,
            y + QR_SIZE + 3,
            { align: 'center' }
          )

          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          doc.text(
            menu.qr_url.length > 30 ? menu.qr_url.substring(0, 30) + '...' : menu.qr_url,
            x + QR_SIZE / 2,
            y + QR_SIZE + 6,
            { align: 'center' }
          )
        }

        // Footer
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Página ${pageIndex + 1} de ${Math.ceil(menusToExport.length / ITEMS_PER_PAGE)} | Generado: ${new Date().toLocaleDateString('es-ES')}`,
          PAGE_WIDTH / 2,
          PAGE_HEIGHT - 10,
          { align: 'center' }
        )
      }

      const restaurantPrefix = restaurant?.name?.split(' ')[0]?.toLowerCase() || 'restaurante'
      const filename = `${restaurantPrefix}-${type === 'CARTA_FISICA' ? 'cartas-fisicas' : 'carteleria'}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)

      toast.success(`✅ PDF exportado: ${menusToExport.length} códigos QR`)

    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Error al exportar PDF')
    }
  }

  // Copy URL
  const handleCopyURL = async (url: string, code: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedCode(code)
      toast.success('URL copiada')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Error al copiar')
    }
  }

  // Download single QR
  const handleDownloadQR = async (menu: PhysicalMenu) => {
    try {
      const qrDataURL = await QRExportService.generateQRDataURL(
        menu.qr_url,
        selectedTemplate,
        600
      )

      const restaurantPrefix = restaurant?.name?.split(' ')[0]?.toLowerCase() || 'restaurante'
      const link = document.createElement('a')
      link.download = `${restaurantPrefix}-${menu.type === 'CARTA_FISICA' ? 'carta' : 'exterior'}-${menu.code}-${selectedTemplate.id}.png`
      link.href = qrDataURL
      link.click()

      toast.success(`QR descargado: ${selectedTemplate.name}`)
    } catch (error) {
      toast.error('Error al descargar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Header - MOBILE FIRST */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Generados</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none">{existingMenus.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
              {cartaFisicaMenus.length} cartas + {carteleriaMenus.length} exterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Scans</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold flex items-center gap-1.5 leading-none">
              {totalScans}
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Todos los QRs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Activos</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600 leading-none">{activeCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">de {existingMenus.length} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">URL Base</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-[10px] sm:text-xs font-mono truncate">{BASE_URL}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">Patrón: ?carta=XX</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generación Batch
          </CardTitle>
          <CardDescription>Genera múltiples códigos QR de forma automática</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Código QR</Label>
              <Select
                value={menuType}
                onValueChange={(value) => setMenuType(value as 'CARTA_FISICA' | 'CARTELERIA')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARTA_FISICA">
                    <div className="flex items-center gap-2">
                      <MenuIcon className="h-4 w-4" />
                      Cartas Físicas (01-40)
                    </div>
                  </SelectItem>
                  <SelectItem value="CARTELERIA">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Cartelería Exterior
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Configuración QR</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="useCustomColors"
                    checked={useCustomColors}
                    onCheckedChange={(checked) => setUseCustomColors(checked as boolean)}
                  />
                  <Label htmlFor="useCustomColors" className="text-sm cursor-pointer">
                    Personalizar colores
                  </Label>
                </div>
              </div>

              {useCustomColors && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="foregroundColor" className="text-sm">Color QR</Label>
                    <div className="flex gap-2">
                      <Input
                        id="foregroundColor"
                        type="color"
                        className="h-9 w-16 p-1 cursor-pointer"
                        value={customForegroundColor}
                        onChange={(e) => setCustomForegroundColor(e.target.value)}
                      />
                      <Input
                        className="h-9 text-sm flex-1"
                        value={customForegroundColor}
                        onChange={(e) => setCustomForegroundColor(e.target.value)}
                        placeholder="#237584"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor" className="text-sm">Color Fondo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        className="h-9 w-16 p-1 cursor-pointer"
                        value={customBackgroundColor}
                        onChange={(e) => setCustomBackgroundColor(e.target.value)}
                      />
                      <Input
                        className="h-9 text-sm flex-1"
                        value={customBackgroundColor}
                        onChange={(e) => setCustomBackgroundColor(e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!useCustomColors && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: restaurant?.qr_primary_color || '#237584' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Color Principal</p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant?.qr_primary_color || '#237584'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input
                  type="number"
                  min={1}
                  value={batchRange.from}
                  onChange={(e) => setBatchRange({ ...batchRange, from: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input
                  type="number"
                  min={batchRange.from}
                  value={batchRange.to}
                  onChange={(e) => setBatchRange({ ...batchRange, to: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              Se generarán <strong>{batchRange.to - batchRange.from + 1}</strong> códigos QR del tipo{' '}
              <strong>{menuType === 'CARTA_FISICA' ? 'Cartas Físicas' : 'Cartelería Exterior'}</strong>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              URL: {BASE_URL}?{menuType === 'CARTA_FISICA' ? 'carta' : 'exterior'}=01
            </p>
          </div>

          <Button
            onClick={handleBatchGenerate}
            disabled={isGenerating || batchRange.from > batchRange.to}
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generando...' : `Generar ${batchRange.to - batchRange.from + 1} Códigos QR`}
          </Button>
        </CardContent>
      </Card>

      {/* QR List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="text-base sm:text-lg">Códigos QR Generados</CardTitle>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'CARTA_FISICA' | 'CARTELERIA')}>
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="CARTA_FISICA" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Cartas</span>
                  <span className="sm:hidden">Cartas</span> ({cartaFisicaMenus.length})
                </TabsTrigger>
                <TabsTrigger value="CARTELERIA" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Exterior</span>
                  <span className="sm:hidden">Ext.</span> ({carteleriaMenus.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsContent value="CARTA_FISICA" className="space-y-4">
              {cartaFisicaMenus.length > 0 && (
                <Button onClick={() => handleExportPDF('CARTA_FISICA')} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF (Grid 2x3) - {cartaFisicaMenus.length} cartas
                </Button>
              )}

              {/* MOBILE FIRST: 1 col móvil, 2 tablet, 3 desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {cartaFisicaMenus.map((menu) => (
                  <Card key={menu.id} className={!menu.is_active ? 'opacity-50' : 'hover:bg-muted/50 transition-colors'}>
                    <CardContent className="p-4 sm:p-3 space-y-3 sm:space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base sm:text-sm truncate">Carta #{menu.code}</h4>
                          <p className="text-sm sm:text-xs text-muted-foreground mt-0.5">
                            {menu.total_scans} scans
                          </p>
                        </div>
                        <Badge
                          variant={menu.is_active ? 'default' : 'secondary'}
                          className="ml-2 flex-shrink-0 h-6 sm:h-5 px-2 sm:px-1.5"
                        >
                          {menu.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                        </Badge>
                      </div>

                      {/* Action Buttons - MOBILE FIRST: Touch targets 44px */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyURL(menu.qr_url, menu.code)}
                          className="h-10 sm:h-9 w-full"
                        >
                          {copiedCode === menu.code ? (
                            <>
                              <Check className="h-4 w-4 mr-1.5 text-green-600" />
                              <span className="hidden sm:inline">Copiado</span>
                              <span className="sm:hidden">✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1.5" />
                              <span className="hidden sm:inline">Copiar</span>
                              <span className="sm:hidden">Copiar</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadQR(menu)}
                          className="h-10 sm:h-9 w-full"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          <span className="hidden sm:inline">Descargar</span>
                          <span className="sm:hidden">Bajar</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {cartaFisicaMenus.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MenuIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay cartas físicas generadas</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="CARTELERIA" className="space-y-4">
              {carteleriaMenus.length > 0 && (
                <Button onClick={() => handleExportPDF('CARTELERIA')} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF (Grid 2x3) - {carteleriaMenus.length} carteles
                </Button>
              )}

              {/* MOBILE FIRST: 1 col móvil, 2 tablet, 3 desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {carteleriaMenus.map((menu) => (
                  <Card key={menu.id} className={!menu.is_active ? 'opacity-50' : 'hover:bg-muted/50 transition-colors'}>
                    <CardContent className="p-4 sm:p-3 space-y-3 sm:space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base sm:text-sm truncate">Exterior #{menu.code}</h4>
                          <p className="text-sm sm:text-xs text-muted-foreground mt-0.5">
                            {menu.total_scans} scans
                          </p>
                        </div>
                        <Badge
                          variant={menu.is_active ? 'default' : 'secondary'}
                          className="ml-2 flex-shrink-0 h-6 sm:h-5 px-2 sm:px-1.5"
                        >
                          {menu.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                        </Badge>
                      </div>

                      {/* Action Buttons - MOBILE FIRST: Touch targets 44px */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyURL(menu.qr_url, menu.code)}
                          className="h-10 sm:h-9 w-full"
                        >
                          {copiedCode === menu.code ? (
                            <>
                              <Check className="h-4 w-4 mr-1.5 text-green-600" />
                              <span className="hidden sm:inline">Copiado</span>
                              <span className="sm:hidden">✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1.5" />
                              <span className="hidden sm:inline">Copiar</span>
                              <span className="sm:hidden">Copiar</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadQR(menu)}
                          className="h-10 sm:h-9 w-full"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          <span className="hidden sm:inline">Descargar</span>
                          <span className="sm:hidden">Bajar</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {carteleriaMenus.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay cartelería exterior generada</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
