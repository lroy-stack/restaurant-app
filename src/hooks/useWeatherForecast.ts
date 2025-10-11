'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface WeatherData {
  current: {
    temp: number
    feelsLike: number
    humidity: number
    windSpeed: number
    description: string
    icon: string
    timestamp: string | Date
  }
  forecast: Array<{
    date: string | Date  // Puede venir como string desde la API
    tempMax: number
    tempMin: number
    description: string
    icon: string
    precipProbability: number
    windSpeed: number
  }>
  location: {
    name: string
    country: string
    lat: number
    lon: number
  }
}

interface WeatherConfig {
  lat?: number
  lon?: number
  city?: string
  units?: 'metric' | 'imperial'
  lang?: 'es' | 'en' | 'de'
  cacheTime?: number // minutos
}

const DEFAULT_CONFIG: WeatherConfig = {
  city: 'Calpe',
  lat: 38.6447,
  lon: 0.0445,
  units: 'metric',
  lang: 'es',
  cacheTime: 30 // Cache de 30 minutos
}

// Mapeo de iconos de clima a emojis (fallback cuando no hay API)
const weatherEmojis: Record<string, string> = {
  'clear': '☀️',
  'clouds': '☁️',
  'partly_cloudy': '⛅',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'fog': '🌁'
}

// Cache en memoria para reducir llamadas a API
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>()

export function useWeatherForecast(config: WeatherConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generar clave de cache única
  const cacheKey = `${finalConfig.city}-${finalConfig.lang}`

  // Función para obtener datos del tiempo simulados (fallback)
  const getSimulatedWeather = useCallback((): WeatherData => {
    const now = new Date()
    const forecast = []

    // Generar pronóstico para los próximos 5 días
    for (let i = 0; i < 5; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)

      // Variación realista de temperatura según la época del año
      const month = date.getMonth()
      let baseTemp = 20

      // Ajuste estacional para Calpe
      if (month >= 5 && month <= 8) { // Verano
        baseTemp = 25 + Math.random() * 5
      } else if (month >= 11 || month <= 2) { // Invierno
        baseTemp = 12 + Math.random() * 6
      } else { // Primavera/Otoño
        baseTemp = 18 + Math.random() * 5
      }

      forecast.push({
        date: date.toISOString(), // Convertir a string ISO
        tempMax: Math.round(baseTemp + 3),
        tempMin: Math.round(baseTemp - 3),
        description: i === 0 ? 'Soleado' :
                     i === 1 ? 'Parcialmente nublado' :
                     i === 2 ? 'Nublado' :
                     i === 3 ? 'Soleado' : 'Parcialmente nublado',
        icon: i === 0 ? '☀️' :
              i === 1 ? '⛅' :
              i === 2 ? '☁️' :
              i === 3 ? '☀️' : '⛅',
        precipProbability: Math.random() * 30,
        windSpeed: 8 + Math.random() * 15
      })
    }

    return {
      current: {
        temp: Math.round(forecast[0].tempMax - 2),
        feelsLike: Math.round(forecast[0].tempMax - 3),
        humidity: 45 + Math.random() * 30,
        windSpeed: 12 + Math.random() * 10,
        description: 'Soleado con brisa marina',
        icon: '☀️',
        timestamp: now
      },
      forecast,
      location: {
        name: finalConfig.city || 'Calpe',
        country: 'España',
        lat: finalConfig.lat || 38.6447,
        lon: finalConfig.lon || 0.0445
      }
    }
  }, [finalConfig.city, finalConfig.lat, finalConfig.lon])

  // Función para obtener datos reales del tiempo
  const fetchWeatherData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Verificar cache
      const cached = weatherCache.get(cacheKey)
      if (cached) {
        const cacheAge = (Date.now() - cached.timestamp) / 1000 / 60 // minutos
        if (cacheAge < (finalConfig.cacheTime || 30)) {
          setWeather(cached.data)
          setIsLoading(false)
          return
        }
      }

      // Intentar obtener datos de la API
      // En producción, esto llamaría a tu endpoint backend
      const response = await fetch('/api/weather/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: finalConfig.lat,
          lon: finalConfig.lon,
          city: finalConfig.city,
          units: finalConfig.units,
          lang: finalConfig.lang
        })
      })

      if (!response.ok) {
        throw new Error('Weather API not available')
      }

      const data = await response.json()

      // Guardar en cache
      weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })

      setWeather(data)
    } catch (err) {
      console.log('Weather API not available, using simulated data')
      // Usar datos simulados como fallback
      const simulatedData = getSimulatedWeather()

      // Guardar simulación en cache también
      weatherCache.set(cacheKey, {
        data: simulatedData,
        timestamp: Date.now()
      })

      setWeather(simulatedData)
    } finally {
      setIsLoading(false)
    }
  }, [cacheKey, finalConfig, getSimulatedWeather])

  // Función para refrescar datos
  const refresh = useCallback(() => {
    // Limpiar cache para forzar nueva petición
    weatherCache.delete(cacheKey)
    fetchWeatherData()
  }, [cacheKey, fetchWeatherData])

  // Función para obtener recomendación según el clima
  const getWeatherRecommendation = useCallback((date: Date): string => {
    if (!weather) return ''

    const forecast = weather.forecast.find(f => {
      const forecastDate = typeof f.date === 'string' ? new Date(f.date) : f.date
      const targetDate = typeof date === 'string' ? new Date(date) : date
      return forecastDate.toDateString() === targetDate.toDateString()
    })

    if (!forecast) return ''

    if (forecast.precipProbability > 60) {
      return '🌧️ Probabilidad de lluvia - Recomendamos mesa interior'
    } else if (forecast.tempMax > 30) {
      return '☀️ Día caluroso - Mesa en terraza con sombra disponible'
    } else if (forecast.tempMax < 15) {
      return '❄️ Día fresco - Calefacción disponible en interior'
    } else if (forecast.windSpeed > 25) {
      return '💨 Viento fuerte - Mejor opción en interior'
    } else {
      return '✨ Condiciones perfectas para terraza'
    }
  }, [weather])

  // Función para obtener icono de clima para una fecha específica
  const getWeatherForDate = useCallback((date: Date) => {
    if (!weather) return null

    const forecast = weather.forecast.find(f => {
      const forecastDate = typeof f.date === 'string' ? new Date(f.date) : f.date
      const targetDate = typeof date === 'string' ? new Date(date) : date
      return forecastDate.toDateString() === targetDate.toDateString()
    })

    return forecast || null
  }, [weather])

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchWeatherData()
  }, []) // Solo ejecutar una vez al montar

  // Actualización automática cada 30 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeatherData()
    }, (finalConfig.cacheTime || 30) * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchWeatherData, finalConfig.cacheTime])

  return {
    weather,
    isLoading,
    error,
    refresh,
    getWeatherRecommendation,
    getWeatherForDate,
    // Funciones de utilidad adicionales
    formatTemp: (temp: number) => `${Math.round(temp)}°${finalConfig.units === 'imperial' ? 'F' : 'C'}`,
    formatWind: (speed: number) => `${Math.round(speed)} ${finalConfig.units === 'imperial' ? 'mph' : 'km/h'}`,
    isGoodWeather: (date: Date) => {
      const targetDate = typeof date === 'string' ? new Date(date) : date
      const forecast = getWeatherForDate(targetDate)
      return forecast ? forecast.precipProbability < 30 && forecast.tempMax < 35 : true
    }
  }
}