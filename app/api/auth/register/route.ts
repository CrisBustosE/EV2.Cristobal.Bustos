import { prisma } from '@/lib/prisma'
import * as argon2 from 'argon2'

export async function POST(request: Request) {
  let body: { nombre?: string; correo?: string; clave?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { nombre, correo, clave } = body
  if (!nombre || !correo || !clave) {
    return Response.json({ error: 'nombre, correo y clave son requeridos' }, { status: 400 })
  }

  const existing = await prisma.usuario.findUnique({ where: { correo } })
  // 409 Conflict: Previene la creación de múltiples cuentas con el mismo correo,
  // evitando ataques de enumeración y colisiones en la base de datos.
  if (existing) {
    return Response.json({ error: 'Este correo ya se encuentra registrado.' }, { status: 409 })
  }

  // Argon2id es el estándar recomendado por OWASP por su alta resistencia a ataques por fuerza bruta utilizando GPUs.
  const hash = await argon2.hash(clave, { type: argon2.argon2id })
  await prisma.usuario.create({ data: { nombre, correo, clave: hash } })

  return Response.json({ message: 'Usuario creado' }, { status: 201 })
}
