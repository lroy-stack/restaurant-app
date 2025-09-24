"use client"

import Link from "next/link"
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, MessageCircle, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
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

  const footerLinks = {
    restaurant: {
      title: 'Restaurante',
      links: [
        { name: 'Menú', href: '/menu' },
        { name: 'Reservas', href: '/reservas' },
        { name: 'Galería', href: '/galeria' },
        { name: 'Eventos', href: '/eventos' },
      ]
    },
    informacion: {
      title: 'Información',
      links: [
        { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
        { name: 'Contacto', href: '/contacto' },
        { name: 'Reseñas', href: '/resenas' },
        { name: 'Noticias', href: '/noticias' },
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
      {/* Newsletter Section */}
      <div
        className="border-b relative"
        style={{
          backgroundImage: 'url(https://ik.imagekit.io/insomnialz/feeling.jpg?updatedAt=1754141886874)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontFamily: 'var(--font-crimson), var(--font-source-serif), serif' }}>
              Mantente al día con nuestro newsletter
            </h3>
            <p className="text-white/80 mb-6">
              Descubre nuestros platos especiales, eventos exclusivos y ofertas únicas directamente en tu email.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 disabled:opacity-50"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={isLoading || !email}
                className="bg-white text-primary hover:bg-gray-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  'Suscribirse'
                )}
              </Button>
            </form>
            {error && (
              <p className="text-red-200 text-sm mt-2 text-center">
                {error}
              </p>
            )}
            {isSuccess && (
              <p className="text-green-200 text-sm mt-2 text-center">
                ¡Te has suscrito correctamente! Gracias por unirte.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <EnigmaLogo className="h-6 w-6" variant="primary" />
              <span className="enigma-brand-main text-lg font-semibold">
                {restaurant?.name || 'Enigma Cocina Con Alma'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {restaurant?.description || 'Cocina atlántico-mediterránea con alma en el auténtico casco antiguo de Calpe.'}
            </p>

            {/* Contact Info - Dynamic from DB */}
            {!loading && restaurant && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} className="hover:text-primary">
                    {restaurant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.hours_operation}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${restaurant.email}`} className="hover:text-primary">
                    {restaurant.email}
                  </a>
                </div>
              </div>
            )}

            {/* Loading fallback */}
            {loading && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Carrer Justicia 6A, 03710 Calpe, Alicante</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+34672796006" className="hover:text-primary">
                    +34 672 79 60 06
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Mar-Dom: 18:00 - 23:00</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:reservas@enigmaconalma.com" className="hover:text-primary">
                    reservas@enigmaconalma.com
                  </a>
                </div>
              </div>
            )}

            {/* Social Media - Dynamic with WhatsApp */}
            <div className="flex gap-3">
              {restaurant?.instagram_url && (
                <Button size="icon" variant="outline" className="h-9 w-9" asChild>
                  <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {restaurant?.facebook_url && (
                <Button size="icon" variant="outline" className="h-9 w-9" asChild>
                  <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {restaurant?.whatsapp_number && (
                <Button size="icon" variant="outline" className="h-9 w-9" asChild>
                  <a
                    href={`https://wa.me/${restaurant.whatsapp_number.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Footer Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="enigma-brand-body font-semibold">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Enigma Cocina Con Alma. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link href="/legal/aviso-legal" className="hover:text-primary">
                Aviso Legal
              </Link>
              <Link href="/legal/politica-privacidad" className="hover:text-primary">
                Privacidad
              </Link>
              <Link href="/legal/politica-cookies" className="hover:text-primary">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}