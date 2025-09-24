import { Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Configuración general del sistema y preferencias
        </p>
      </div>

      {/* Development Placeholder */}
      <Card>
        <CardContent className="p-12 text-center">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            EN DESARROLLO
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Esta sección está siendo desarrollada. Próximamente podrás configurar
            todas las opciones del sistema desde aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}