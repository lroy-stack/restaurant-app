import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Panel de análisis y métricas web
        </p>
      </div>

      {/* Development Placeholder */}
      <Card>
        <CardContent className="p-12 text-center">
          <Construction className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            EN DESARROLLO
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Esta sección está siendo desarrollada. Próximamente dispondrás de análisis
            web detallados y métricas de rendimiento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}