"use client"

import Link from "next/link"
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { useRestaurant } from "@/hooks/use-restaurant"
import { useState } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { restaurant, loading } = useRestaurant()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer',
          doubleOptIn: false
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setEmail('')
        setTimeout(() => setIsSuccess(false), 3000)
      } else {
        setError(data.error || 'Error al suscribirse')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Dynamic footer links with TripAdvisor from DB
  const footerLinks = {
    restaurant: {
      title: 'Restaurante',
      links: [
        { name: 'Menú', href: '/menu' },
        { name: 'Reservas', href: '/reservas' },
        { name: 'Galería', href: '/galeria' },
      ]
    },
    informacion: {
      title: 'Información',
      links: [
        { name: 'Sobre Nosotros', href: '/historia' },
        { name: 'Contacto', href: '/contacto' },
        { name: 'Reseñas', href: restaurant?.footer_tripadvisor_url || 'https://www.tripadvisor.es/Restaurant_Review-g187526-d23958723-Reviews-Enigma_Cocina_Con_Alma-Calpe_Costa_Blanca_Province_of_Alicante_Valencian_Communi.html' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Aviso Legal', href: '/legal/aviso-legal' },
        { name: 'Privacidad', href: '/legal/politica-privacidad' },
        { name: 'Términos y Condiciones', href: '/legal/terminos-condiciones' },
        { name: 'Cookies', href: '/legal/politica-cookies' },
        { name: 'Derechos GDPR', href: '/legal/derechos-gdpr' },
      ]
    },
  }

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-5">
        {/* Móvil: Stack vertical | Desktop: Grid horizontal compacto */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr] gap-6 md:gap-8 items-start">

          {/* Columna 1: Logo + Info breve (solo desktop inline, móvil stack) */}
          <div className="space-y-2 md:space-y-1.5">
            <div className="flex items-center gap-2">
              <EnigmaLogo className="h-5 w-5" variant="primary" />
              <span className="enigma-brand-main text-base font-semibold">
                {restaurant?.name || 'Enigma Cocina Con Alma'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-snug hidden md:block">
              Cocina mediterránea de autor en el casco antiguo de Calpe desde 2023.
            </p>
            {/* Móvil: descripción completa */}
            <p className="text-sm text-muted-foreground leading-relaxed md:hidden">
              {restaurant?.description || 'Cocina mediterránea de autor en el corazón del casco antiguo de Calpe desde 2023. Ingredientes de proximidad, producto de temporada, técnicas tradicionales.'}
            </p>
          </div>

          {/* Columna 2: Contacto inline compacto */}
          <div className="space-y-1.5 text-xs">
            {!loading && restaurant && (
              <>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} className="hover:text-primary">
                    {restaurant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <a href={`mailto:${restaurant.email}`} className="hover:text-primary truncate">
                    {restaurant.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="line-clamp-2 leading-tight">{restaurant.address}</span>
                </div>
                {/* Redes sociales compactas */}
                <div className="flex gap-1.5 pt-1">
                  {restaurant?.instagram_url && (
                    <Button size="icon" variant="outline" className="h-7 w-7" asChild>
                      <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <Instagram className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  {restaurant?.facebook_url && (
                    <Button size="icon" variant="outline" className="h-7 w-7" asChild>
                      <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <Facebook className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  {restaurant?.whatsapp_number && (
                    <Button size="icon" variant="outline" className="h-7 w-7 hover:bg-[#25D366]/10" asChild>
                      <a href={`https://wa.me/${restaurant.whatsapp_number.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </>
            )}
            {loading && (
              <>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <a href="tel:+34672796006">+34 672 79 60 06</a>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <a href="mailto:reservas@enigmaconalma.com">reservas@enigmaconalma.com</a>
                </div>
              </>
            )}
          </div>

          {/* Columnas 3-5: Links navegación (cada una es una columna) */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h4 className="font-semibold text-foreground text-sm">{section.title}</h4>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <p className="text-center sm:text-left">© {currentYear} {restaurant?.footer_copyright_text || 'Enigma Cocina Con Alma. Todos los derechos reservados.'}</p>
            <div className="flex gap-3">
              <Link href="/legal/aviso-legal" className="hover:text-primary transition-colors">
                Aviso Legal
              </Link>
              <Link href="/legal/politica-privacidad" className="hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link href="/legal/politica-cookies" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}