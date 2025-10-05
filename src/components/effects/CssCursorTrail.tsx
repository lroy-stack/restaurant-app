'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  rotation: number
  rotationSpeed: number
}

export function CssCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const lastMousePos = useRef({ x: 0, y: 0 })
  const mouseVelocity = useRef({ vx: 0, vy: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Track mouse movement and velocity
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y

      mouseVelocity.current = {
        vx: dx * 0.5,
        vy: dy * 0.5
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY }

      // Create multiple particles per frame for denser trail
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2 + mouseVelocity.current.vx * 0.1,
          vy: (Math.random() - 0.5) * 2 + mouseVelocity.current.vy * 0.1,
          life: 1,
          maxLife: 0.8 + Math.random() * 0.4,
          size: 15 + Math.random() * 25,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1
        })
      }

      // Limit particles
      if (particlesRef.current.length > 150) {
        particlesRef.current = particlesRef.current.slice(-150)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update particle
        particle.life -= 0.015
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.95 // Friction
        particle.vy *= 0.95
        particle.rotation += particle.rotationSpeed

        // Expand size over time (smoke effect)
        const expansionFactor = 1 + (1 - particle.life) * 2

        if (particle.life <= 0) return false

        // Draw smoke particle with gradient
        const alpha = particle.life * 0.6
        const currentSize = particle.size * expansionFactor

        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)

        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize)

        // Atlantic blue with fade
        gradient.addColorStop(0, `rgba(26, 115, 232, ${alpha * 0.8})`)
        gradient.addColorStop(0.4, `rgba(26, 115, 232, ${alpha * 0.4})`)
        gradient.addColorStop(0.7, `rgba(26, 115, 232, ${alpha * 0.1})`)
        gradient.addColorStop(1, `rgba(26, 115, 232, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(-currentSize, -currentSize, currentSize * 2, currentSize * 2)

        ctx.restore()

        return true
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 hidden lg:block"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
