'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NotificationModal from '@/components/NotificationModal'

type Proyecto = {
  id: number
  nombre: string
  fecha_de_inicio: string
  estado: string
  responsable: string
  monto: number
}

export default function ProyectosPage() {
  const router = useRouter()
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Proyecto | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const minDate = new Date(today.getFullYear() - 40, today.getMonth(), today.getDate()).toISOString().split('T')[0]
  const maxDate = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate()).toISOString().split('T')[0]

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, projectId: number | null }>({
    isOpen: false,
    projectId: null
  })

  useEffect(() => {
    fetchProyectos()
  }, [])

  async function fetchProyectos() {
    try {
      const res = await fetch('/api/proyectos')
      if (res.ok) {
        const data = await res.json()
        setProyectos(data)
      } else if (res.status === 401 || res.status === 307) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching proyectos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function openModal(proyecto: Proyecto | null = null) {
    setCurrentProject(proyecto)
    setFormError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setCurrentProject(null)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    const form = e.currentTarget
    const payload = {
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      fecha_de_inicio: (form.elements.namedItem('fecha_de_inicio') as HTMLInputElement).value,
      estado: (form.elements.namedItem('estado') as HTMLSelectElement).value,
      responsable: (form.elements.namedItem('responsable') as HTMLInputElement).value,
      monto: Number((form.elements.namedItem('monto') as HTMLInputElement).value),
    }

    const url = currentProject ? `/api/proyectos/${currentProject.id}` : '/api/proyectos'
    const method = currentProject ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchProyectos()
        closeModal()
      } else {
        const data = await res.json()
        setFormError(data.error ?? 'Error al guardar el proyecto')
      }
    } catch (error) {
      setFormError('Error de red. Inténtalo de nuevo.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteConfirm() {
    const id = deleteModal.projectId
    if (id === null) return

    try {
      const res = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProyectos(prev => prev.filter(p => p.id !== id))
        setDeleteModal({ isOpen: false, projectId: null })
      } else {
        alert('Error al eliminar el proyecto')
      }
    } catch (error) {
      console.error(error)
    }
  }

  function triggerDelete(id: number) {
    setDeleteModal({ isOpen: true, projectId: id })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--ts-gray-100)' }}>
        <div className="spinner-border" style={{ color: 'var(--ts-blue-500)' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ts-gray-100)' }}>
      {/* ── Topbar ── */}
      <nav className="navbar px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--ts-blue-900)' }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="ts-brand-badge mb-0" style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', color: 'white' }}>
              &#9679; Tech Solutions
            </span>
            <span className="text-white fw-semibold d-none d-sm-inline ms-2">Workspace</span>
          </div>
          <button onClick={handleLogout} className="btn btn-sm btn-outline-light" style={{ borderRadius: '6px' }}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="container py-5">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-5 gap-3">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--ts-blue-900)' }}>Gestión de Proyectos</h2>
            <p className="text-muted mb-0">Administra los portafolios y su estado de ejecución.</p>
          </div>
          {proyectos.length > 0 && (
            <button onClick={() => openModal()} className="ts-btn-primary" style={{ width: 'fit-content' }}>
              + Nuevo Proyecto
            </button>
          )}
        </div>

        {proyectos.length === 0 ? (
          <div className="text-center py-5" style={{ backgroundColor: 'var(--ts-white)', borderRadius: 'var(--ts-radius)', border: '1px dashed var(--ts-gray-300)' }}>
            <h4 className="fw-bold text-muted mb-3">No hay proyectos activos</h4>
            <p className="text-secondary mb-4">Comienza creando tu primer proyecto en el sistema.</p>
            <button onClick={() => openModal()} className="ts-btn-primary" style={{ width: 'fit-content' }}>
              Crear Proyecto
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {proyectos.map(p => (
              <div key={p.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0" style={{ borderRadius: 'var(--ts-radius)', boxShadow: 'var(--ts-shadow)', backgroundColor: 'var(--ts-white)' }}>
                  <div className="card-body p-4">
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--ts-blue-900)' }}>
                        {p.nombre}
                        {p.estado === 'Finalizado' && new Date(p.fecha_de_inicio) > new Date() && (
                          <span title="Fecha de inicio futura para un proyecto finalizado" style={{ cursor: 'help' }}>⚠️</span>
                        )}
                      </h5>
                      <span className={`badge rounded-pill ${p.estado === 'Activo' ? 'bg-success' : p.estado === 'Pausado' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {p.estado}
                      </span>
                    </div>
                    
                    <div className="mb-4" style={{ fontSize: '0.9rem' }}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Responsable</span>
                        <span className="fw-semibold" style={{ color: 'var(--ts-blue-700)' }}>{p.responsable}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Inicio</span>
                        <span className="fw-semibold" style={{ color: 'var(--ts-blue-700)' }}>
                          {new Date(new Date(p.fecha_de_inicio).getTime() + Math.abs(new Date(p.fecha_de_inicio).getTimezoneOffset() * 60000)).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Presupuesto</span>
                        <span className="fw-bold text-success">
                          ${p.monto.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-auto">
                      <button onClick={() => openModal(p)} className="btn btn-sm w-100" style={{ backgroundColor: 'var(--ts-blue-50)', color: 'var(--ts-blue-700)', fontWeight: 600 }}>
                        Editar
                      </button>
                      <button onClick={() => triggerDelete(p.id)} className="btn btn-sm w-100" style={{ color: '#b91c1c', backgroundColor: '#fff5f5', border: '1px solid #fecaca', fontWeight: 600 }}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal Create/Edit ── */}
      {isModalOpen && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(15, 32, 68, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', backgroundColor: 'var(--ts-white)' }}>
              
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--ts-blue-900)' }}>
                  {currentProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              
              <div className="modal-body p-4">
                <form id="projectForm" onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="ts-form-label">Nombre del proyecto</label>
                    <input 
                      name="nombre" 
                      type="text" 
                      className="ts-form-control w-100" 
                      defaultValue={currentProject?.nombre} 
                      required 
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="ts-form-label">Fecha de Inicio</label>
                      <input 
                        name="fecha_de_inicio" 
                        type="date" 
                        className="ts-form-control w-100" 
                        defaultValue={currentProject?.fecha_de_inicio.split('T')[0] || todayStr}
                        min={minDate}
                        max={maxDate} 
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="ts-form-label">Estado</label>
                      <select name="estado" className="ts-form-control w-100" defaultValue={currentProject?.estado || 'Activo'} required>
                        <option value="Activo">Activo</option>
                        <option value="Pausado">Pausado</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="ts-form-label">Responsable</label>
                    <input 
                      name="responsable" 
                      type="text" 
                      className="ts-form-control w-100" 
                      defaultValue={currentProject?.responsable} 
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label className="ts-form-label">Monto o Presupuesto ($)</label>
                    <input 
                      name="monto" 
                      type="number" 
                      step="0.01" 
                      className="ts-form-control w-100" 
                      defaultValue={currentProject?.monto} 
                      required 
                    />
                  </div>

                  {formError && (
                    <div className="alert alert-danger py-2" style={{ fontSize: '0.875rem' }}>
                      {formError}
                    </div>
                  )}
                </form>
              </div>
              
              <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                <button type="button" className="btn text-muted fw-semibold me-2" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" form="projectForm" className="ts-btn-primary m-0" style={{ width: 'auto' }} disabled={formLoading}>
                  {formLoading ? 'Guardando...' : 'Guardar Proyecto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirm Delete ── */}
      <NotificationModal 
        isOpen={deleteModal.isOpen}
        title="Eliminar Proyecto"
        message="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
        type="warning"
        mode="confirm"
        confirmText="Sí, Eliminar"
        onClose={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, projectId: null })}
      />
    </div>
  )
}
