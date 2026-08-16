'use client'

import { useEffect, useState } from 'react'

interface NotificationModalProps {
  isOpen: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'warning'
  mode?: 'alert' | 'confirm'
  confirmText?: string
  onClose: () => void
  onCancel?: () => void
}

export default function NotificationModal({ 
  isOpen, 
  title, 
  message, 
  type, 
  mode = 'alert',
  confirmText = 'Aceptar',
  onClose,
  onCancel
}: NotificationModalProps) {
  const [show, setShow] = useState(false)

  // Manejar animaciones de Bootstrap
  useEffect(() => {
    if (isOpen) {
      setShow(true)
    } else {
      setTimeout(() => setShow(false), 150) // Esperar fade out
    }
  }, [isOpen])

  if (!isOpen && !show) return null

  // Colores según el tipo
  const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning text-dark' : 'bg-danger'
  const btnClass = type === 'success' ? 'btn-success' : type === 'warning' ? 'btn-danger' : 'btn-danger'
  const icon = type === 'success' ? '✅ ' : '⚠️ '
  const closeBtnClass = type === 'warning' ? 'btn-close' : 'btn-close btn-close-white'

  // Manejo de cierres
  const handleClose = () => {
    if (mode === 'confirm' && onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  return (
    <>
      <div 
        className={`modal fade ${isOpen ? 'show d-block' : 'd-block'}`} 
        tabIndex={-1}
        style={{ backgroundColor: 'rgba(15, 32, 68, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        onClick={handleClose}
      >
        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            
            <div className={`modal-header border-0 ${type !== 'warning' ? 'text-white' : ''} ${bgClass}`}>
              <h5 className="modal-title fw-bold">
                {icon}
                {title}
              </h5>
              <button 
                type="button" 
                className={closeBtnClass}
                onClick={handleClose}
                aria-label="Cerrar"
              ></button>
            </div>
            
            <div className="modal-body p-4 text-center">
              <p className="fs-5 mb-0 text-secondary">{message}</p>
            </div>
            
            <div className="modal-footer border-0 justify-content-center pb-4 gap-2">
              {mode === 'confirm' && (
                <button 
                  type="button" 
                  className="btn btn-light px-4 py-2 fw-bold" 
                  onClick={onCancel || onClose}
                  style={{ borderRadius: '8px' }}
                >
                  Cancelar
                </button>
              )}
              <button 
                type="button" 
                className={`btn px-4 py-2 fw-bold ${btnClass}`} 
                onClick={onClose}
                style={{ borderRadius: '8px' }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
