# INGENIERÍA DE CONTEXTO: FORMULARIO DE RESERVAS ADMIN

## CONTEXTO DEL PROBLEMA

**Sistema:** Dashboard administrativo para gestión de reservas de restaurante
**Componente:** `/dashboard/reservaciones/nueva` - Formulario de creación de reservas
**Stakeholder:** Staff del restaurante (administradores, managers, recepcionistas)
**Problema actual:** Formulario sobrecargado, lento (>5 minutos), con bugs de UI/UX y campos innecesarios para admin interno

## ANÁLISIS DE ESQUEMA DE DATOS

### Tabla `restaurante.reservations`:
```sql
-- Campos obligatorios:
customerName      TEXT NOT NULL
customerEmail     TEXT NOT NULL
customerPhone     TEXT NOT NULL
partySize         INTEGER NOT NULL
date              TIMESTAMP NOT NULL
time              TIMESTAMP NOT NULL
status            ReservationStatus NOT NULL
restaurantId      TEXT NOT NULL

-- Campos opcionales:
tableId           TEXT NULL            -- Mesa puede ser NULL
customerId        TEXT NULL            -- FK opcional a customers
specialRequests   TEXT NULL            -- Notas
```

### Tabla `restaurante.customers`:
```sql
id                TEXT PRIMARY KEY
firstName         TEXT NOT NULL
lastName          TEXT NOT NULL
email             TEXT UNIQUE NOT NULL
phone             TEXT NULL
isVip             BOOLEAN DEFAULT false
```

### Tabla `restaurante.tables`:
```sql
id                TEXT PRIMARY KEY
number            TEXT NOT NULL UNIQUE
capacity          INTEGER NOT NULL
location          TableLocation NOT NULL
isActive          BOOLEAN DEFAULT true
```

## CASOS DE USO

### UC1: Nueva reserva desde cero
**URL:** `/dashboard/reservaciones/nueva`
**Actor:** Staff del restaurante
**Flujo:** Staff busca cliente por nombre → autocompletado sugiere matches → selecciona o crea nuevo → completa reserva

### UC2: Nueva reserva desde perfil de cliente
**URL:** `/dashboard/reservaciones/nueva?customerId=abc123`
**Actor:** Staff del restaurante
**Flujo:** Datos del cliente pre-cargados → staff solo completa fecha/hora/mesa

## ESPECIFICACIÓN TÉCNICA

### Arquitectura del componente:
```
ReservationForm (único componente)
├── Smart Customer Input (autocompletado)
├── Date Selector (calendario)
├── Time Selector (dropdown dinámico)
├── Party Size Input (número 1-20)
├── Table Selector (opcional, dropdown)
└── Special Requests (textarea opcional)
```

### Dependencias:
- `useRealtimeCustomers()` - Lista de clientes para autocompletado
- `useBusinessHours(date)` - Horarios disponibles por fecha
- `useTableAvailability(date, time, partySize)` - Mesas disponibles
- `useReservations.createReservation()` - Crear reserva

### Estados del formulario:
```typescript
interface FormState {
  // Customer data (required)
  customerName: string
  customerEmail: string
  customerPhone: string

  // Reservation data (required)
  date: string          // YYYY-MM-DD
  time: string          // HH:MM
  partySize: number     // 1-20

  // Optional data
  customerId?: string   // FK if customer selected
  tableId?: string      // Can be null
  specialRequests?: string
}
```

### Flujo de datos:
1. Usuario escribe nombre → `useRealtimeCustomers` filtra matches
2. Usuario selecciona fecha → `useBusinessHours` carga horarios disponibles
3. Usuario selecciona hora + personas → `useTableAvailability` carga mesas
4. Submit → `useReservations.createReservation` con payload completo

## IMPLEMENTACIÓN

### Componente único: `/src/components/forms/reservation/reservation-form.tsx`

```typescript
export function ReservationForm({
  preselectedCustomerId?: string,
  onSuccess: () => void,
  onCancel: () => void,
  className?: string
}) {
  // Estado local simple (useState, no React Hook Form)
  const [formData, setFormData] = useState<FormState>(initialState)

  // Hooks de datos
  const { customers } = useRealtimeCustomers()
  const { timeSlots } = useBusinessHours(formData.date)
  const { tables } = useTableAvailability(formData.date, formData.time, formData.partySize)
  const { createReservation, isLoading } = useReservations()

  // Lógica de autocompletado
  const customerMatches = useMemo(() =>
    customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [customers, searchTerm]
  )

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createReservation({
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      date: formData.date,
      time: formData.time,
      partySize: formData.partySize,
      tableId: formData.tableId || null,
      customerId: formData.customerId || null,
      specialRequests: formData.specialRequests || null,
      status: 'PENDING',
      restaurantId: 'default-restaurant-id'
    })
    onSuccess()
  }

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle>Nueva Reserva</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Input with Autocomplete */}
          <CustomerSearchInput
            value={formData.customerName}
            matches={customerMatches}
            onSelect={handleCustomerSelect}
            onChange={handleCustomerNameChange}
          />

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Email"
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({...prev, customerEmail: e.target.value}))}
              required
            />
            <Input
              placeholder="Teléfono"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({...prev, customerPhone: e.target.value}))}
              required
            />
          </div>

          {/* Date/Time/Party */}
          <div className="grid grid-cols-3 gap-4">
            <DatePicker
              value={formData.date}
              onChange={(date) => setFormData(prev => ({...prev, date}))}
              required
            />
            <Select
              value={formData.time}
              onValueChange={(time) => setFormData(prev => ({...prev, time}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hora" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(slot => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Personas"
              min="1"
              max="20"
              value={formData.partySize}
              onChange={(e) => setFormData(prev => ({...prev, partySize: parseInt(e.target.value)}))}
              required
            />
          </div>

          {/* Optional Table */}
          <Select
            value={formData.tableId || ''}
            onValueChange={(tableId) => setFormData(prev => ({...prev, tableId: tableId || null}))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mesa (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin mesa asignada</SelectItem>
              {tables.map(table => (
                <SelectItem key={table.id} value={table.id}>
                  Mesa {table.number} ({table.capacity} personas)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Optional Notes */}
          <Textarea
            placeholder="Notas especiales (opcional)"
            value={formData.specialRequests}
            onChange={(e) => setFormData(prev => ({...prev, specialRequests: e.target.value}))}
            rows={2}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

## PLAN DE MIGRACIÓN

### Fase 1: Backup
1. Renombrar formulario actual: `reservation-form.backup.tsx`
2. Eliminar componentes innecesarios:
   - `customer-selection.tsx`
   - `datetime-selection.tsx`
   - `table-selection.tsx`
   - `gdpr-consent.tsx`
   - `additional-info.tsx`

### Fase 2: Implementación
1. Crear formulario único según especificación
2. Implementar autocompletado de clientes
3. Integrar hooks existentes para datos dinámicos
4. Testing de flujos UC1 y UC2

### Fase 3: Validación
1. Test de velocidad: crear reserva en <5 segundos
2. Test de funcionalidad: ambos casos de uso
3. Test responsive: mobile/tablet/desktop
4. Fix de bugs de scroll identificados

## CRITERIOS DE ACEPTACIÓN

- [ ] Formulario se completa en máximo 5 segundos
- [ ] Autocompletado de clientes funciona en <300ms
- [ ] Soporte para ambos casos de uso (UC1, UC2)
- [ ] Mesa es opcional (no bloquea creación)
- [ ] Sin bugs de scroll en interfaz
- [ ] Responsive en todos los dispositivos
- [ ] Integración completa con APIs existentes