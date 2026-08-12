'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NotificationModal from '@/components/NotificationModal'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Estado para el modal
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
    onConfirm: () => {},
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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
      // Éxito: Mostramos modal y al cerrar redirigimos
      setModalConfig({
        isOpen: true,
        title: '¡Registro Exitoso!',
        message: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
        type: 'success',
        onConfirm: () => router.push('/login'),
      })
    } else {
      // Error: Mostramos el modal de error
      const data = await res.json()
      setModalConfig({
        isOpen: true,
        title: 'Error de Registro',
        message: data.error ?? 'Ocurrió un error inesperado al registrarse.',
        type: 'error',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
      })
    }
  }

  return (
    <>
      <div className="ts-auth-wrapper">
        <div className="ts-auth-brand">
          <a href="/" className="ts-back-link">
            &larr; Volver al inicio
          </a>
          <span className="ts-brand-badge">&#9679; Tech Solutions</span>
          <h1>Únete al<br />Equipo</h1>
          <p>Regístrate para acceder al panel de control y comenzar a gestionar los proyectos de la organización.</p>
        </div>

        <div className="ts-auth-panel">
          <h2>Crear Cuenta</h2>
          <p className="ts-subtitle">Completa tus datos para registrarte</p>

          <form onSubmit={handleSubmit}>
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

      <NotificationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={modalConfig.onConfirm}
      />
    </>
  )
}
