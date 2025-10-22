"use client"

import Link from "next/link"
import { Phone, MapPin, Mail, Instagram, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { useRestaurant } from "@/hooks/use-restaurant"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { restaurant, loading } = useRestaurant()

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
        { name: 'Reseñas', href: restaurant?.footer_tripadvisor_url || 'https://www.tripadvisor.com' },
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
      <div className="container mx-auto px-4 py-6">
        {/* Logo y descripción - 100% Dinámico desde DB */}
        <div className="flex items-center gap-2 mb-3">
          <EnigmaLogo className="h-7 w-7" variant="primary" />
          <span className="enigma-brand-main text-base font-semibold">
            {restaurant?.name || 'Nombre de Tu Restaurante'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          {restaurant?.description || 'Descripción del restaurante desde base de datos'}
        </p>

        {/* Grid: Móvil 3 cols horizontal, Desktop 4 cols */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 pb-6 border-b">
          {/* Contacto: full width en móvil, 1 col en desktop */}
          <div className="col-span-3 lg:col-span-1 space-y-2">
            <h4 className="font-semibold text-sm mb-3">Contacto</h4>
            {!loading && restaurant && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} className="hover:text-primary">
                    {restaurant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${restaurant.email}`} className="hover:text-primary break-words">
                    {restaurant.email}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{restaurant.address}</span>
                </div>
                {/* Redes sociales */}
                <div className="flex gap-2 pt-2">
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
                    <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-[#25D366]/10" asChild>
                      <a href={`https://wa.me/${restaurant.whatsapp_number.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <WhatsAppIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
            {loading && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>Loading...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
          </div>

          {/* Links navegación - 1 col cada uno en móvil y desktop */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="col-span-1 space-y-2">
              <h4 className="font-semibold text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
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

      {/* Bottom Footer */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <p className="text-center sm:text-left">© {currentYear} {restaurant?.footer_copyright_text || `${restaurant?.name || 'Restaurante'}. Todos los derechos reservados.`}</p>
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