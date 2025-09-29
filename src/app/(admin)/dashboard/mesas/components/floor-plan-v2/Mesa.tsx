'use client'

import React, { useMemo, useCallback } from 'react'
import { Circle, Rect, Text, Group } from 'react-konva'
import { MesaProps, STATUS_COLORS, MesaShapeConfig } from './types/mesa.types'

const Mesa = React.memo(({
  mesa,
  onClick,
  scale,
  isSelected = false,
  onDragEnd,
  isDragEnabled = false
}: MesaProps) => {
  // PATTERN: All tables are square (2pax) or rectangle (4pax+) - NO CIRCLES
  const shapeType = 'rectangle' // All Enigma tables are square/rectangle

  // PERFORMANCE: Memoize expensive calculations
  const shapeConfig: MesaShapeConfig = useMemo(() => {
    const baseColor = STATUS_COLORS[mesa.currentStatus] || STATUS_COLORS.available
    const strokeColor = isSelected ? 'oklch(0.45 0.15 200)' : 'oklch(0.15 0.02 220)'
    const strokeWidth = isSelected ? 3 : (scale < 0.5 ? 4 : 2) // Touch-friendly on zoom out

    // ✅ MOBILE: Enhanced touch target calculation
    const minTouchTarget = Math.max(44 / scale, 60) // Never smaller than 60px

    // ENIGMA: Adjust dimensions based on capacity for visual consistency
    // 2 pax = square tables, 4+ pax = rectangular tables
    let width = Number(mesa.dimensions.width) || (mesa.capacity <= 2 ? 80 : 120)
    let height = Number(mesa.dimensions.height) || (mesa.capacity <= 2 ? 80 : 80)

    // ✅ Ensure generous touch targets for better responsiveness
    width = Math.max(width, minTouchTarget)
    height = Math.max(height, minTouchTarget)

    return {
      type: shapeType,
      fill: baseColor,
      stroke: strokeColor,
      strokeWidth,
      width,
      height,
      radius: shapeType === 'circle' ? width / 2 : undefined
    }
  }, [mesa, scale, isSelected, shapeType])

  // PERFORMANCE: Memoize text configuration
  const textConfig = useMemo(() => ({
    text: mesa.number,
    fontSize: Math.max(12 / scale, 8), // Scale-aware text with minimum size
    fontFamily: 'Inter, sans-serif',
    fill: 'oklch(0.15 0.02 220)', // Dark text from Enigma design tokens
    align: 'center' as const,
    verticalAlign: 'middle' as const,
    width: shapeConfig.width,
    height: shapeConfig.height,
    x: shapeConfig.x,
    y: shapeConfig.y,
    listening: false // Text doesn't need to listen to events
  }), [mesa.number, scale, shapeConfig])

  // ✅ Drag state and handlers - More permissive for testing
  const canDrag = isDragEnabled && mesa.isActive // Allow drag even with reservations for now

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!onDragEnd || !canDrag) return

    const newPosition = {
      x: Math.round(e.target.x()),
      y: Math.round(e.target.y())
    }

    console.log(`🚀 Mesa ${mesa.number} dragged to:`, newPosition)

    // ✅ CRITICAL FIX: NO position reset - Context7 best practice
    // Let parent handle DB update and position persistence
    // Visual position stays where user dragged until backend confirms
    onDragEnd(mesa, newPosition)
  }, [onDragEnd, canDrag, mesa])

  // Additional status indicator for reserved/occupied tables
  const statusIndicator = useMemo(() => {
    if (mesa.currentReservation && (mesa.currentStatus === 'reserved' || mesa.currentStatus === 'occupied')) {
      return {
        x: shapeConfig.width - 8,
        y: -8,
        radius: 6,
        fill: 'oklch(0.70 0.25 25)', // Bright indicator color
        stroke: 'oklch(0.95 0.02 220)', // White border
        strokeWidth: 2
      }
    }
    return null
  }, [mesa.currentReservation, mesa.currentStatus, shapeConfig])

  // ✅ CRITICAL: Non-strict mode pattern - Pass initial position to Group
  return (
    <Group
      x={mesa.position.x}
      y={mesa.position.y}
      _useStrictMode={false}
      onClick={() => onClick(mesa)}
      onTap={() => onClick(mesa)} // Mobile touch support
      // Drag functionality
      draggable={canDrag}
      onDragEnd={handleDragEnd}
      // ✅ CRITICAL: Always listen for events - no conditional listening
      listening={true}
      // Cursor feedback - show move cursor when draggable
      style={{
        cursor: canDrag ? 'move' : 'pointer'
      }}
      // Drag visual feedback
      onDragStart={() => {
        // Add slight opacity during drag
        if (canDrag) {
          // This will be handled by Konva automatically
        }
      }}
    >
      {/* Main table shape - Always rectangle/square for Enigma */}
      <Rect
        x={0}
        y={0}
        width={shapeConfig.width}
        height={shapeConfig.height}
        fill={shapeConfig.fill}
        stroke={shapeConfig.stroke}
        strokeWidth={shapeConfig.strokeWidth}
        cornerRadius={mesa.capacity <= 2 ? 4 : 8} // Smaller radius for square tables
        shadowColor="oklch(0.20 0.02 220)"
        shadowBlur={isSelected ? 10 : (canDrag ? 5 : 0)} // Show drag hint
        shadowOpacity={isSelected ? 0.3 : (canDrag ? 0.2 : 0)}
        opacity={mesa.isActive ? 1 : 0.5}
      />

      {/* Table number text */}
      <Text {...textConfig} />

      {/* Capacity indicator (small text below number) */}
      <Text
        text={`${mesa.capacity}p`}
        fontSize={Math.max(8 / scale, 6)}
        fontFamily="Inter, sans-serif"
        fill="oklch(0.38 0.02 220)" // Muted text color
        align="center"
        width={textConfig.width}
        x={0}
        y={textConfig.height * 0.3}
        listening={false}
      />

      {/* Status indicator dot for active reservations */}
      {statusIndicator && (
        <Circle
          x={statusIndicator.x}
          y={statusIndicator.y}
          radius={statusIndicator.radius}
          fill={statusIndicator.fill}
          stroke={statusIndicator.stroke}
          strokeWidth={statusIndicator.strokeWidth}
          listening={false}
        />
      )}

      {/* Inactive overlay for closed tables */}
      {!mesa.isActive && (
        <Rect
          x={shapeConfig.x}
          y={shapeConfig.y}
          width={shapeConfig.width}
          height={shapeConfig.height}
          fill="oklch(0.95 0.02 220)"
          opacity={0.8}
          listening={false}
        />
      )}
    </Group>
  )
})

Mesa.displayName = 'Mesa'

export default Mesa