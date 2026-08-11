'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const nombre = (form.elements.namedItem('nombre') as HTMLInputElement).value
    const correo = (form.elements.namedItem('correo') as HTMLInputElement).value
    const clave  = (form.elements.namedItem('clave')  as HTMLInputElement).value

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, clave }),
    })

    setLoading(false)

    if (res.status === 201) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al registrarse')
    }
  }

  return (
    <div className="ts-auth-wrapper">
      {/* Panel izquierdo — branding */}
      <div className="ts-auth-brand">
        <span className="ts-brand-badge">&#9679; Tech Solutions</span>
        <h1>Únete al<br />Equipo</h1>
        <p>Regístrate para acceder al panel de control y comenzar a gestionar los proyectos de la organización.</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="ts-auth-panel">
        <h2>Crear Cuenta</h2>
        <p className="ts-subtitle">Completa tus datos para registrarte</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="nombre" className="ts-form-label d-block">Nombre completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="ts-form-control w-100"
              placeholder="Ej. Juan Pérez"
              required
              autoComplete="name"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="correo" className="ts-form-label d-block">Correo electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              className="ts-form-control w-100"
              placeholder="usuario@empresa.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="clave" className="ts-form-label d-block">Contraseña</label>
            <input
              id="clave"
              name="clave"
              type="password"
              className="ts-form-control w-100"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="ts-btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <hr className="ts-divider" />
        <p className="ts-auth-footer">
          ¿Ya tienes cuenta?{' '}
          <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  )
}
