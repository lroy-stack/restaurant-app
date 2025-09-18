'use client'

import React from 'react'
import { NodeProps } from '@xyflow/react'
import { FloorPlanNode } from '../utils/elementTypes'

export function PlantElement({ data, selected }: NodeProps) {
  const { size = {}, style = {}, label, rotation = 0 } = data || {}

  return (
    <div
      className={`
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        border-2 flex items-center justify-center
        shadow-sm hover:shadow-lg hover:scale-105
        transition-all duration-300 ease-in-out
        text-xs font-medium relative overflow-hidden
        cursor-move
      `}
      style={{
        width: (size as any)?.width || 50,
        height: (size as any)?.height || 50,
        backgroundColor: (style as any)?.backgroundColor || '#90EE90',
        borderColor: (style as any)?.borderColor || '#228B22',
        borderRadius: (style as any)?.borderRadius || 25,
        opacity: (style as any)?.opacity || 0.9,
        transform: `rotate(${rotation}deg)`
      }}
      title={(label as string) || 'Planta'}
    >
      {/* Plant leaves pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-green-800 text-lg">🌿</div>
      </div>

      {/* Label if space allows */}
      {((size as any)?.width || 50) > 40 && (
        <div className="absolute bottom-0 text-green-800 text-xs font-bold z-10">
          {(label as string) || 'Planta'}
        </div>
      )}
    </div>
  )
}