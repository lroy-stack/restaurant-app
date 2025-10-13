import { NextRequest, NextResponse } from 'next/server'

/**
 * Instagram Thumbnail Extractor
 * Extrae la imagen de preview de un post de Instagram sin APIs
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  try {
    // Fetch HTML de Instagram
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    })

    const html = await response.text()

    // Extraer og:image meta tag
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
    let imageUrl = ogImageMatch?.[1]

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Decodificar HTML entities (&amp; -> &)
    imageUrl = imageUrl
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")

    return NextResponse.json({
      thumbnail: imageUrl,
      url
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800'
      }
    })

  } catch (error) {
    console.error('Error fetching Instagram thumbnail:', error)
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 })
  }
}
