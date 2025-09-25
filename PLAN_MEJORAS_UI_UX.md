# PLAN INTEGRAL DE MEJORAS UI/UX - ENIGMA COCINA CON ALMA

## 🎯 RESUMEN EJECUTIVO

Plan completo de mejoras para las páginas principales siguiendo mejores prácticas comprobadas, sin hardcodeo de información, con contenido dinámico y breakpoints responsive optimizados para todos los dispositivos.

**Referencias analizadas:**
- ✅ Páginas actuales de Enigma (Homepage, Historia, Galería, Contacto)
- ✅ Ejemplos Shadcn/ui oficiales (Hero sections, Gallery grids, Forms)
- ✅ Proyecto alemán Badezeit.de (Patrones UX comprobados)
- ✅ Mejores prácticas responsive design

---

## 📋 ANÁLISIS SITUACIÓN ACTUAL VS MEJORES PRÁCTICAS

### HOMEPAGE (/) - Análisis Actual
```tsx
// PROBLEMA: Información hardcodeada
<span className="enigma-brand-body font-medium text-white">230+ clientes satisfechos/mes</span>

// PROBLEMA: Trust signals estáticos
<div className="flex items-center gap-1">
  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
  <span className="enigma-brand-body font-semibold text-white">4.8/5</span>
  <span className="text-white/80">Google</span>
</div>
```

### HERO SECTIONS - Referencia Badezeit.de (EXCELENTE)
```tsx
// ✅ PATRÓN PROBADO: Trust signals dinámicos
<div className="flex justify-center items-center gap-6 mb-6 text-sm">
  <div className="flex items-center gap-1">
    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    <span className="font-semibold">{reviews.rating}/5</span>
    <span className="text-white/80">{reviews.source}</span>
  </div>
  <div className="flex items-center gap-1">
    <Award className="h-4 w-4 text-yellow-400" />
    <span className="text-white/80">{restaurant.certificate}</span>
  </div>
  <div className="flex items-center gap-1">
    <Users className="h-4 w-4" />
    <span className="text-white/80">{stats.monthlyGuests}+ zufriedene Gäste/Monat</span>
  </div>
</div>

// ✅ DISPONIBILIDAD REAL
<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-lg mx-auto">
  <p className="text-lg font-semibold mb-2">
    🔥 Heute nur noch {availability.tablesLeft} Tische verfügbar!
  </p>
  <p className="text-sm text-white/80">Reservieren Sie jetzt Ihren Tisch mit Meerblick</p>
</div>
```

---

## 🏗️ SISTEMA DE BREAKPOINTS RESPONSIVE OPTIMIZADO

### GRID SYSTEM UNIFICADO (Basado en Shadcn + Badezeit.de)
```css
/* Breakpoints optimizados para todos los dispositivos */
--breakpoint-xs: 375px   /* iPhone SE y similar */
--breakpoint-sm: 640px   /* Móvil landscape */
--breakpoint-md: 768px   /* Tablet portrait */
--breakpoint-lg: 1024px  /* Tablet landscape / Desktop pequeño */
--breakpoint-xl: 1280px  /* Desktop estándar */
--breakpoint-2xl: 1536px /* Desktop grande */

/* Spacing responsive system */
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 3rem      /* 48px */
```

### GALLERY GRID RESPONSIVE (Shadcn Pattern)
```tsx
// ✅ PATRÓN SHADCN OPTIMIZADO
const gridSizes = {
  // Móvil: 1 columna, Tablet: 2, Desktop: 3
  mobile: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  // Móvil: 2 columnas, Tablet: 3, Desktop: 4
  compact: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  // Móvil: 3 columnas, Tablet: 4, Desktop: 6
  dense: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
}

// Spacing responsive con Shadcn pattern
<div className="grid gap-2 sm:gap-4 md:gap-6 lg:gap-8">
  <CarouselContent className="-ml-2 md:-ml-4">
    <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
      // Contenido
    </CarouselItem>
  </CarouselContent>
</div>
```

---

## 🌟 SISTEMA DE CONTENIDO DINÁMICO

### 1. RESEÑAS TRIPADVISOR ROTATORIAS
```tsx
// Hook para reseñas dinámicas
export const useRotatingReviews = () => {
  const [currentReview, setCurrentReview] = useState(0)
  const { reviews, loading } = useTripAdvisorReviews()

  useEffect(() => {
    if (!reviews.length) return

    const interval = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % reviews.length)
    }, 8000) // Rota cada 8 segundos

    return () => clearInterval(interval)
  }, [reviews.length])

  return { currentReview: reviews[currentReview], loading }
}

// Componente de reseña dinámica
export const DynamicReview = () => {
  const { currentReview, loading } = useRotatingReviews()

  if (loading) return <ReviewSkeleton />

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < currentReview.rating ? 'fill-current' : ''}`} />
          ))}
        </div>
        <span className="text-sm text-white/60">hace {currentReview.timeAgo}</span>
      </div>
      <p className="text-sm text-white/80 mb-3">"{currentReview.text}"</p>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
          {currentReview.author.initials}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{currentReview.author.name}</div>
          <div className="text-xs text-white/60">TripAdvisor verificado</div>
        </div>
      </div>
    </div>
  )
}
```

### 2. BADGES DE DISPONIBILIDAD REALES
```tsx
// Hook para disponibilidad en tiempo real
export const useRealTimeAvailability = () => {
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await fetch('/api/tables/availability')
        const data = await response.json()

        // Calcular disponibilidad basada en isActive zones
        const availableZones = data.zones.filter(zone => zone.isActive)
        const totalTables = availableZones.reduce((sum, zone) => sum + zone.availableTables, 0)

        setAvailability({
          tablesLeft: totalTables,
          nextSlot: data.nextAvailableSlot,
          isUrgent: totalTables <= 3,
          zones: availableZones
        })
      } catch (error) {
        console.error('Error fetching availability:', error)
        setAvailability(null)
      } finally {
        setLoading(false)
      }
    }

    // Check inicial
    checkAvailability()

    // Actualizar cada 5 minutos
    const interval = setInterval(checkAvailability, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { availability, loading }
}

// Componente de disponibilidad dinámica
export const RealTimeAvailabilityBadge = () => {
  const { availability, loading } = useRealTimeAvailability()

  if (loading) return <AvailabilitySkeleton />
  if (!availability) return null

  const urgencyColor = availability.isUrgent ? 'bg-red-600/20 border-red-400/30' : 'bg-green-600/20 border-green-400/30'

  return (
    <div className={`backdrop-blur-sm rounded-lg p-4 mb-8 max-w-lg mx-auto ${urgencyColor}`}>
      <p className="text-lg font-semibold mb-2">
        {availability.isUrgent ? '🔥' : '✅'} {availability.isUrgent ? 'Solo' : 'Disponibles'} {availability.tablesLeft} mesas hoy!
      </p>
      <p className="text-sm text-white/80">
        Próximo horario: {availability.nextSlot}
      </p>
    </div>
  )
}
```

### 3. STATS DINÁMICOS DEL RESTAURANTE
```tsx
export const DynamicRestaurantStats = () => {
  const { restaurant, loading } = useRestaurant()
  const { stats } = useRestaurantStats()

  if (loading) return <StatsSkeleton />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">{stats.rating}★</div>
        <div className="text-sm text-muted-foreground">{stats.source}</div>
        <div className="text-xs text-green-600">+{stats.reviewCount} valoraciones</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">{stats.recommendationRate}%</div>
        <div className="text-sm text-muted-foreground">Recomendación</div>
        <div className="text-xs text-green-600">{stats.totalGuests} huéspedes</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">{stats.avgResponseTime} Min</div>
        <div className="text-sm text-muted-foreground">Tiempo respuesta</div>
        <div className="text-xs text-green-600">Promedio</div>
      </div>
    </div>
  )
}
```

---

## 📱 MEJORAS ESPECÍFICAS POR PÁGINA

### HOMEPAGE (/) - MEJORAS PRIORITARIAS

#### ✅ HERO SECTION OPTIMIZADO
```tsx
export default function HomePage() {
  const { availability } = useRealTimeAvailability()
  const { currentReview } = useRotatingReviews()
  const { restaurant } = useRestaurant()

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background optimizado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div
          className="w-full h-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${restaurant?.heroImage || 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1758114245475'})`,
            backgroundPosition: '65% center'
          }}
        />
      </div>

      <div className="relative z-20 text-center text-white mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Trust Signals Dinámicos */}
        <DynamicTrustSignals />

        {/* Título y subtítulo */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
          {restaurant?.name || "Enigma Cocina Con Alma"}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8">
          {restaurant?.description || "Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe"}
        </p>

        {/* Disponibilidad Real */}
        <RealTimeAvailabilityBadge />

        {/* CTAs Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Link href="/reservas">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
              <Utensils className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Reservar Mesa
            </Button>
          </Link>
          <Link href="/menu">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
              Ver Nuestro Menú
            </Button>
          </Link>
        </div>

        {/* Social Proof Rotatorio */}
        <DynamicReview />
      </div>

      {/* Floating contact info mejorado */}
      <FloatingContactInfo />
      <FloatingAvailabilityStatus />
    </section>
  )
}
```

#### ✅ TRUST SIGNALS DINÁMICOS
```tsx
const DynamicTrustSignals = () => {
  const { restaurant } = useRestaurant()
  const { stats } = useRestaurantStats()

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 text-sm">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-white">{stats.rating}/5</span>
        <span className="text-white/80">{stats.source}</span>
      </div>
      <div className="flex items-center gap-1">
        <Award className="h-4 w-4 text-yellow-400" />
        <span className="text-white/90 font-medium">{restaurant.awards}</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-white/90" />
        <span className="text-white/90 font-medium">{stats.monthlyGuests}+ clientes satisfechos/mes</span>
      </div>
    </div>
  )
}
```

### GALERÍA (/galeria) - MEJORAS PRIORITARIAS

#### ✅ GRID RESPONSIVE OPTIMIZADO (Patrón Shadcn)
```tsx
export default function GaleriaPage() {
  const [gridSize, setGridSize] = useState<'mobile' | 'compact' | 'dense'>('compact')
  const { gallery } = useGallery()

  // Grid sizes optimizados para todos los dispositivos
  const gridSizes = {
    mobile: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    compact: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    dense: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Controles de vista mejorados */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex border rounded-lg">
            {(['mobile', 'compact', 'dense'] as const).map((size) => (
              <Button
                key={size}
                variant={gridSize === size ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGridSize(size)}
                className="min-h-[44px] px-4"
              >
                <Grid className={`h-5 w-5 ${size === 'dense' ? 'scale-75' : size === 'mobile' ? 'scale-125' : ''}`} />
                <span className="sr-only">{size} view</span>
              </Button>
            ))}
          </div>

          {/* Filtros categorizados */}
          <FilterControls />
        </div>

        {/* Grid con spacing responsive (Patrón Shadcn) */}
        <div className={cn(
          "grid gap-2 sm:gap-4 md:gap-6",
          gridSizes[gridSize]
        )}>
          {gallery.images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              gridSize={gridSize}
              priority={index < 6} // LCP optimization
            />
          ))}
        </div>

        {/* Load more optimizado */}
        <InfiniteScrollLoader />
      </div>
    </section>
  )
}

// Componente de imagen optimizado
const ImageCard = ({ image, index, gridSize, priority }) => {
  const sizes = {
    mobile: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    compact: '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    dense: '(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw'
  }

  return (
    <Card className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image.imageUrl}
          alt={image.alt || image.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={sizes[gridSize]}
          priority={priority}
          quality={85}
        />

        {/* Overlay con información */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center text-white">
            <Eye className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Ver imagen</p>
          </div>
        </div>
      </div>

      {/* Información solo en vista no densa */}
      {gridSize !== 'dense' && (
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-2">{image.title}</h3>
          {image.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {image.description}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
```

### CONTACTO (/contacto) - MEJORAS PRIORITARIAS

#### ✅ FORMULARIO CON VALIDACIÓN SHADCN
```tsx
// Schema de validación Zod
const contactFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email válido requerido'),
  telefono: z.string().optional(),
  asunto: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  privacidad: z.boolean().refine(val => val === true, {
    message: 'Debe aceptar la política de privacidad'
  })
})

export const ContactForm = () => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: '',
      privacidad: false
    }
  })

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        // Success handling
        form.reset()
        // Show success message
      }
    } catch (error) {
      // Error handling
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Grid responsive para campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+34 XXX XXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email y asunto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asunto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto *</FormLabel>
                <FormControl>
                  <Input placeholder="¿En qué podemos ayudarte?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Mensaje */}
        <FormField
          control={form.control}
          name="mensaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cuéntanos más detalles..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Privacidad */}
        <FormField
          control={form.control}
          name="privacidad"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Acepto la{' '}
                  <Link href="/legal/politica-privacidad" className="text-primary hover:underline">
                    política de privacidad
                  </Link>
                  {' '}*
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size="lg">
          <Mail className="mr-2 h-4 w-4" />
          Enviar Mensaje
        </Button>
      </form>
    </Form>
  )
}
```

#### ✅ INFORMACIÓN DINÁMICA DE CONTACTO
```tsx
export const DynamicContactInfo = () => {
  const { restaurant } = useRestaurant()
  const { businessHours } = useBusinessHours()
  const { isOpen, nextOpenTime } = useOpeningStatus()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Dirección */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Dirección</h3>
          </div>
          <div className="space-y-3 text-center">
            <p className="font-semibold text-lg">{restaurant?.name}</p>
            <p>{restaurant?.address?.street}</p>
            <p>{restaurant?.address?.city}</p>
            <p className="text-sm text-primary italic">{restaurant?.ambiente}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Contacto</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <a href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`}
                 className="hover:text-primary transition-colors">
                {restaurant?.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <a href={`mailto:${restaurant?.email}`}
                 className="hover:text-primary transition-colors">
                {restaurant?.email}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horarios dinámicos */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Horarios</h3>
          </div>
          <div className="space-y-4 text-center">
            {/* Estado actual */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              {isOpen ? 'Abierto ahora' : 'Cerrado'}
            </div>

            {/* Horarios de la semana */}
            <div className="space-y-2">
              {businessHours?.map((day, index) => (
                <div key={index} className={`flex justify-between text-sm ${
                  day.isToday ? 'font-semibold text-primary' : 'text-muted-foreground'
                }`}>
                  <span>{day.dayName}</span>
                  <span>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Cerrado'}</span>
                </div>
              ))}
            </div>

            {!isOpen && nextOpenTime && (
              <p className="text-xs text-muted-foreground">
                Próxima apertura: {nextOpenTime}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### HISTORIA (/historia) - MEJORAS PRIORITARIAS

#### ✅ CONTENIDO DINÁMICO DE HISTORIA
```tsx
export default function HistoriaPage() {
  const { restaurant } = useRestaurant()
  const { history } = useRestaurantHistory()
  const { awards } = useRestaurantAwards()

  return (
    <>
      {/* Hero con imagen dinámica */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/45 z-10" />
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${restaurant?.historyHeroImage || 'https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true'})`
            }}
          />
        </div>

        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-6 text-white border-white/50 bg-black/60 backdrop-blur-sm">
            <Heart className="h-3 w-3 mr-1 text-white" />
            🏛️ {restaurant?.heritage || 'Patrimonio Gastronómico'}
          </Badge>

          <h1 className="enigma-hero-title">
            {history?.title || 'Tradición y Pasión'}
          </h1>

          <p className="enigma-hero-subtitle">
            {restaurant?.description}
          </p>

          {/* Logros dinámicos */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm sm:text-base text-white/90 mb-8">
            {awards?.map((award, index) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">{award.title}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white" />
              <span>{restaurant?.locationDescription}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Historia dinámica */}
      <DynamicHistoryContent history={history} />

      {/* Valores con contenido dinámico */}
      <DynamicValues values={restaurant?.values} />
    </>
  )
}
```

---

## 🚀 IMPLEMENTACIÓN TÉCNICA

### ESTRUCTURA DE HOOKS PERSONALIZADOS
```tsx
// hooks/useRestaurant.ts - Información base del restaurante
export const useRestaurant = () => {
  return useSWR('/api/restaurant/info', fetcher)
}

// hooks/useRestaurantStats.ts - Estadísticas dinámicas
export const useRestaurantStats = () => {
  return useSWR('/api/restaurant/stats', fetcher, {
    refreshInterval: 5 * 60 * 1000 // Actualiza cada 5 minutos
  })
}

// hooks/useTripAdvisorReviews.ts - Reseñas de TripAdvisor
export const useTripAdvisorReviews = () => {
  return useSWR('/api/reviews/tripadvisor', fetcher, {
    refreshInterval: 10 * 60 * 1000 // Actualiza cada 10 minutos
  })
}

// hooks/useRealTimeAvailability.ts - Disponibilidad en tiempo real
export const useRealTimeAvailability = () => {
  return useSWR('/api/tables/availability', fetcher, {
    refreshInterval: 30 * 1000 // Actualiza cada 30 segundos
  })
}
```

### ENDPOINTS API NECESARIOS
```typescript
// /api/restaurant/info - Información básica
interface RestaurantInfo {
  id: string
  name: string
  description: string
  address: Address
  phone: string
  email: string
  heroImage: string
  historyHeroImage: string
  awards: Award[]
  values: Value[]
  ambiente: string
}

// /api/restaurant/stats - Estadísticas dinámicas
interface RestaurantStats {
  rating: number
  source: string
  reviewCount: number
  recommendationRate: number
  monthlyGuests: number
  avgResponseTime: number
  totalGuests: number
}

// /api/reviews/tripadvisor - Reseñas TripAdvisor
interface TripAdvisorReview {
  id: string
  rating: number
  text: string
  author: {
    name: string
    initials: string
  }
  timeAgo: string
  verified: boolean
}

// /api/tables/availability - Disponibilidad real
interface AvailabilityData {
  zones: Zone[]
  nextAvailableSlot: string
  totalTables: number
  availableTables: number
}

interface Zone {
  id: string
  name: string
  isActive: boolean
  availableTables: number
  capacity: number
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: FUNDACIONES (Semana 1-2)
- [ ] ✅ Configurar hooks personalizados para datos dinámicos
- [ ] ✅ Crear endpoints API para contenido dinámico
- [ ] ✅ Implementar sistema de breakpoints responsive unificado
- [ ] ✅ Configurar componentes base con Shadcn patterns

### FASE 2: HOMEPAGE (Semana 2-3)
- [ ] ✅ Hero section con contenido dinámico
- [ ] ✅ Trust signals rotatorios
- [ ] ✅ Badge de disponibilidad en tiempo real
- [ ] ✅ Reseñas TripAdvisor rotatorias
- [ ] ✅ Stats dinámicos del restaurante

### FASE 3: GALERÍA (Semana 3-4)
- [ ] ✅ Grid responsive optimizado (patrón Shadcn)
- [ ] ✅ Controles de vista mejorados
- [ ] ✅ Filtros categorizados
- [ ] ✅ Infinite scroll optimizado
- [ ] ✅ Lightbox mejorado

### FASE 4: CONTACTO (Semana 4-5)
- [ ] ✅ Formulario con validación Shadcn + Zod
- [ ] ✅ Información dinámica de contacto
- [ ] ✅ Horarios en tiempo real
- [ ] ✅ Estado de apertura dinámico
- [ ] ✅ Mapa interactivo mejorado

### FASE 5: HISTORIA (Semana 5-6)
- [ ] ✅ Contenido dinámico de historia
- [ ] ✅ Logros y premios dinámicos
- [ ] ✅ Timeline interactiva
- [ ] ✅ Valores del restaurante dinámicos

### FASE 6: OPTIMIZACIÓN (Semana 6-7)
- [ ] ✅ Performance optimization
- [ ] ✅ Accessibility improvements
- [ ] ✅ SEO enhancements
- [ ] ✅ Testing & QA
- [ ] ✅ Documentation

---

## 🎯 MÉTRICAS DE ÉXITO

### PERFORMANCE
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Mobile Score**: > 90 (PageSpeed Insights)

### UX METRICS
- **Bounce Rate**: < 40%
- **Engagement Time**: > 2 minutos
- **Conversion Rate**: +25% en reservas
- **Mobile Usage**: +35% retention

### TECHNICAL
- **Bundle Size**: < 200KB initial
- **API Response**: < 200ms average
- **Error Rate**: < 1%
- **Accessibility**: AA compliance

---

## 🔗 REFERENCIAS Y DOCUMENTACIÓN

### EJEMPLOS ANALIZADOS
1. **Badezeit.de** - Hero sections, trust signals, disponibilidad
2. **Shadcn/ui docs** - Grid patterns, form validation, responsive design
3. **Enigma actual** - Estructura base, componentes existentes

### PATRONES APLICADOS
- **Hero Section**: Badezeit.de pattern + Shadcn responsive
- **Gallery Grid**: Shadcn carousel + responsive sizing
- **Forms**: Shadcn + Zod validation pattern
- **Dynamic Content**: SWR + custom hooks pattern

### DOCUMENTACIÓN TÉCNICA
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [SWR Data Fetching](https://swr.vercel.app/)

---

**PLAN CREADO**: Diciembre 2024
**ESTIMACIÓN**: 6-7 semanas de desarrollo
**PRIORIDAD**: 🔥 Alta - Impacto directo en conversiones
**ESTADO**: 📋 Listo para implementación