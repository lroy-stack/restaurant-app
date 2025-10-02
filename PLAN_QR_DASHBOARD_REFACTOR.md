# PLAN REFACTORIZACIÓN QR DASHBOARD - ENIGMA
> **Objetivo**: Modularizar `/dashboard/mesas?tab=qrcodes` y corregir exportación PDF

## 🚨 FASE 1: FIX CRÍTICO - PDF EXPORT (PRIORIDAD MÁXIMA)

### Problema Actual
- **Bug**: `enhanced-qr-manager.tsx:625-627` muestra placeholder en vez de QR real
- **Impacto**: PDFs descargados no contienen códigos QR escaneables
- **Root Cause**: QRCodeStyling no integrado con jsPDF

### Solución
**Crear**: `/src/lib/services/QRExportService.ts`

```typescript
import QRCodeStyling from 'qr-code-styling'

export class QRExportService {
  static async generateQRDataURL(
    content: string,
    template: QRTemplate
  ): Promise<string> {
    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: content,
      dotsOptions: { color: template.dotsColor, type: template.dotsStyle },
      backgroundOptions: { color: template.backgroundColor },
      cornersSquareOptions: { color: template.cornerSquareColor }
    })

    // Render to canvas
    const canvas = document.createElement('canvas')
    await qrCode.append(canvas)

    // Convert to base64
    return canvas.toDataURL('image/png')
  }
}
```

**Modificar**: `enhanced-qr-manager.tsx:625-627`

```typescript
// ❌ ANTES
doc.rect(20, currentY + 40, 50, 50)
doc.text('QR CODE', 35, currentY + 70)

// ✅ DESPUÉS
const qrDataURL = await QRExportService.generateQRDataURL(qrContent, template)
doc.addImage(qrDataURL, 'PNG', 20, currentY + 40, 50, 50)
```

**Testing**:
- Exportar PDF con 3 mesas
- Verificar QR escaneable con móvil
- Validar redirección correcta

---

## 📋 FASE 2: REFACTORIZACIÓN MODULAR

### 2.1 Estructura de Componentes

**Directorio**: `/src/app/(admin)/dashboard/mesas/components/qr-manager/`

```
qr-manager/
├── index.tsx                    # Orquestador principal
├── QRManagementPanel.tsx        # Gestión y generación
├── QRAnalyticsPanel.tsx         # Métricas y estadísticas
├── QRTemplatesPanel.tsx         # Plantillas de diseño
├── PhysicalMenuQRSection.tsx    # Cartas físicas batch
└── types.ts                     # Shared types
```

### 2.2 QRManagementPanel.tsx
**Responsabilidad**: Generación individual, batch, exportación

```typescript
export function QRManagementPanel({ tables }: { tables: Table[] }) {
  return (
    <div className="space-y-6">
      {/* Table QR Generation */}
      <TableQRGenerator tables={tables} />

      {/* Physical Menu QR Section */}
      <PhysicalMenuQRSection />

      {/* Batch Operations */}
      <BatchQRActions
        onExportPDF={handleExportPDF}
        onGenerateAll={handleGenerateAll}
      />
    </div>
  )
}
```

### 2.3 QRAnalyticsPanel.tsx
**Responsabilidad**: Dashboard de métricas

```typescript
export function QRAnalyticsPanel() {
  const { data: analytics } = useQRAnalytics()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AnalyticsCard
        title="Total Scans"
        value={analytics.totalScans}
        trend={analytics.scanTrend}
      />
      <TopPerformingTables tables={analytics.topTables} />
      <ScanTimeline data={analytics.timeline} />
    </div>
  )
}
```

**Backend**: `/src/app/api/qr-analytics/route.ts`
```typescript
export async function GET() {
  const { data: scans } = await supabase
    .from('qr_scans')
    .select('table_id, created_at, scan_type')
    .gte('created_at', subDays(new Date(), 30))

  return NextResponse.json({
    totalScans: scans.length,
    topTables: calculateTopPerformers(scans),
    timeline: aggregateByDay(scans)
  })
}
```

### 2.4 QRTemplatesPanel.tsx
**Responsabilidad**: Gestión de estilos visuales

```typescript
const TEMPLATES: QRTemplate[] = [
  {
    id: 'enigma-primary',
    name: 'Enigma Principal',
    dotsColor: 'oklch(0.45 0.15 200)',
    cornerSquareColor: 'oklch(0.15 0.02 220)'
  },
  {
    id: 'high-contrast',
    name: 'Alto Contraste',
    dotsColor: '#000000',
    cornerSquareColor: '#000000'
  }
]

export function QRTemplatesPanel() {
  const [selected, setSelected] = useState('enigma-primary')

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {TEMPLATES.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          selected={selected === template.id}
          onSelect={setSelected}
        />
      ))}
    </div>
  )
}
```

---

## 🎯 FASE 3: INTEGRACIÓN PHYSICAL MENUS

### PhysicalMenuQRSection.tsx

```typescript
export function PhysicalMenuQRSection() {
  const [range, setRange] = useState({ from: 1, to: 40 })

  const handleBatchGenerate = async () => {
    const menus = Array.from(
      { length: range.to - range.from + 1 },
      (_, i) => ({
        code: String(i + range.from).padStart(2, '0'),
        type: 'CARTA_FISICA',
        qr_url: `${BASE_URL}?carta=${String(i + range.from).padStart(2, '0')}`
      })
    )

    await supabase.from('physical_menus').insert(menus)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cartas Físicas - Generación Batch</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            type="number"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: +e.target.value })}
            placeholder="Desde"
          />
          <Input
            type="number"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: +e.target.value })}
            placeholder="Hasta"
          />
        </div>
        <Button onClick={handleBatchGenerate}>
          Generar {range.to - range.from + 1} Códigos QR
        </Button>
      </CardContent>
    </Card>
  )
}
```

### PDF Export Layout (2x3 Grid)

```typescript
const exportPhysicalMenusPDF = async (menus: PhysicalMenu[]) => {
  const doc = new jsPDF()
  const COLS = 2
  const ROWS = 3
  const QR_SIZE = 80

  for (let page = 0; page < Math.ceil(menus.length / 6); page++) {
    if (page > 0) doc.addPage()

    const pageMenus = menus.slice(page * 6, (page + 1) * 6)

    for (let i = 0; i < pageMenus.length; i++) {
      const row = Math.floor(i / COLS)
      const col = i % COLS
      const x = 20 + col * 100
      const y = 20 + row * 90

      const qrDataURL = await QRExportService.generateQRDataURL(
        pageMenus[i].qr_url,
        TEMPLATES.find(t => t.id === 'enigma-primary')
      )

      doc.addImage(qrDataURL, 'PNG', x, y, QR_SIZE, QR_SIZE)
      doc.text(`Carta #${pageMenus[i].code}`, x + QR_SIZE/2, y + QR_SIZE + 10, { align: 'center' })
    }
  }

  doc.save('enigma-physical-menus.pdf')
}
```

---

## 🧪 FASE 4: TESTING & VALIDATION

### Test Cases

**PDF Export**:
- [ ] Generar PDF con 1 mesa → QR visible y escaneable
- [ ] Generar PDF con 5 mesas → Todos QR válidos
- [ ] Exportar cartas físicas 01-40 → Grid 2x3 correcto

**Analytics**:
- [ ] Dashboard muestra total_scans correctos
- [ ] Top tables ordenadas por scans
- [ ] Timeline agrupa por día correctamente

**Physical Menus**:
- [ ] Batch generation crea 40 registros
- [ ] URLs siguen patrón `?carta=01` a `?carta=40`
- [ ] Escaneo incrementa total_scans

### Quality Gates
```bash
npm run lint
npm run type-check
npm run build
```

---

## 📊 RESUMEN ARQUITECTURA

### Antes (Monolítico)
```
enhanced-qr-manager.tsx (1000+ líneas)
├── UI Rendering
├── PDF Export (broken)
├── QR Generation
├── State Management
└── Analytics Logic
```

### Después (Modular)
```
qr-manager/
├── index.tsx (Orquestador - 100 líneas)
├── QRManagementPanel.tsx (Gestión - 200 líneas)
├── QRAnalyticsPanel.tsx (Métricas - 150 líneas)
├── QRTemplatesPanel.tsx (Plantillas - 100 líneas)
└── PhysicalMenuQRSection.tsx (Batch - 150 líneas)
```

### Benefits
- ✅ Single Responsibility Principle
- ✅ PDF Export fixed con QR reales
- ✅ Analytics independiente y reutilizable
- ✅ Physical menus integrado
- ✅ Testing más fácil (componentes pequeños)

---

## 🚀 DEPLOYMENT STRATEGY

1. **FASE 1**: Fix crítico PDF → Deploy inmediato
2. **FASE 2**: Refactorización → Feature branch → Testing → Merge
3. **FASE 3**: Physical menus → Deploy con batch generation
4. **FASE 4**: Monitoring post-deploy

**Zero Downtime**: Rolling update vía Docker Compose

---

**ESTADO**: Plan exportado - Iniciando FASE 1
