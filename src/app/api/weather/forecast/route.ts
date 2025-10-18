import { NextRequest, NextResponse } from 'next/server'

// Cache de datos del tiempo (30 minutos)
const weatherCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

interface WeatherRequest {
  lat?: number
  lon?: number
  city?: string
  units?: 'metric' | 'imperial'
  lang?: 'es' | 'en' | 'de'
}

// Datos simulados del tiempo para Calpe (mientras no tengamos API key)
function generateMockWeatherData(request: WeatherRequest) {
  const now = new Date()
  const forecast = []

  // Generar pronóstico para los próximos 5 días
  for (let i = 0; i < 5; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)

    // Variación realista de temperatura según la época del año
    const month = date.getMonth()
    let baseTemp = 20

    // Ajuste estacional para Calpe (Costa mediterránea española)
    if (month >= 5 && month <= 8) { // Verano
      baseTemp = 25 + Math.random() * 5
    } else if (month >= 11 || month <= 2) { // Invierno
      baseTemp = 12 + Math.random() * 6
    } else { // Primavera/Otoño
      baseTemp = 18 + Math.random() * 5
    }

    // Variación de condiciones climáticas
    const weatherConditions = [
      { description: 'Soleado', icon: '☀️', precipProbability: 0 },
      { description: 'Parcialmente nublado', icon: '⛅', precipProbability: 10 },
      { description: 'Nublado', icon: '☁️', precipProbability: 20 },
      { description: 'Lluvioso', icon: '🌧️', precipProbability: 70 }
    ]

    // En verano, menos probabilidad de lluvia
    const condition = month >= 5 && month <= 8 ?
      weatherConditions[Math.floor(Math.random() * 2)] : // Solo sol o parcialmente nublado
      weatherConditions[Math.floor(Math.random() * weatherConditions.length)]

    forecast.push({
      date: date.toISOString(),
      tempMax: Math.round(baseTemp + 3),
      tempMin: Math.round(baseTemp - 3),
      description: condition.description,
      icon: condition.icon,
      precipProbability: condition.precipProbability,
      windSpeed: 8 + Math.random() * 15
    })
  }

  return {
    current: {
      temp: Math.round(forecast[0].tempMax - 2),
      feelsLike: Math.round(forecast[0].tempMax - 3),
      humidity: 45 + Math.random() * 30,
      windSpeed: 12 + Math.random() * 10,
      description: forecast[0].description,
      icon: forecast[0].icon,
      timestamp: now.toISOString()
    },
    forecast,
    location: {
      name: request.city || 'Calpe',
      country: 'España',
      lat: request.lat || 38.6447,
      lon: request.lon || 0.0445
    }
  }
}

// Función para obtener datos reales del tiempo (cuando tengamos API key)
async function fetchRealWeatherData(request: WeatherRequest) {
  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

  if (!OPENWEATHER_API_KEY) {
    // Si no hay API key, devolver datos simulados
    return generateMockWeatherData(request)
  }

  try {
    // Construir URL de la API
    const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast'
    const params = new URLSearchParams({
      lat: String(request.lat || 38.6447),
      lon: String(request.lon || 0.0445),
      units: request.units || 'metric',
      lang: request.lang || 'es',
      appid: OPENWEATHER_API_KEY
    })

    const response = await fetch(`${baseUrl}?${params}`, {
      next: { revalidate: 1800 } // Cache de 30 minutos
    })

    if (!response.ok) {
      throw new Error('Weather API error')
    }

    const data = await response.json()

    // Agrupar por día único (OpenWeather devuelve datos cada 3h)
    const dailyForecasts = new Map<string, any[]>()

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000)
      const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      if (!dailyForecasts.has(dayKey)) {
        dailyForecasts.set(dayKey, [])
      }
      dailyForecasts.get(dayKey)!.push(item)
    })

    // Tomar primeros 5 días únicos
    const forecast = Array.from(dailyForecasts.entries())
      .slice(0, 5)
      .map(([dayKey, dayItems]) => {
        // Tomar el pronóstico del mediodía (más representativo)
        const middayItem = dayItems.find((item: any) => {
          const hour = new Date(item.dt * 1000).getHours()
          return hour >= 12 && hour <= 15
        }) || dayItems[Math.floor(dayItems.length / 2)] // Fallback al item del medio

        // Calcular temp máxima/mínima del día
        const temps = dayItems.map((i: any) => i.main.temp)
        const tempMax = Math.round(Math.max(...temps))
        const tempMin = Math.round(Math.min(...temps))

        return {
          date: new Date(dayKey).toISOString(),
          tempMax,
          tempMin,
          description: middayItem.weather[0].description,
          icon: getEmojiIcon(middayItem.weather[0].icon),
          precipProbability: Math.round((middayItem.pop || 0) * 100),
          windSpeed: Math.round(middayItem.wind.speed * 3.6)
        }
      })

    return {
      current: {
        temp: Math.round(data.list[0].main.temp),
        feelsLike: Math.round(data.list[0].main.feels_like),
        humidity: data.list[0].main.humidity,
        windSpeed: data.list[0].wind.speed * 3.6,
        description: data.list[0].weather[0].description,
        icon: getEmojiIcon(data.list[0].weather[0].icon),
        timestamp: new Date().toISOString()
      },
      forecast,
      location: {
        name: data.city.name,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon
      }
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    // Fallback a datos simulados
    return generateMockWeatherData(request)
  }
}

// Función para convertir iconos de OpenWeather a emojis
function getEmojiIcon(iconCode: string): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  }
  return iconMap[iconCode] || '☀️'
}

export async function POST(request: NextRequest) {
  try {
    const body: WeatherRequest = await request.json()

    // Generar clave de cache
    const cacheKey = `${body.city || 'Calpe'}-${body.lang || 'es'}`

    // Verificar cache
    const cached = weatherCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Obtener datos del tiempo (reales o simulados)
    const weatherData = await fetchRealWeatherData(body)

    // Guardar en cache
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    })

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Error in weather API:', error)
    // En caso de error, devolver datos simulados
    return NextResponse.json(generateMockWeatherData({}))
  }
}

// Endpoint GET para pruebas
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const requestData: WeatherRequest = {
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lon: searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined,
    city: searchParams.get('city') || 'Calpe',
    units: (searchParams.get('units') as 'metric' | 'imperial') || 'metric',
    lang: (searchParams.get('lang') as 'es' | 'en' | 'de') || 'es'
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(requestData)
  }))
}