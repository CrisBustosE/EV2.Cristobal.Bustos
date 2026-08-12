'use client'

import { useEffect, useState } from 'react'

interface NotificationModalProps {
  isOpen: boolean
  title: string
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function NotificationModal({ isOpen, title, message, type, onClose }: NotificationModalProps) {
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

  const isSuccess = type === 'success'

  return (
    <>
      <div 
        className={`modal fade ${isOpen ? 'show d-block' : 'd-block'}`} 
        tabIndex={-1}
        style={{ backgroundColor: 'rgba(15, 32, 68, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            
            <div className={`modal-header border-0 text-white ${isSuccess ? 'bg-success' : 'bg-danger'}`}>
              <h5 className="modal-title fw-bold">
                {isSuccess ? '✅ ' : '⚠️ '}
                {title}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                aria-label="Cerrar"
              ></button>
            </div>
            
            <div className="modal-body p-4 text-center">
              <p className="fs-5 mb-0 text-secondary">{message}</p>
            </div>
            
            <div className="modal-footer border-0 justify-content-center pb-4">
              <button 
                type="button" 
                className={`btn px-4 py-2 fw-bold ${isSuccess ? 'btn-success' : 'btn-danger'}`} 
                onClick={onClose}
                style={{ borderRadius: '8px' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
