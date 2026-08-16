import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-5" style={{ backgroundColor: 'var(--ts-blue-900)', color: 'rgba(255,255,255,0.7)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <span style={{ color: 'var(--ts-blue-400)' }}>&#9679;</span> Tech Solutions
            </h5>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '280px' }}>
              Plataforma empresarial diseñada para simplificar el seguimiento, control y colaboración en todos tus portafolios.
            </p>
          </div>
          
          <div className="col-6 col-md-2 offset-md-2">
            <h6 className="text-white fw-semibold mb-3">Producto</h6>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Características</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Seguridad</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Integraciones</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Recursos</h6>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Documentación</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Blog</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Casos de Éxito</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Empresa</h6>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Sobre Nosotros</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-reset hover-white">Contacto</a></li>
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4" style={{ fontSize: '0.85rem' }}>
          <p className="mb-0">© {new Date().getFullYear()} Tech Solutions Inc. Todos los derechos reservados.</p>
          <div className="d-flex gap-3 mt-3 mt-md-0">
            <a href="#" className="text-decoration-none text-reset">Términos</a>
            <a href="#" className="text-decoration-none text-reset">Privacidad</a>
            <a href="#" className="text-decoration-none text-reset">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
