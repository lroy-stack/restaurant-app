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
      {/* Main Footer Content - Mejor jerarquía */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          {/* Restaurant Info - Full width compacto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <EnigmaLogo className="h-5 w-5" variant="primary" />
              <span className="enigma-brand-main text-base font-semibold">
                {restaurant?.name || 'Enigma Cocina Con Alma'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {restaurant?.description || 'Cocina mediterránea de autor en el corazón del casco antiguo de Calpe desde 2023. Ingredientes de proximidad, producto de temporada, técnicas tradicionales. Carrer Justicia 6A. Reserva online con pre-pedidos.'}
            </p>

            {/* Contact Info - Grid 4 columnas responsive */}
            {!loading && restaurant && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                    {restaurant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${restaurant.email}`} className="hover:text-primary transition-colors break-all">
                    {restaurant.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Horarios</span>
                  </div>
                  <div className="pl-6 text-sm space-y-0.5">
                    {restaurant.hours_operation.split('|').map((schedule, idx) => (
                      <div key={idx} className="text-muted-foreground/80 leading-snug">
                        {schedule.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading fallback */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Carrer Justicia 6A, 03710 Calpe, Alicante</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href="tel:+34672796006" className="hover:text-primary transition-colors">
                    +34 672 79 60 06
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href="mailto:reservas@enigmaconalma.com" className="hover:text-primary transition-colors">
                    reservas@enigmaconalma.com
                  </a>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Horarios</span>
                  </div>
                  <div className="pl-6 text-sm space-y-0.5 text-muted-foreground/80">
                    <div>Lun: Cerrado</div>
                    <div>Mar: 18:30-23:00</div>
                    <div>Mié-Sáb: 13:00-16:00 y 18:30-23:00</div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Media */}
            <div className="flex gap-2">
              {restaurant?.instagram_url && (
                <Button size="icon" variant="outline" className="h-8 w-8" asChild>
                  <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {restaurant?.facebook_url && (
                <Button size="icon" variant="outline" className="h-8 w-8" asChild>
                  <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {restaurant?.whatsapp_number && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hover:bg-[#25D366]/10 hover:border-[#25D366]/50 hover:text-[#25D366] transition-all"
                  asChild
                >
                  <a
                    href={`https://wa.me/${restaurant.whatsapp_number.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Footer Links - Horizontal en una fila para mejor jerarquía */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 pt-2 border-t">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title} className="space-y-2">
                <h4 className="enigma-brand-body font-semibold text-foreground text-sm">{section.title}</h4>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith('http') ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
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