'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { decode } from 'blurhash'
import { Loader2 } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  blurhash?: string
  className?: string
  aspectRatio?: string
  priority?: boolean
}

export function LazyImage({
  src,
  alt,
  blurhash,
  className = '',
  aspectRatio = '1/1',
  priority = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // If priority, load immediately
  const imgRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' } // Start loading 50px before entering viewport
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [priority])

  // Render blurhash placeholder
  useEffect(() => {
    if (!blurhash || !canvasRef.current || isLoaded) return

    try {
      const pixels = decode(blurhash, 32, 32)
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const imageData = ctx.createImageData(32, 32)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
    } catch (error) {
      console.error('Failed to decode blurhash:', error)
    }
  }, [blurhash, isLoaded])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Blurhash canvas (background) */}
      {blurhash && !isLoaded && (
        <canvas
          ref={canvasRef}
          width={32}
          height={32}
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Loading spinner (only show if no blurhash) */}
      {!blurhash && !isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        </div>
      )}
    </div>
  )
}
