'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { useRestaurant } from '@/hooks/use-restaurant'

const CALPE_COORDS: [number, number] = [38.645236, 0.044222] // J2WV+2M Calpe - Carrer Justicia 6A

export function RestaurantMap() {
  const { restaurant } = useRestaurant()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure we're in the client
    setIsClient(true)

    // Fix for default markers in Next.js - Enterprise pattern
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })
    }
  }, [])

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg overflow-hidden">
      <MapContainer
        center={CALPE_COORDS}
        zoom={17}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={CALPE_COORDS}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-semibold">{restaurant?.name}</h3>
              <p className="text-sm">{restaurant?.address}</p>
              <p className="text-xs text-muted-foreground mt-1">{restaurant?.awards}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}