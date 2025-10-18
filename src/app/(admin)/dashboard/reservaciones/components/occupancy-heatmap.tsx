'use client'

import { useState, useEffect } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { format, subMonths, addMonths } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OccupancyHeatmapProps {
  startDate?: Date
  endDate?: Date
  onDateClick?: (date: Date) => void
}

interface HeatmapValue {
  date: string
  count?: number
  occupancyRate?: number
}

export function OccupancyHeatmap({
  startDate = subMonths(new Date(), 6),
  endDate = addMonths(new Date(), 1),
  onDateClick
}: OccupancyHeatmapProps) {
  const [values, setValues] = useState<HeatmapValue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOccupancyData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/reservations/stats/occupancy?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
        )
        const data = await response.json()
        setValues(data.occupancyData || [])
      } catch (error) {
        console.error('Error fetching occupancy:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOccupancyData()
  }, [startDate, endDate])

  const classForValue = (value: HeatmapValue | undefined) => {
    if (!value || !value.count || value.count === 0) {
      return 'color-empty'
    }

    const rate = value.occupancyRate || 0
    if (rate < 30) return 'color-scale-1'
    if (rate < 60) return 'color-scale-2'
    if (rate < 85) return 'color-scale-3'
    return 'color-scale-4'
  }

  const titleForValue = (value: HeatmapValue | undefined) => {
    if (!value || !value.count || value.count === 0) {
      return 'Sin reservas este día'
    }
    const rate = value.occupancyRate || 0
    return `${value.count} reserva${value.count > 1 ? 's' : ''} - ${rate}% ocupación`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg mb-1">Mapa de Calor - Ocupación</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualización de 6 meses atrás hasta 1 mes adelante. Click en un día para ver detalles.
              </p>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22] border border-border"></div>
                <span className="text-muted-foreground">Sin reservas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#9be9a8] dark:bg-[#0e4429]"></div>
                <span className="text-muted-foreground">Baja (&lt;30%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#40c463] dark:bg-[#006d32]"></div>
                <span className="text-muted-foreground">Media (30-60%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#f59e0b] dark:bg-[#92400e]"></div>
                <span className="text-muted-foreground">Alta (60-85%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#ef4444] dark:bg-[#991b1b]"></div>
                <span className="text-muted-foreground">Completa (&gt;85%)</span>
              </div>
            </div>
          </div>
          {!loading && values.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{values.reduce((sum, v) => sum + (v.count || 0), 0)}</div>
                <div className="text-xs text-muted-foreground">Total Reservas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {values.filter(v => (v.occupancyRate || 0) >= 60).length}
                </div>
                <div className="text-xs text-muted-foreground">Días Alta Ocupación</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {values.filter(v => (v.occupancyRate || 0) >= 30 && (v.occupancyRate || 0) < 60).length}
                </div>
                <div className="text-xs text-muted-foreground">Días Media Ocupación</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(values.reduce((sum, v) => sum + (v.occupancyRate || 0), 0) / values.length || 0)}%
                </div>
                <div className="text-xs text-muted-foreground">Ocupación Promedio</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : values.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-lg font-medium">No hay datos de ocupación</p>
            <p className="text-sm">Crea reservas para ver el análisis</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={values}
              classForValue={classForValue}
              titleForValue={titleForValue}
              showMonthLabels={true}
              showWeekdayLabels={true}
              onClick={(value) => {
                if (value && onDateClick) {
                  onDateClick(new Date(value.date))
                }
              }}
            />
          </div>
        )}
      </CardContent>

      <style jsx global>{`
        .react-calendar-heatmap {
          width: 100%;
        }

        .react-calendar-heatmap .color-empty {
          fill: oklch(0.92 0.01 210);
          stroke: oklch(0.82 0.02 210);
          stroke-width: 1;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #9be9a8;
          stroke: #7dd3a0;
          stroke-width: 1;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #40c463;
          stroke: #30a855;
          stroke-width: 1;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #f59e0b;
          stroke: #d97706;
          stroke-width: 1;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #ef4444;
          stroke: #dc2626;
          stroke-width: 1;
        }

        .dark .react-calendar-heatmap .color-empty {
          fill: oklch(0.18 0.02 220);
          stroke: oklch(0.28 0.02 220);
          stroke-width: 1;
        }
        .dark .react-calendar-heatmap .color-scale-1 {
          fill: #0e4429;
          stroke: #1a5c3e;
          stroke-width: 1;
        }
        .dark .react-calendar-heatmap .color-scale-2 {
          fill: #006d32;
          stroke: #00844a;
          stroke-width: 1;
        }
        .dark .react-calendar-heatmap .color-scale-3 {
          fill: #92400e;
          stroke: #a85e1a;
          stroke-width: 1;
        }
        .dark .react-calendar-heatmap .color-scale-4 {
          fill: #991b1b;
          stroke: #b91c1c;
          stroke-width: 1;
        }

        .react-calendar-heatmap rect {
          rx: 2;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .react-calendar-heatmap rect:hover {
          stroke-width: 2;
          filter: brightness(1.1);
        }

        .react-calendar-heatmap text {
          fill: oklch(0.38 0.02 220);
          font-size: 10px;
        }

        .dark .react-calendar-heatmap text {
          fill: oklch(0.62 0.02 220);
        }
      `}</style>
    </Card>
  )
}
