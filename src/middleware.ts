import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// URLs antiguas que deben retornar 410 Gone (no existen más)
const GONE_URLS = [
  '/pages/desserts.html',
  '/pages/drinks.html',
  '/pages/menu.html',
  '/pages/wine.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/menu.html',
  '/contacto.html',
  '/historia.html',
  '/galeria.html',
  '/reservas.html',
]

// Redirects de URLs antiguas a nuevas (si aplica)
const REDIRECTS: Record<string, string> = {
  '/menu.html': '/menu',
  '/contacto.html': '/contacto',
  '/historia.html': '/historia',
  '/galeria.html': '/galeria',
  '/reservas.html': '/reservas',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Páginas que NO existen más → 410 Gone
  if (GONE_URLS.includes(pathname)) {
    return new NextResponse(
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <title>410 Gone - Página no disponible</title>
</head>
<body>
  <h1>410 Gone</h1>
  <p>Esta página ya no está disponible y ha sido eliminada permanentemente.</p>
  <p><a href="/">Volver al inicio</a></p>
</body>
</html>
      `.trim(),
      {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    )
  }

  // 2. Redirects permanentes (301) para URLs que cambiaron
  if (REDIRECTS[pathname]) {
    return NextResponse.redirect(
      new URL(REDIRECTS[pathname], request.url),
      { status: 301 } // Permanent redirect
    )
  }

  // 3. Continuar con la request normal
  return NextResponse.next()
}

// Configurar rutas donde aplicar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
