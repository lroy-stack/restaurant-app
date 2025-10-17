import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageCircle, Phone, Mail } from 'lucide-react'

interface ContactCTACardProps {
  title: string
  description: string
  icon?: React.ReactNode
  buttonText: string
  onButtonClick: () => void
  variant?: 'whatsapp' | 'phone' | 'email' | 'default'
  className?: string
  loading?: boolean
  disabled?: boolean
}

/**
 * Componente genérico de CTA para contacto
 * Reutilizable para WhatsApp, teléfono, email, etc.
 */
export function ContactCTACard({
  title,
  description,
  icon,
  buttonText,
  onButtonClick,
  variant = 'default',
  className,
  loading = false,
  disabled = false
}: ContactCTACardProps) {
  // Estilos por variante
  const variantStyles = {
    whatsapp: 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20',
    phone: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20',
    email: 'border-primary/30 bg-primary/5',
    default: 'border-border'
  }

  const buttonVariants = {
    whatsapp: 'bg-[#25D366] hover:bg-[#20BA5A] text-white',
    phone: 'bg-blue-600 hover:bg-blue-700 text-white',
    email: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    default: 'bg-primary hover:bg-primary/90 text-primary-foreground'
  }

  // Íconos por defecto según variante
  const defaultIcons = {
    whatsapp: <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />,
    phone: <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    email: <Mail className="h-6 w-6 text-primary" />,
    default: null
  }

  const displayIcon = icon || defaultIcons[variant]

  return (
    <Card className={cn(
      'border-2 transition-all',
      variantStyles[variant],
      className
    )}>
      <CardHeader className="text-center space-y-3">
        {displayIcon && (
          <div className="mx-auto w-fit p-3 rounded-full bg-background/50 border">
            {displayIcon}
          </div>
        )}
        <div className="space-y-2">
          <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
          <CardDescription className="text-base md:text-lg">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button
          onClick={onButtonClick}
          disabled={disabled || loading}
          size="lg"
          className={cn(
            'text-base px-8 shadow-lg',
            buttonVariants[variant]
          )}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {buttonText}
            </>
          ) : (
            buttonText
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
