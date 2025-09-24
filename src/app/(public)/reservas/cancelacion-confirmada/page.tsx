'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  XCircle,
  Mail,
  Home,
  Calendar,
  ArrowRight,
  Heart
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function CancellationConfirmedPage() {
  useEffect(() => {
    // Optional: Track cancellation event for analytics
    console.log('Reservation cancellation confirmed successfully')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"
            >
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Reserva Cancelada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground leading-relaxed">
                Tu reserva ha sido cancelada exitosamente. Entendemos que los planes pueden cambiar.
              </p>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                      Email de confirmación enviado
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                      Recibirás los detalles de la cancelación en tu correo
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">
                      ¡Esperamos verte pronto!
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                      Estaremos encantados de recibirte en otra ocasión
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 pt-4"
            >
              <div className="space-y-2">
                <h3 className="font-medium text-foreground text-sm">¿Qué sigue ahora?</h3>
                <div className="text-xs text-muted-foreground space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Tu reserva ha sido completamente cancelada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>No se aplicarán cargos por la cancelación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Puedes hacer una nueva reserva cuando quieras</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 pt-6"
            >
              <Button asChild className="w-full">
                <Link href="/reservas">
                  <Calendar className="h-4 w-4 mr-2" />
                  Hacer Nueva Reserva
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Volver al Inicio
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-4 border-t"
            >
              <p className="text-xs text-muted-foreground">
                ¿Necesitas ayuda?{' '}
                <a
                  href="tel:+34123456789"
                  className="text-primary hover:underline font-medium"
                >
                  Contáctanos
                </a>
                {' '}o{' '}
                <a
                  href="mailto:info@enigmaconalma.com"
                  className="text-primary hover:underline font-medium"
                >
                  envíanos un email
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}