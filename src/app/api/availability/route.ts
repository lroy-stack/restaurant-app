import { NextRequest, NextResponse } from 'next/server'

// Backward compatibility proxy to /api/tables/availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Transform old dateTime format to new date/time format if needed
    if (body.dateTime && !body.date && !body.time) {
      const [date, time] = body.dateTime.split('T')
      body.date = date
      body.time = time?.slice(0, 5) || '19:00'
      delete body.dateTime
    }
    
    // Transform preferredLocation to tableZone if needed
    if (body.preferredLocation && !body.tableZone) {
      body.tableZone = body.preferredLocation
      delete body.preferredLocation
    }
    
    // Create new request for the actual availability endpoint
    const newRequest = new NextRequest(request.url.replace('/api/availability', '/api/tables/availability'), {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body)
    })
    
    // Import and call the actual handler
    const { POST: actualHandler } = await import('../tables/availability/route')
    return actualHandler(newRequest)
    
  } catch (error) {
    console.error('Error in availability proxy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'PROXY_ERROR',
        message: 'Error al procesar la solicitud de disponibilidad',
        messageEn: 'Error processing availability request'
      },
      { status: 500 }
    )
  }
}

// Also support GET method
export async function GET(request: NextRequest) {
  // Import and call the actual handler
  const { GET: actualHandler } = await import('../tables/availability/route')
  return actualHandler(request)
}