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
    const clave = (form.elements.namedItem('clave') as HTMLInputElement).value

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
    <main className="container" style={{ maxWidth: 420, marginTop: '10vh' }}>
      <h2 className="mb-4 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="correo" className="form-label">Correo</label>
          <input
            id="correo"
            name="correo"
            type="email"
            className="form-control"
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="clave" className="form-label">Contraseña</label>
          <input
            id="clave"
            name="clave"
            type="password"
            className="form-control"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="text-center mt-3 text-muted">
        ¿No tienes cuenta?{' '}
        <a href="/register">Regístrate</a>
      </p>
    </main>
  )
}
