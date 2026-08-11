export default function Home() {
  return (
    <main className="container mt-5">
      <h1>Tech Solutions</h1>
      <p className="lead">Sistema de Gestión de Proyectos</p>
      <div className="mt-3">
        <a href="/login" className="btn btn-primary me-2">
          Iniciar Sesión
        </a>
        <a href="/register" className="btn btn-outline-secondary">
          Registrarse
        </a>
      </div>
    </main>
  );
}
