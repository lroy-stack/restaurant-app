'use client'

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { CardFooter } from "@/components/ui/card"

interface OccupancyData {
  zone: string
  available: number
  occupied: number
  reserved: number
}

interface TableOccupancyChartProps {
  data: OccupancyData[]
  loading?: boolean
}

const chartConfig = {
  available: {
    label: 'Disponibles',
    color: 'oklch(0.92 0.02 120)'  // Sage Green
  },
  occupied: {
    label: 'Ocupadas',
    color: 'oklch(0.45 0.15 200)'  // Atlantic Blue
  },
  reserved: {
    label: 'Reservadas',
    color: 'oklch(0.6 0.18 40)'    // Burnt Orange
  }
} satisfies ChartConfig

export function TableOccupancyChart({ data, loading = false }: TableOccupancyChartProps) {
  const totals = React.useMemo(() => {
    return data.reduce(
      (acc, zone) => ({
        available: acc.available + zone.available,
        occupied: acc.occupied + zone.occupied,
        reserved: acc.reserved + zone.reserved
      }),
      { available: 0, occupied: 0, reserved: 0 }
    )
  }, [data])

  const totalTables = totals.available + totals.occupied + totals.reserved
  const occupancyRate = totalTables > 0
    ? ((totals.occupied / totalTables) * 100).toFixed(1)
    : '0'

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Cargando datos...</div>
      </div>
    )
  }

  return (
    <>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="fillAvailable" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="5%"
                stopColor="var(--color-available)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-available)"
                stopOpacity={0.3}
              />
            </linearGradient>
            <linearGradient id="fillOccupied" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="5%"
                stopColor="var(--color-occupied)"
                stopOpacity={1}
              />
              <stop
                offset="95%"
                stopColor="var(--color-occupied)"
                stopOpacity={0.4}
              />
            </linearGradient>
            <linearGradient id="fillReserved" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="5%"
                stopColor="var(--color-reserved)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-reserved)"
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
          />
          <YAxis
            dataKey="zone"
            type="category"
            width={140}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.replace('Terraza ', 'T. ').replace('Sala ', 'S. ')}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) => `Zona: ${value}`}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="occupied"
            stackId="a"
            fill="url(#fillOccupied)"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="reserved"
            stackId="a"
            fill="url(#fillReserved)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="available"
            stackId="a"
            fill="url(#fillAvailable)"
            radius={[0, 0, 0, 0]}
          />
        </BarChart>
      </ChartContainer>

      {/* CardFooter con insights */}
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Ocupación actual del {occupancyRate}%
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="text-muted-foreground leading-none">
          {totals.occupied} mesas ocupadas · {totals.reserved} reservadas · {totals.available} disponibles
        </div>
      </CardFooter>
    </>
  )
}
