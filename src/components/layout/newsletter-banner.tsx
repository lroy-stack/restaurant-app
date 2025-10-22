"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { useRestaurant } from "@/hooks/use-restaurant"

export function NewsletterBanner() {
  const { restaurant } = useRestaurant()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  // RFC 5322 compliant email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isButtonDisabled = !isValidEmail(email) || isLoading || isSuccess

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) return

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
          source: 'banner',
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

  return (
    <section className="relative w-full py-8 sm:py-12 overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src={restaurant?.footer_newsletter_image_url || 'https://images.unsplash.com/photo-1530554764233-e79e16c91d08?w=1200&h=800&fit=crop'}
          alt="Newsletter"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          {/* Title */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {restaurant?.footer_newsletter_title || 'Mantente al día con nuestro newsletter'}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            {restaurant?.footer_newsletter_description || 'Descubre nuestros platos especiales, eventos exclusivos y ofertas únicas.'}
          </p>

          {/* Form */}
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email"
              required
              className="flex-1 h-11 sm:h-11 px-3 sm:px-4 border-2 border-white/30 bg-white/10 backdrop-blur-md rounded-lg text-sm sm:text-base text-white placeholder:text-white/60 placeholder:text-xs sm:placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="h-11 sm:h-11 px-4 sm:px-6 bg-white text-primary hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline sm:ml-2">Enviando...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline sm:ml-2">¡Listo!</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">OK</span>
                  <span className="hidden sm:inline">Suscribirse</span>
                </>
              )}
            </Button>
          </form>

          {/* Messages */}
          {error && (
            <p className="text-xs sm:text-sm text-red-400 mt-3 bg-red-900/30 backdrop-blur-sm py-1.5 px-3 rounded-lg inline-block">
              {error}
            </p>
          )}
          {isSuccess && (
            <p className="text-xs sm:text-sm text-green-400 mt-3 bg-green-900/30 backdrop-blur-sm py-1.5 px-3 rounded-lg inline-block">
              ¡Gracias por suscribirte!
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
