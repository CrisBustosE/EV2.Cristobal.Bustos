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
  if (existing) {
    return Response.json({ error: 'Correo ya registrado' }, { status: 409 })
  }

  const hash = await argon2.hash(clave, { type: argon2.argon2id })
  await prisma.usuario.create({ data: { nombre, correo, clave: hash } })

  return Response.json({ message: 'Usuario creado' }, { status: 201 })
}
