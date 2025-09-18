'use client'

import React from 'react'
import { NodeProps } from '@xyflow/react'
import { FloorPlanNode } from '../utils/elementTypes'

export function BarElement({ data, selected }: NodeProps) {
  const { size = {}, style = {}, label, rotation = 0 } = data || {}

  return (
    <div
      className={`
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        border-2 flex items-center justify-center
        shadow-md hover:shadow-lg hover:scale-105
        transition-all duration-300 ease-in-out
        text-sm font-bold relative overflow-hidden
        cursor-move
      `}
      style={{
        width: (size as any)?.width || 200,
        height: (size as any)?.height || 60,
        backgroundColor: (style as any)?.backgroundColor || '#8B4513',
        borderColor: (style as any)?.borderColor || '#654321',
        borderRadius: (style as any)?.borderRadius || 6,
        transform: `rotate(${rotation}deg)`
      }}
      title={(label as string) || 'Barra'}
    >
      {/* Bar pattern */}
      <div className="absolute inset-2 border-t-2 border-current opacity-40" />
      <div className="absolute bottom-2 left-2 right-2 h-1 bg-current opacity-30 rounded" />

      <div className="text-white z-10">
        {(label as string) || 'Barra'}
      </div>
    </div>
  )
}