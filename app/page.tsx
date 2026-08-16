import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      
      <main className="ts-hero flex-grow-1" style={{ minHeight: '80vh' }}>
        <div className="ts-hero-card">
          <span className="ts-brand-badge mb-3">&#9679; Enterprise Edition</span>
          <h1>Tech Solutions</h1>
          <p>Sistema de Gestión de Proyectos Avanzado.</p>
          
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
            <a href="/login" className="ts-btn-white">
              Iniciar Sesión
            </a>
            <a href="/register" className="ts-btn-outline-white">
              Registrarse
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
