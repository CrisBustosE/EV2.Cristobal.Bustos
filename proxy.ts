import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function proxy(request: NextRequest) {
  // Se utiliza 'jose' (estándar Web Crypto API) en lugar de 'jsonwebtoken' por decisión de diseño:
  // mantiene una única librería consistente para firmar y verificar, garantizando la portabilidad
  // del código si en el futuro la aplicación se despliega en un entorno Edge puro (ej. Cloudflare Workers).
  const token = request.cookies.get('token')?.value

  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    // Clonamos y reescribimos los headers de la request (en lugar de la response)
    // para inyectar el ID de usuario verificado. Así, los endpoints de la API confían plenamente en 'x-user-id'.
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub as string)
    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/api/proyectos/:path*', '/proyectos/:path*'],
}
