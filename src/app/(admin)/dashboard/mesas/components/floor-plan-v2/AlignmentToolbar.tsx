'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Grid3x3, Ruler } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'

interface AlignmentToolbarProps {
  onRefresh?: () => void
}

export function AlignmentToolbar({ onRefresh }: AlignmentToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const executeFix = async (action: 'resize' | 'align' | 'redistribute' | 'both', spacing: number = 60) => {
    setIsProcessing(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/tables/fix-dimensions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, spacing })
      })

      const result = await response.json()
      setLastResult(result)

      if (result.success) {
        // Force full page reload to clear any caches
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Error executing fix:', error)
      setLastResult({
        success: false,
        error: 'Failed to execute fix'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Grid3x3 className="h-4 w-4" />
                Auto-Fix Mesas
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs">
            Herramientas de Alineación
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => executeFix('resize')}
            className="cursor-pointer"
          >
            <Ruler className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">Redimensionar</div>
              <div className="text-xs text-muted-foreground">
                Auto-ajustar según capacidad
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => executeFix('align')}
            className="cursor-pointer"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">Alinear a Grid</div>
              <div className="text-xs text-muted-foreground">
                Grid 10px horizontal
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => executeFix('redistribute', 60)}
            className="cursor-pointer"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">Redistribuir (60px)</div>
              <div className="text-xs text-muted-foreground">
                Espaciado uniforme entre mesas
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => executeFix('both', 60)}
            className="cursor-pointer"
          >
            <div className="flex-1">
              <div className="font-medium">Todas las Operaciones</div>
              <div className="text-xs text-muted-foreground">
                Redimensionar + Alinear + Redistribuir
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Result badge */}
      {lastResult && (
        <Badge
          variant={lastResult.success ? 'default' : 'destructive'}
          className="text-xs"
        >
          {lastResult.success ? (
            <>
              ✓ {lastResult.resize?.updated || 0} redim. + {lastResult.align?.aligned || 0} alin. + {lastResult.redistribute?.redistributed || 0} redist.
            </>
          ) : (
            <>✗ Error</>
          )}
        </Badge>
      )}
    </div>
  )
}
