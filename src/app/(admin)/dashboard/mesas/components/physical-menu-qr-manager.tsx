'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [existingMenus, setExistingMenus] = useState<PhysicalMenu[]>([])
  const [batchRange, setBatchRange] = useState({ from: 1, to: 40 })
  const [menuType, setMenuType] = useState<'CARTA_FISICA' | 'CARTELERIA'>('CARTA_FISICA')
  const [activeTab, setActiveTab] = useState<'CARTA_FISICA' | 'CARTELERIA'>('CARTA_FISICA')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const BASE_URL = process.env.NEXT_PUBLIC_QR_MENU_URL || 'https://menu.enigmaconalma.com'

  // Load existing menus
  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/physical-menus')
      if (!response.ok) throw new Error('Failed to load menus')

      const { data } = await response.json()
      setExistingMenus(data || [])
    } catch (error) {
      console.error('Load menus error:', error)
      toast.error('Error al cargar códigos QR existentes')
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

  // Export PDF Grid 2x3
  const handleExportPDF = async (type: 'CARTA_FISICA' | 'CARTELERIA') => {
    const menusToExport = existingMenus.filter(m => m.type === type)

    if (menusToExport.length === 0) {
      toast.error('No hay códigos QR para exportar')
      return
    }

    try {
      toast.info('Generando PDF...', { description: 'Esto puede tomar unos segundos' })

      const doc = new jsPDF()
      const COLS = 2
      const ROWS = 3
      const QR_SIZE = 70
      const PAGE_WIDTH = 210
      const PAGE_HEIGHT = 297
      const MARGIN_X = (PAGE_WIDTH - (COLS * QR_SIZE) - 10) / 2
      const MARGIN_Y = 20

      for (let pageIndex = 0; pageIndex < Math.ceil(menusToExport.length / 6); pageIndex++) {
        if (pageIndex > 0) doc.addPage()

        const pageMenus = menusToExport.slice(pageIndex * 6, (pageIndex + 1) * 6)

        doc.setFontSize(16)
        doc.text(
          type === 'CARTA_FISICA' ? 'Cartas Físicas - Enigma' : 'Cartelería Exterior - Enigma',
          PAGE_WIDTH / 2,
          15,
          { align: 'center' }
        )

        for (let i = 0; i < pageMenus.length; i++) {
          const menu = pageMenus[i]
          const row = Math.floor(i / COLS)
          const col = i % COLS
          const x = MARGIN_X + col * (QR_SIZE + 5)
          const y = MARGIN_Y + row * (QR_SIZE + 25)

          const qrDataURL = await QRExportService.generateQRDataURL(
            menu.qr_url,
            QR_TEMPLATES[0],
            300
          )

          doc.addImage(qrDataURL, 'PNG', x, y, QR_SIZE, QR_SIZE)

          doc.setFontSize(10)
          doc.text(
            `${type === 'CARTA_FISICA' ? 'Carta' : 'Exterior'} #${menu.code}`,
            x + QR_SIZE / 2,
            y + QR_SIZE + 5,
            { align: 'center' }
          )

          doc.setFontSize(7)
          doc.text(
            menu.qr_url.replace(BASE_URL, '...'),
            x + QR_SIZE / 2,
            y + QR_SIZE + 10,
            { align: 'center' }
          )
        }

        doc.setFontSize(8)
        doc.text(
          `Página ${pageIndex + 1} de ${Math.ceil(menusToExport.length / 6)}`,
          PAGE_WIDTH / 2,
          PAGE_HEIGHT - 10,
          { align: 'center' }
        )
      }

      const filename = `enigma-${type === 'CARTA_FISICA' ? 'cartas-fisicas' : 'carteleria'}-${new Date().toISOString().split('T')[0]}.pdf`
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
        QR_TEMPLATES[0],
        300
      )

      const link = document.createElement('a')
      link.download = `enigma-${menu.type === 'CARTA_FISICA' ? 'carta' : 'exterior'}-${menu.code}.png`
      link.href = qrDataURL
      link.click()

      toast.success('QR descargado')
    } catch (error) {
      toast.error('Error al descargar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{existingMenus.length}</div>
            <p className="text-xs text-muted-foreground">
              {cartaFisicaMenus.length} cartas + {carteleriaMenus.length} exterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {totalScans}
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Todos los QRs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">de {existingMenus.length} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">URL Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono">{BASE_URL}</div>
            <p className="text-xs text-muted-foreground">Patrón: ?carta=XX</p>
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
          <div className="flex items-center justify-between">
            <CardTitle>Códigos QR Generados</CardTitle>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'CARTA_FISICA' | 'CARTELERIA')}>
              <TabsList>
                <TabsTrigger value="CARTA_FISICA">
                  Cartas ({cartaFisicaMenus.length})
                </TabsTrigger>
                <TabsTrigger value="CARTELERIA">
                  Exterior ({carteleriaMenus.length})
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cartaFisicaMenus.map((menu) => (
                  <Card key={menu.id} className={!menu.is_active ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold">Carta #{menu.code}</p>
                          <p className="text-xs text-muted-foreground">{menu.total_scans} scans</p>
                        </div>
                        <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                          {menu.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                        </Badge>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyURL(menu.qr_url, menu.code)}
                          className="flex-1"
                        >
                          {copiedCode === menu.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadQR(menu)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3" />
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {carteleriaMenus.map((menu) => (
                  <Card key={menu.id} className={!menu.is_active ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold truncate">{menu.code}</p>
                          <p className="text-xs text-muted-foreground">{menu.total_scans} scans</p>
                        </div>
                        <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                          {menu.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                        </Badge>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyURL(menu.qr_url, menu.code)}
                          className="flex-1"
                        >
                          {copiedCode === menu.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadQR(menu)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3" />
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
