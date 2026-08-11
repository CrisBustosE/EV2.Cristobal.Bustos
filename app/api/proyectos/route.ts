import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = Number(request.headers.get('x-user-id'))

  const proyectos = await prisma.proyecto.findMany({
    where: { created_by: userId },
  })

  return Response.json(proyectos)
}

export async function POST(request: NextRequest) {
  const userId = Number(request.headers.get('x-user-id'))

  let body: {
    nombre?: string
    fecha_de_inicio?: string
    estado?: string
    responsable?: string
    monto?: number
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { nombre, fecha_de_inicio, estado, responsable, monto } = body
  if (!nombre || !fecha_de_inicio || !estado || !responsable || monto === undefined) {
    return Response.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre,
      fecha_de_inicio: new Date(fecha_de_inicio),
      estado,
      responsable,
      monto,
      created_by: userId,
    },
  })

  return Response.json(proyecto, { status: 201 })
}
