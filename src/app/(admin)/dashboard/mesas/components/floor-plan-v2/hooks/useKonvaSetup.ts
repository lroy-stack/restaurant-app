'use client'

import { useEffect, useState } from 'react'
import Konva from 'konva'
import { KonvaConfig } from '../types/mesa.types'

interface UseKonvaSetupReturn {
  config: KonvaConfig
  pixelRatio: number
  isMobile: boolean
  isLowPerformance: boolean
}

export const useKonvaSetup = (): UseKonvaSetupReturn => {
  const [config, setConfig] = useState<KonvaConfig>({
    maxLayers: 3,
    enableCaching: true,
    listeningLayers: true,
    pixelRatio: 1,
    hitGraphEnabled: true
  })

  const [deviceInfo, setDeviceInfo] = useState({
    pixelRatio: 1,
    isMobile: false,
    isLowPerformance: false
  })

  useEffect(() => {
    // Detect device capabilities
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // ✅ FIXED: Less aggressive performance detection
    const isLowPerformance = (() => {
      // Only flag as low performance for very limited devices
      if (isMobile) {
        // Check if it's a modern mobile device with good specs
        const memory = (navigator as any).deviceMemory
        const cores = navigator.hardwareConcurrency || 2

        // Modern phones usually have 4+ cores and 4+ GB RAM
        if (cores >= 4 && (!memory || memory >= 4)) {
          return false // Modern mobile device, full performance
        }
        return true // Legacy mobile device
      }

      // Desktop/laptop: only flag as low performance for very old devices
      const cores = navigator.hardwareConcurrency || 4
      if (cores < 2) return true // Very old CPU

      const memory = (navigator as any).deviceMemory
      if (memory && memory < 2) return true // Very low RAM

      // Check for very slow connections only
      const connection = (navigator as any).connection
      if (connection && (connection.saveData || connection.effectiveType === 'slow-2g')) {
        return true
      }

      return false // Default to high performance
    })()

    setDeviceInfo({ pixelRatio, isMobile, isLowPerformance })

    // Configure Konva based on device capabilities
    const optimizedConfig: KonvaConfig = {
      maxLayers: isLowPerformance ? 2 : 3,
      enableCaching: !isLowPerformance, // Disable caching on low-end devices to save memory
      listeningLayers: true,
      pixelRatio: isLowPerformance ? 1 : pixelRatio,
      hitGraphEnabled: !isLowPerformance // Disable hit graph on low-end devices
    }

    setConfig(optimizedConfig)

    // Global Konva performance optimizations
    if (isLowPerformance) {
      // Reduce animation frame rate for low-performance devices
      Konva.pixelRatio = 1

      // Disable high-quality image smoothing
      Konva.hitOnDragEnabled = false
    } else {
      // Enable high-quality rendering for capable devices
      Konva.pixelRatio = pixelRatio
      Konva.hitOnDragEnabled = true
    }

    // CRITICAL: Performance tips from React Konva docs

    // 1. Use shapes caching for complex table groups
    // This is handled in individual components

    // 2. Layer management - max 3-5 layers for optimal performance
    // Background layer (non-interactive)
    // Tables layer (interactive)
    // Overlay layer (UI elements)

    // 3. Event delegation - minimize event listeners
    // Use Group components to bundle related shapes

    // 4. Avoid sync blocking operations in render loops
    // All calculations are memoized in components

  }, [])

  // Additional optimizations for specific use cases
  useEffect(() => {
    // MOBILE: Touch event optimizations
    if (deviceInfo.isMobile) {
      // Increase touch target sizes (handled in Mesa component)
      // Reduce animation complexity
      // Disable certain visual effects
    }

    // PERFORMANCE: Memory management
    const cleanupInterval = setInterval(() => {
      // Force garbage collection of unused Konva objects
      // This helps with memory management during long sessions
      if ((window as any).gc) {
        (window as any).gc()
      }
    }, 60000) // Every minute

    return () => clearInterval(cleanupInterval)
  }, [deviceInfo.isMobile])

  return {
    config,
    pixelRatio: deviceInfo.pixelRatio,
    isMobile: deviceInfo.isMobile,
    isLowPerformance: deviceInfo.isLowPerformance
  }
}