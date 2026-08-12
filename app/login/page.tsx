'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const correo = (form.elements.namedItem('correo') as HTMLInputElement).value
    const clave  = (form.elements.namedItem('clave')  as HTMLInputElement).value

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, clave }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/proyectos')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al iniciar sesión')
    }
  }

  return (
    <div className="ts-auth-wrapper">
      {/* Panel izquierdo — branding */}
      <div className="ts-auth-brand">
        <a href="/" className="ts-back-link">
          &larr; Volver al inicio
        </a>
        <span className="ts-brand-badge">&#9679; Tech Solutions</span>
        <h1>Gestión de<br />Proyectos</h1>
        <p>Plataforma interna para el seguimiento, control y colaboración de proyectos empresariales.</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="ts-auth-panel">
        <h2>Bienvenido</h2>
        <p className="ts-subtitle">Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit}>
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
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="ts-btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <hr className="ts-divider" />
        <p className="ts-auth-footer">
          ¿No tienes cuenta?{' '}
          <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  )
}
