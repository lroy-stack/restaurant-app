'use client'

import React from 'react'
import { NodeProps } from '@xyflow/react'
import { FloorPlanNode } from '../utils/elementTypes'

export const DoorElement = React.memo(function DoorElement({ data, selected }: NodeProps) {
  const { size = {}, style = {}, label, rotation = 0 } = data || {}

  return (
    <div
      className={`
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        border-2 flex items-center justify-center
        shadow-sm
        text-sm font-medium relative overflow-hidden
        cursor-move
      `}
      style={{
        width: (size as any)?.width || 80,
        height: (size as any)?.height || 20,
        backgroundColor: (style as any)?.backgroundColor || '#8B4513',
        borderColor: (style as any)?.borderColor || '#654321',
        borderRadius: (style as any)?.borderRadius || 4,
        transform: `rotate(${rotation}deg)`
      }}
      title={(label as string) || 'Puerta'}
    >
      {/* Door icon/pattern */}
      <div className="absolute inset-1 border border-current opacity-30 rounded" />
      <div className="text-white text-xs font-bold z-10">
        {(label as string) || 'Puerta'}
      </div>
    </div>
  )
})