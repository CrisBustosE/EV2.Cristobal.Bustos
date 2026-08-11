import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// placeholder: JWT verification implemented in proxy.ts (block 3)
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/proyectos/:path*', '/proyectos/:path*'],
}
