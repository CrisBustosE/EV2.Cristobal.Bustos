import { prisma } from '@/lib/prisma'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request: Request) {
  let body: { correo?: string; clave?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { correo, clave } = body
  if (!correo || !clave) {
    return Response.json({ error: 'correo y clave son requeridos' }, { status: 400 })
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo } })
  // Se utiliza un mensaje genérico ("Credenciales inválidas") tanto para correo inexistente
  // como para clave incorrecta. Esto previene ataques de enumeración de usuarios.
  if (!usuario) {
    return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const valid = await argon2.verify(usuario.clave, clave)
  if (!valid) {
    return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  // La firma del JWT con expiración de 24h minimiza la ventana de riesgo si el token es comprometido.
  const token = await new SignJWT({ sub: String(usuario.id), correo: usuario.correo })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  const isProd = process.env.NODE_ENV === 'production'

  return new Response(JSON.stringify({ message: 'Login exitoso' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // HttpOnly evita ataques XSS al hacer que el token sea inaccesible vía JavaScript del navegador.
      // SameSite=Lax protege contra ataques de falsificación de petición (CSRF).
      'Set-Cookie': `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${isProd ? '; Secure' : ''}`,
    },
  })
}
