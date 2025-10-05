'use client'

import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface ParticleSystemProps {
  count: number
}

// PATTERN: Reuse objects outside component to avoid GC pressure
const tempColor = new THREE.Color()

function ParticleSystem({ count }: ParticleSystemProps) {
  const points = useRef<THREE.Points>(null)
  const positions = useRef(new Float32Array(count * 3))
  const velocities = useRef(new Float32Array(count * 3))
  const mousePos = useRef({ x: 0, y: 0 })
  const particleIndex = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 range
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (!points.current) return

    const positionsArray = points.current.geometry.attributes.position.array as Float32Array

    // Add new particle at cursor position
    const idx = particleIndex.current * 3
    positionsArray[idx] = mousePos.current.x * 10
    positionsArray[idx + 1] = mousePos.current.y * 10
    positionsArray[idx + 2] = 0

    // Random velocity for organic movement
    velocities.current[idx] = (Math.random() - 0.5) * 0.02
    velocities.current[idx + 1] = Math.random() * 0.05
    velocities.current[idx + 2] = (Math.random() - 0.5) * 0.02

    particleIndex.current = (particleIndex.current + 1) % count

    // Update all particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positionsArray[i3] += velocities.current[i3]
      positionsArray[i3 + 1] += velocities.current[i3 + 1]
      positionsArray[i3 + 2] += velocities.current[i3 + 2]

      // Fade out over time
      velocities.current[i3 + 1] += 0.001
    }

    points.current.geometry.attributes.position.needsUpdate = true
  })

  // OKLCH primary color: oklch(0.45 0.15 200) ≈ #1a73e8
  // Convert to hex for Three.js compatibility
  tempColor.setStyle('#1a73e8')

  return (
    <Points ref={points} positions={positions.current} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={tempColor}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export default function SmokeCursorTrail() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        dpr={[1, 2]} // Adaptive pixel ratio for performance
        gl={{ alpha: true, antialias: false }} // Transparent canvas, disable AA for perf
      >
        <ParticleSystem count={100} />
      </Canvas>
    </div>
  )
}
