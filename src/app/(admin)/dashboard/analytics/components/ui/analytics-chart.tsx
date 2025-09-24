'use client'

import React from 'react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnalyticsChartProps {
  title: string
  data: Record<string, unknown>[]
  dataKey: string
  className?: string
  type?: 'line' | 'area' | 'bar' | 'pie'
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  color?: string
  secondaryDataKey?: string
  secondaryColor?: string
  formatValue?: (value: number | string) => string
  loading?: boolean
}

const ENIGMA_CHART_COLORS = {
  primary: 'hsl(var(--primary))',           // Atlantic Blue
  secondary: 'hsl(var(--secondary))',       // Sage Green
  accent: 'hsl(var(--accent))',             // Burnt Orange
  muted: 'hsl(var(--muted-foreground))',   // Muted text
  destructive: 'hsl(var(--destructive))',  // Error red
} as const

export function AnalyticsChart({
  title,
  data,
  dataKey,
  className,
  type = 'line',
  height = 300,
  showGrid = true,
  showLegend = false,
  color = ENIGMA_CHART_COLORS.primary,
  secondaryDataKey,
  secondaryColor = ENIGMA_CHART_COLORS.secondary,
  formatValue = (value) => value.toString(),
  loading = false
}: AnalyticsChartProps) {

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                📊
              </div>
              <p className="text-sm">No hay datos disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 20, left: 10, bottom: 5 }
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
            )}
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [formatValue(value), dataKey]}
            />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {secondaryDataKey && (
              <Area
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={secondaryColor}
                fill={secondaryColor}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [formatValue(value), dataKey]}
            />
            {showLegend && <Legend />}
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
            />
            {secondaryDataKey && (
              <Bar
                dataKey={secondaryDataKey}
                fill={secondaryColor}
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.3, 100)}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill || Object.values(ENIGMA_CHART_COLORS)[index % Object.values(ENIGMA_CHART_COLORS).length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [formatValue(value), dataKey]}
            />
            {showLegend && <Legend />}
          </PieChart>
        )

      default: // line
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
            )}
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [formatValue(value), dataKey]}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
            {secondaryDataKey && (
              <Line
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={secondaryColor}
                strokeWidth={2}
                dot={{ fill: secondaryColor, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
              />
            )}
          </LineChart>
        )
    }
  }

  return (
    <Card className={cn('w-full transition-all hover:shadow-md', className)}>
      <CardHeader>
        <CardTitle className="enigma-subsection-title">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}