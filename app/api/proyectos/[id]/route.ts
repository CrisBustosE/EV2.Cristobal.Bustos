import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

type Params = { params: Promise<{ id: string }> }

// Validación estricta de pertenencia (created_by === userId) en todas las operaciones CRUD.
// Esto mitiga vulnerabilidades IDOR (Insecure Direct Object Reference) asegurando que
// un usuario no pueda acceder, modificar o eliminar proyectos de terceros alterando la URL.
async function getOwned(id: number, userId: number) {
  return prisma.proyecto.findFirst({ where: { id, created_by: userId } })
}

export async function GET(request: NextRequest, { params }: Params) {
  const userId = Number(request.headers.get('x-user-id'))
  const { id } = await params

  const proyecto = await getOwned(Number(id), userId)
  if (!proyecto) return Response.json({ error: 'No encontrado' }, { status: 404 })

  return Response.json(proyecto)
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = Number(request.headers.get('x-user-id'))
  const { id } = await params

  const existing = await getOwned(Number(id), userId)
  if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })

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

  const updated = await prisma.proyecto.update({
    where: { id: Number(id) },
    data: {
      nombre,
      fecha_de_inicio: new Date(fecha_de_inicio),
      estado,
      responsable,
      monto,
    },
  })

  return Response.json(updated)
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = Number(request.headers.get('x-user-id'))
  const { id } = await params

  const existing = await getOwned(Number(id), userId)
  if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })

  await prisma.proyecto.delete({ where: { id: Number(id) } })

  return Response.json({ message: 'Proyecto eliminado' })
}
