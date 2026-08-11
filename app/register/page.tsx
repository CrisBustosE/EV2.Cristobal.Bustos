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
    const clave = (form.elements.namedItem('clave') as HTMLInputElement).value

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
    <main className="container" style={{ maxWidth: 420, marginTop: '10vh' }}>
      <h2 className="mb-4 text-center">Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="form-control"
            required
            autoComplete="name"
          />
        </div>
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
            autoComplete="new-password"
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p className="text-center mt-3 text-muted">
        ¿Ya tienes cuenta?{' '}
        <a href="/login">Inicia sesión</a>
      </p>
    </main>
  )
}
