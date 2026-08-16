'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="navbar navbar-expand-md px-4 py-3 shadow-sm bg-white sticky-top">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none" style={{ color: 'var(--ts-blue-900)' }}>
          <span className="ts-brand-badge mb-0" style={{ backgroundColor: 'var(--ts-blue-50)', color: 'var(--ts-blue-700)', border: 'none' }}>
            &#9679;
          </span>
          Tech Solutions
        </Link>
        
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ts-mobile-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto fw-medium align-items-md-center gap-md-2" style={{ fontSize: '0.95rem' }}>
            <li className="nav-item">
              <a className="nav-link px-3 text-secondary text-decoration-none" href="#features">Características</a>
            </li>
            <li className="nav-item">
              <a className="nav-link px-3 text-secondary text-decoration-none" href="#solutions">Soluciones</a>
            </li>
            <li className="nav-item">
              <a className="nav-link px-3 text-secondary text-decoration-none" href="#pricing">Precios</a>
            </li>
            <li className="nav-item mt-3 mt-md-0 ms-md-2 mb-2 mb-md-0">
              <Link 
                href="/login" 
                className="ts-btn-primary text-decoration-none d-inline-flex justify-content-center align-items-center" 
                style={{ width: '100%', minHeight: '40px', minWidth: '120px', margin: 0 }}
              >
                Acceder
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
