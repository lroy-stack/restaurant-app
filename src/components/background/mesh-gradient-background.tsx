'use client'

import { memo } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'
import { useMeshGradientColors } from '@/hooks/use-mesh-gradient-colors'
import { cn } from '@/lib/utils'

interface MeshGradientBackgroundProps {
  className?: string
  opacity?: number
  speed?: number
  distortion?: number
  swirl?: number
}

/**
 * MeshGradientBackground Component
 *
 * Animated background gradient using Paper Design shaders with Enigma brand colors.
 * Optimized for performance with fixed positioning and WebGL acceleration.
 *
 * Features:
 * - Dynamic theme-aware color palette (reads CSS variables)
 * - Fixed positioning behind all content (z-index: -10)
 * - Responsive fullscreen coverage
 * - Optimized animation parameters for smooth performance
 * - Theme-compatible opacity control
 * - Automatic color updates when theme changes
 */
export const MeshGradientBackground = memo(function MeshGradientBackground({
  className,
  opacity = 1,
  speed = 0.2,
  distortion = 0.95,
  swirl = 0.25
}: MeshGradientBackgroundProps) {
  const { color1, color2, isLoaded } = useMeshGradientColors()
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden",
        className
      )}
      style={{ opacity }}
    >
      <MeshGradient
        width="100vw"
        height="100vh"
        colors={[color1, color2]}
        distortion={distortion}
        swirl={swirl}
        offsetX={-0.22}
        offsetY={0}
        scale={0.76}
        rotation={104}
        speed={speed}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  )
})

/**
 * Enhanced version with theme-aware opacity
 * Automatically adjusts opacity based on current theme
 */
export const ThemeAwareMeshGradient = memo(function ThemeAwareMeshGradient({
  className,
  lightOpacity = 0.95,
  darkOpacity = 0.4,
  ...props
}: MeshGradientBackgroundProps & {
  lightOpacity?: number
  darkOpacity?: number
}) {
  return (
    <>
      {/* Light theme gradient */}
      <MeshGradientBackground
        className={cn("dark:hidden", className)}
        opacity={lightOpacity}
        {...props}
      />

      {/* Dark theme gradient - more subtle */}
      <MeshGradientBackground
        className={cn("hidden dark:block", className)}
        opacity={darkOpacity}
        speed={props.speed ? props.speed * 0.7 : 0.7}
        {...props}
      />
    </>
  )
})

MeshGradientBackground.displayName = 'MeshGradientBackground'
ThemeAwareMeshGradient.displayName = 'ThemeAwareMeshGradient'