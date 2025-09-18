import Link from "next/link"
import { Phone, MapPin, Clock, Mail, Instagram, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnigmaLogo } from "@/components/ui/enigma-logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

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
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="enigma-card-title">
              Mantente al día con nuestro newsletter
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Descubre nuestros platos especiales, eventos exclusivos y ofertas únicas directamente en tu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-500"
              />
              <Button 
                variant="secondary" 
                className="bg-white text-primary hover:bg-gray-100"
              >
                Suscribirse
              </Button>
            </div>
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
              <span className="enigma-brand-main text-lg font-semibold">Enigma Cocina Con Alma</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Cocina atlántico-mediterránea con alma en el auténtico casco antiguo de Calpe.
            </p>
            
            {/* Contact Info */}
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

            {/* Social Media */}
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9">
                <Facebook className="h-4 w-4" />
              </Button>
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