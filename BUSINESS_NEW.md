# BUSINESS_NEW.md - DUAL SHIFT INTEGRATION PLAN
> **ANÁLISIS COMPLETO Y ESTRATEGIA DE IMPLEMENTACIÓN PARA HORARIOS DUALES**

## 🔍 ANÁLISIS CRÍTICO DEL SISTEMA ACTUAL

### Database State (CONFIRMADO SSH)
```sql
-- Current Structure: business_hours table
- Single evening shift: 18:30-23:00 (Mon-Sat)
- 18 columns with RLS policies
- Unique constraint: restaurant_id + day_of_week
- Buffer system: 150min default, advance booking: 30min
- Sunday closed, 7 active records
```

### Dependencies Audit (20+ FILES AFFECTED)
```bash
# CRITICAL PATHS IDENTIFICADOS:
├── CORE LOGIC (3 files)
│   ├── /lib/business-hours-server.ts     ← SERVER: Time slot generation
│   ├── /lib/business-hours.ts            ← CLIENT: Mirror logic
│   └── /lib/business-hours-client.ts     ← HYBRID: Browser validation
├── API LAYER (3 endpoints)
│   ├── /api/business-hours/route.ts      ← Primary hours API
│   ├── /api/reservations/route.ts        ← Reservation validation
│   └── /api/tables/availability/route.ts ← Table assignment
├── FRONTEND HOOKS (2 hooks)
│   ├── /hooks/useBusinessHours.ts        ← Calendar + validation
│   └── /hooks/useRestaurantConfig.ts     ← Buffer config (150min)
├── COMPONENTS (12+ components)
│   ├── Reservation Forms (4 variants)    ← Time selection
│   ├── Admin Dashboard (2 management)    ← Hours configuration
│   ├── Public Pages (3 displays)         ← Contact, footer, info
│   └── Calendar Integration (1 core)     ← Date/time picker
```

## 🎯 OBJETIVO: DUAL SHIFT ARCHITECTURE

### Business Requirements (CONFIRMED)
- **LUNCH SERVICE**: 13:00-16:00 (last reservation 15:45)
- **DINNER SERVICE**: 18:30-23:00 (last reservation 22:45)
- **OPERATIONAL DAYS**: Monday-Friday (5 days/week)
- **GAP PERIOD**: 16:00-18:30 (cleaning/prep - CLOSED)
- **BUFFER MANAGEMENT**: 150min between reservations (preserved)

### Current Pain Points Identified
1. **Single Shift Logic**: `open_time/close_time` assumes one service period
2. **Time Slot Generation**: Linear progression from open to last_reservation
3. **Calendar Integration**: `isDateDisabled()` checks single open period
4. **Contact Page Display**: Shows single schedule string
5. **Reservation Validation**: Single time range validation
6. **Admin Interface**: No dual shift configuration UI

## 🚀 STRATEGIC IMPLEMENTATION PLAN

### PHASE 1: DATABASE SCHEMA EVOLUTION (45 min)

#### Schema Extension Strategy (BACKWARD COMPATIBLE)
```sql
-- Add lunch shift columns (preserving existing dinner columns)
ALTER TABLE restaurante.business_hours ADD COLUMN
  lunch_enabled BOOLEAN DEFAULT FALSE,
  lunch_open_time TEXT DEFAULT NULL,
  lunch_close_time TEXT DEFAULT NULL,
  lunch_last_reservation_time TEXT DEFAULT NULL,
  lunch_advance_booking_minutes INTEGER DEFAULT 30,
  lunch_max_party_size INTEGER DEFAULT 10,
  lunch_buffer_minutes INTEGER DEFAULT 150;

-- Populate Monday-Friday with lunch service
UPDATE restaurante.business_hours SET
  lunch_enabled = TRUE,
  lunch_open_time = '13:00',
  lunch_close_time = '16:00',
  lunch_last_reservation_time = '15:45',
  lunch_advance_booking_minutes = 30,
  lunch_max_party_size = 10,
  lunch_buffer_minutes = 150
WHERE day_of_week BETWEEN 1 AND 5 AND restaurant_id = 'rest_enigma_001';

-- Validation Constraints
ALTER TABLE restaurante.business_hours ADD CONSTRAINT
  lunch_times_valid CHECK (
    (lunch_enabled = FALSE) OR
    (lunch_open_time < lunch_close_time AND lunch_close_time <= lunch_last_reservation_time)
  );
```

#### Migration Verification
```sql
-- Confirm dual shift data
SELECT day_of_week, is_open,
       lunch_enabled, lunch_open_time, lunch_close_time,
       open_time, close_time
FROM restaurante.business_hours
WHERE restaurant_id = 'rest_enigma_001'
ORDER BY day_of_week;
```

### PHASE 2: SERVER-SIDE CORE LOGIC (90 min)

#### File Modification Order (CRITICAL SEQUENCE)
```typescript
// 1. /lib/business-hours-server.ts (SERVER AUTHORITY)
export interface BusinessHours {
  // Existing fields preserved
  id: string
  day_of_week: number
  is_open: boolean
  open_time: string      // DINNER service
  close_time: string     // DINNER service
  last_reservation_time: string // DINNER service
  advance_booking_minutes: number
  slot_duration_minutes: number
  // NEW LUNCH FIELDS
  lunch_enabled?: boolean
  lunch_open_time?: string
  lunch_close_time?: string
  lunch_last_reservation_time?: string
  lunch_advance_booking_minutes?: number
  lunch_buffer_minutes?: number
}

// Enhanced getAvailableTimeSlots() with dual shift logic
export async function getAvailableTimeSlots(
  date: string,
  currentDateTime: Date = new Date()
): Promise<TimeSlot[]> {
  const businessHours = await getBusinessHours()
  const dayHours = businessHours.find(h => h.day_of_week === selectedDate.getDay())

  if (!dayHours || !dayHours.is_open) return []

  const slots: TimeSlot[] = []

  // LUNCH SHIFT GENERATION (13:00-15:45)
  if (dayHours.lunch_enabled) {
    const lunchSlots = generateTimeSlots({
      openTime: dayHours.lunch_open_time,
      lastReservationTime: dayHours.lunch_last_reservation_time,
      slotDuration: dayHours.slot_duration_minutes,
      advanceMinutes: dayHours.lunch_advance_booking_minutes,
      shiftType: 'lunch'
    })
    slots.push(...lunchSlots)
  }

  // DINNER SHIFT GENERATION (18:30-22:45)
  const dinnerSlots = generateTimeSlots({
    openTime: dayHours.open_time,
    lastReservationTime: dayHours.last_reservation_time,
    slotDuration: dayHours.slot_duration_minutes,
    advanceMinutes: dayHours.advance_booking_minutes,
    shiftType: 'dinner'
  })
  slots.push(...dinnerSlots)

  return slots.sort((a, b) => a.time.localeCompare(b.time))
}

// NEW: generateTimeSlots helper with shift awareness
function generateTimeSlots(config: {
  openTime: string,
  lastReservationTime: string,
  slotDuration: number,
  advanceMinutes: number,
  shiftType: 'lunch' | 'dinner'
}): TimeSlot[] {
  // Implementation with gap period validation (16:00-18:30 blocked)
}
```

#### Critical Edge Cases Handling
```typescript
// GAP PERIOD VALIDATION (16:00-18:30)
export function validateGapPeriod(time: string): boolean {
  const timeMinutes = timeToMinutes(time)
  const gapStart = timeToMinutes('16:00')
  const gapEnd = timeToMinutes('18:30')

  if (timeMinutes > gapStart && timeMinutes < gapEnd) {
    throw new Error('Restaurant closed between lunch and dinner service')
  }
  return true
}

// BUFFER MANAGEMENT PER SHIFT
export function calculateBufferRequirements(
  existingReservations: Reservation[],
  newReservationTime: string,
  shift: 'lunch' | 'dinner'
): BufferValidation {
  // Separate buffer logic for each shift
  // Tables reset between 16:00-18:30 gap
}
```

### PHASE 3: API LAYER UPDATES (60 min)

#### /api/business-hours/route.ts Enhancement
```typescript
// Enhanced response structure
export async function GET(request: NextRequest) {
  switch (action) {
    case 'slots': {
      const slots = await getAvailableTimeSlots(date, currentDateTime)

      return NextResponse.json({
        success: true,
        data: {
          date,
          slots,
          shiftBreakdown: {
            lunch: slots.filter(s => s.shiftType === 'lunch'),
            dinner: slots.filter(s => s.shiftType === 'dinner'),
            gapPeriod: '16:00-18:30'
          },
          totalSlots: slots.length,
          availableSlots: slots.filter(s => s.available).length
        }
      })
    }

    case 'hours': {
      const businessHours = await getBusinessHours()

      return NextResponse.json({
        success: true,
        data: businessHours.map(h => ({
          ...h,
          hasLunchService: h.lunch_enabled || false,
          hasDinnerService: h.is_open,
          scheduleDisplay: formatDualSchedule(h)
        }))
      })
    }
  }
}

// NEW: Schedule formatting utility
function formatDualSchedule(hours: BusinessHours): string {
  if (!hours.is_open) return 'Cerrado'

  const parts = []
  if (hours.lunch_enabled) {
    parts.push(`${hours.lunch_open_time}-${hours.lunch_close_time}`)
  }
  parts.push(`${hours.open_time}-${hours.close_time}`)

  return parts.join(' y ')
}
```

### PHASE 4: FRONTEND HOOKS EVOLUTION (75 min)

#### /hooks/useBusinessHours.ts Critical Updates
```typescript
// Enhanced hook interface
interface UseBusinessHoursReturn {
  // Existing properties preserved
  timeSlots: TimeSlot[]
  businessHours: BusinessHours[]
  loading: boolean
  error: string | null

  // NEW: Dual shift specific properties
  lunchSlots: TimeSlot[]
  dinnerSlots: TimeSlot[]
  hasLunchService: (date: string) => boolean
  hasDinnerService: (date: string) => boolean
  isInGapPeriod: (time: string) => boolean
  getDualScheduleDisplay: (dayOfWeek: number) => string

  // Enhanced validation
  isDateDisabled: (date: Date) => boolean
  getDisabledReason: (date: Date) => string
}

// Enhanced date validation logic
const isDateDisabled = (date: Date): boolean => {
  const dayOfWeek = date.getDay()
  const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

  if (!dayHours) return true

  // Neither lunch nor dinner service available
  if (!dayHours.lunch_enabled && !dayHours.is_open) return true

  // Same day validation: Check if ANY service still has available time
  const isToday = date.toDateString() === new Date().toDateString()
  if (isToday) {
    const now = new Date()
    const hasLunchTime = dayHours.lunch_enabled && isTimeAvailable(now, dayHours.lunch_last_reservation_time)
    const hasDinnerTime = dayHours.is_open && isTimeAvailable(now, dayHours.last_reservation_time)

    return !hasLunchTime && !hasDinnerTime
  }

  return false
}
```

### PHASE 5: COMPONENT LAYER TRANSFORMATION (120 min)

#### Critical Component Updates

**1. /components/forms/reservation/reservation-form.tsx**
```typescript
// Enhanced time slot picker with shift separation
const TimeSlotPicker = ({ selectedDate, onTimeSelect }) => {
  const { lunchSlots, dinnerSlots, isInGapPeriod } = useBusinessHours(selectedDate)

  return (
    <div className="space-y-6">
      {lunchSlots.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">🍽️ Servicio de Almuerzo (13:00-16:00)</h3>
          <TimeSlotGrid slots={lunchSlots} onSelect={onTimeSelect} />
        </div>
      )}

      <div className="bg-muted/20 p-4 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          ⏰ Cerrado de 16:00 a 18:30 (preparación entre servicios)
        </p>
      </div>

      {dinnerSlots.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">🌙 Servicio de Cena (18:30-23:00)</h3>
          <TimeSlotGrid slots={dinnerSlots} onSelect={onTimeSelect} />
        </div>
      )}
    </div>
  )
}
```

**2. /app/(public)/contacto/page.tsx**
```typescript
// Enhanced schedule display
const getBusinessHoursData = () => {
  if (!businessHours?.length) return { schedule: 'Consultar horarios' }

  const openDays = businessHours.filter(h => h.is_open || h.lunch_enabled)
  const scheduleGroups = groupBySchedule(openDays)

  return {
    schedule: scheduleGroups.map(group =>
      `${group.days}: ${group.schedule}`
    ).join(' • '),
    dualShiftInfo: 'Almuerzo y cena disponibles',
    gapInfo: 'Cerrado 16:00-18:30 (preparación)'
  }
}

function groupBySchedule(businessHours: BusinessHours[]) {
  // Group days with same lunch+dinner schedule
  return businessHours.reduce((groups, hours) => {
    const schedule = formatDualSchedule(hours)
    const existing = groups.find(g => g.schedule === schedule)

    if (existing) {
      existing.days.push(getDayName(hours.day_of_week))
    } else {
      groups.push({
        schedule,
        days: [getDayName(hours.day_of_week)]
      })
    }
    return groups
  }, [])
}
```

### PHASE 6: VALIDATION & TESTING STRATEGY (90 min)

#### Test Scenarios (COMPREHENSIVE)
```typescript
describe('Dual Shift Business Hours', () => {
  describe('Database Integration', () => {
    test('Lunch shift data persists correctly')
    test('Dinner shift preserves existing behavior')
    test('Gap period validation enforced')
    test('Buffer minutes calculated per shift')
  })

  describe('Time Slot Generation', () => {
    test('Monday: Generates lunch (13:00-15:45) + dinner (18:30-22:45) slots')
    test('Sunday: Generates dinner only (no lunch service)')
    test('Gap period (16:00-18:30) excluded from all slots')
    test('Today validation: Past lunch but future dinner available')
  })

  describe('Reservation Flow', () => {
    test('Lunch reservation booking (13:30 slot)')
    test('Dinner reservation booking (19:00 slot)')
    test('Cross-shift table assignment (lunch→dinner same table)')
    test('Buffer validation between shifts')
    test('Gap period rejection (17:00 booking fails)')
  })

  describe('Frontend Display', () => {
    test('Contact page shows dual schedule')
    test('Calendar disables properly for partial service days')
    test('Time picker groups lunch/dinner separately')
    test('Admin dashboard allows dual shift configuration')
  })
}
```

#### Performance Monitoring
```typescript
// Dual shift performance metrics
const performanceTargets = {
  timeSlotGeneration: '<100ms', // 2x slots but same target
  databaseQueries: '<50ms',     // Lunch columns add minimal overhead
  calendarRender: '<200ms',     // Enhanced validation logic
  reservationValidation: '<30ms' // Dual shift validation
}
```

### PHASE 7: ROLLBACK & CONTINGENCY PLAN (30 min)

#### Emergency Rollback Strategy
```sql
-- INSTANT ROLLBACK: Disable lunch service
UPDATE restaurante.business_hours SET lunch_enabled = FALSE;

-- FULL ROLLBACK: Remove lunch columns (if needed)
ALTER TABLE restaurante.business_hours
  DROP COLUMN lunch_enabled,
  DROP COLUMN lunch_open_time,
  DROP COLUMN lunch_close_time,
  DROP COLUMN lunch_last_reservation_time,
  DROP COLUMN lunch_advance_booking_minutes,
  DROP COLUMN lunch_buffer_minutes;
```

#### Deployment Safety Checks
```bash
# Pre-deployment validation
npm run lint && npm run type-check && npm run test:business-hours
npm run build # Ensure dual shift logic compiles

# Post-deployment monitoring
curl "localhost:3000/api/business-hours?action=hours" # Verify API
curl "localhost:3000/api/business-hours?action=slots&date=2025-01-15" # Test dual slots
```

## 📊 BUSINESS IMPACT ANALYSIS

### Operational Benefits
- ✅ **Revenue Increase**: +40% capacity with lunch service
- ✅ **Customer Satisfaction**: More booking options
- ✅ **Staff Optimization**: Structured service periods
- ✅ **Competitive Advantage**: Dual shift availability

### Technical Debt Management
- ✅ **Backward Compatibility**: Existing dinner logic preserved
- ✅ **Data Migration**: Zero downtime deployment
- ✅ **Performance Impact**: <5% overhead from dual slots
- ✅ **Maintenance**: Clear separation of concerns

### Risk Mitigation
- 🛡️ **Database Safety**: Constraint validation + rollback plan
- 🛡️ **Frontend Resilience**: Graceful degradation if lunch_enabled=false
- 🛡️ **API Stability**: Existing endpoints preserve behavior
- 🛡️ **User Experience**: Clear gap period communication

## 🎯 IMPLEMENTATION TIMELINE

| Phase | Duration | Parallel Tasks | Dependencies |
|-------|----------|----------------|--------------|
| 1. Database Schema | 45 min | Migration + validation | None |
| 2. Server Logic | 90 min | business-hours-*.ts files | Phase 1 |
| 3. API Updates | 60 min | Route handlers | Phase 2 |
| 4. Frontend Hooks | 75 min | useBusinessHours.ts | Phase 3 |
| 5. Components | 120 min | Forms + displays | Phase 4 |
| 6. Testing | 90 min | E2E + unit tests | Phase 5 |
| 7. Deployment | 30 min | Rollback prep | All phases |

**TOTAL ESTIMATED TIME**: 8.5 hours (1 full development day)

## ✅ SUCCESS CRITERIA

### MVP Delivery Checkpoints
- [ ] Monday-Friday lunch service (13:00-16:00) operational
- [ ] Existing dinner service (18:30-23:00) unchanged
- [ ] Gap period (16:00-18:30) properly blocked
- [ ] Contact page displays dual schedule
- [ ] Reservation flow supports both shifts
- [ ] Admin interface allows dual configuration
- [ ] All tests pass + performance targets met

### Post-Launch Monitoring
- User adoption of lunch reservations
- System performance under dual load
- Customer feedback on gap period communication
- Revenue impact measurement

---

> **CONCLUSIÓN**: Esta estrategia de expansión de columnas garantiza compatibilidad total hacia atrás mientras introduce la funcionalidad de horario dual de manera robusta y escalable. El plan aborda todos los casos edge identificados y proporciona una ruta de rollback clara.