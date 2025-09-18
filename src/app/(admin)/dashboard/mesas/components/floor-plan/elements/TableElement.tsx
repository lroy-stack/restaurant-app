'use client'

import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Badge } from '@/components/ui/badge'
import { FloorPlanNode } from '../utils/elementTypes'

// Status colors con contraste legible
const STATUS_COLORS = {
  available: 'bg-green-100 border-green-300 text-green-800 dark:bg-slate-700 dark:border-slate-500 dark:text-white',
  reserved: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-600 dark:border-amber-400 dark:text-white',
  occupied: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-600 dark:border-red-400 dark:text-white',
  maintenance: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-600 dark:border-gray-400 dark:text-white'
}

// Zone-based accent colors optimized for dark mode
const ZONE_ACCENTS = {
  'TERRACE_CAMPANARI': 'border-l-4 border-l-orange-400 dark:border-l-orange-400',
  'SALA_PRINCIPAL': 'border-l-4 border-l-blue-400 dark:border-l-blue-400',
  'SALA_VIP': 'border-l-4 border-l-purple-400 dark:border-l-purple-400',
  'TERRACE_JUSTICIA': 'border-l-4 border-l-amber-400 dark:border-l-amber-400'
}

function getTableShape(capacity: number): {
  shape: 'square' | 'rectangle' | 'circle' | 'oval',
  aspectRatio: string,
  iconShape: string
} {
  if (capacity <= 2) {
    return {
      shape: 'square',
      aspectRatio: 'aspect-square',
      iconShape: 'rounded-lg'
    }
  } else if (capacity <= 4) {
    return {
      shape: 'rectangle',
      aspectRatio: 'aspect-[3/2]',
      iconShape: 'rounded-md'
    }
  } else if (capacity <= 6) {
    return {
      shape: 'oval',
      aspectRatio: 'aspect-[2/1]',
      iconShape: 'rounded-full'
    }
  } else {
    return {
      shape: 'circle',
      aspectRatio: 'aspect-square',
      iconShape: 'rounded-full'
    }
  }
}

export const TableElement = React.memo(function TableElement({ data, selected }: NodeProps) {
  const {
    size = {},
    style = {},
    label,
    number,
    capacity = 4,
    location,
    currentStatus = 'available',
    isActive = true
  } = data || {}

  const statusColor = STATUS_COLORS[currentStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS.available
  const tableShape = getTableShape((capacity as number) || 4)
  const zoneAccent = ZONE_ACCENTS[location as keyof typeof ZONE_ACCENTS] || ''

  // Special styling for inactive tables optimized for dark mode
  const inactiveStyles = !isActive
    ? 'opacity-70 border-dashed bg-gray-50 border-gray-400 text-gray-600 cursor-not-allowed dark:bg-gray-700/60 dark:border-gray-500 dark:text-gray-300'
    : ''

  return (
    <div
      className={`
        ${isActive ? statusColor : inactiveStyles}
        ${tableShape.iconShape}
        ${zoneAccent}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-blue-400 dark:ring-offset-gray-800' : ''}
        border-2 p-3 h-full w-full
        ${isActive ? 'cursor-move' : 'cursor-not-allowed'}
        flex flex-col items-center justify-center
        shadow-sm
        text-sm font-medium relative overflow-hidden
      `}
      style={{
        width: (size as any)?.width || 120,
        height: (size as any)?.height || 80,
        transform: `rotate(${(data as any)?.rotation || 0}deg)`
      }}
      title={`Mesa ${number} - ${capacity} personas - ${location}`}
    >
      {/* Handles for connections (hidden by default) */}
      <Handle
        type="source"
        position={Position.Top}
        className="opacity-0 hover:opacity-100 transition-opacity"
        style={{ width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="opacity-0 hover:opacity-100 transition-opacity"
        style={{ width: 8, height: 8 }}
      />


      {/* Table number with modern typography */}
      <div className="text-xl font-bold tracking-wider relative z-10">
        {(number as string) || (label as string)}
      </div>

      {/* Capacity with shape indicator */}
      <div className="text-xs opacity-75 relative z-10 flex items-center gap-1">
        <div className={`w-2 h-2 ${tableShape.iconShape} bg-current opacity-50`} />
        {(capacity as number) || 4}p
      </div>

      {/* Status badge with modern styling */}
      <Badge
        variant={isActive ? "secondary" : "outline"}
        className="text-xs mt-1 relative z-10"
      >
        {!isActive ? 'Cerrada' :
         currentStatus === 'available' ? 'Libre' :
         currentStatus === 'reserved' ? 'Reservada' :
         currentStatus === 'occupied' ? 'Ocupada' :
         'Mantenimiento'}
      </Badge>

      {/* Subtle zone indicator */}
      <div className="absolute bottom-1 right-1 text-xs opacity-30 font-mono">
        {(location as string)?.split('_')[1]?.[0] || 'E'}
      </div>

      {/* Rotation indicator when rotated */}
      {(data as any)?.rotation && (data as any)?.rotation !== 0 && (
        <div className="absolute top-1 right-1 text-xs opacity-50">
          ↻{Math.round((data as any)?.rotation)}°
        </div>
      )}
    </div>
  )
})