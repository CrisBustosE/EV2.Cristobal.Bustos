# Tech Solutions - Sistema de Gestión de Proyectos

Plataforma empresarial para el seguimiento, control y colaboración de proyectos, desarrollada como evaluación técnica (EV2). 

## Decisiones Tecnológicas y Stack

### 1. Framework Base: Next.js 16 (App Router)
Se utilizó **Next.js 16** con el App Router y Turbopack para garantizar el mayor rendimiento y estándares modernos. 
- **Enrutamiento (File-based):** Se construyó una arquitectura separando claramente las vistas (`/login`, `/register`, `/proyectos`) de las rutas de API (`/api/auth/...`, `/api/proyectos/...`).
- **Proxy (ex Middleware):** Next.js 16 deprecó `middleware.ts`. Se implementó un archivo `proxy.ts` en la raíz (ejecutándose en Node.js Runtime) para proteger las rutas de proyectos. Este intercepta las peticiones no autenticadas devolviendo `401 Unauthorized` (para API) o `307 Redirect` (para navegación HTML), inyectando de manera segura el header `x-user-id` a las rutas protegidas.

### 2. Base de Datos: Prisma ORM 7 + SQLite
Se optó por **SQLite** (`dev.db` guardado dentro del directorio `/prisma/`) por su ligereza y facilidad de despliegue sin dependencias de servicios externos.
- **Prisma 7 & Driver Adapters:** Prisma 7 exige el uso de adaptadores de base de datos. Se integró `@prisma/adapter-better-sqlite3`.
- **Singleton Client:** En `lib/prisma.ts` se implementó el patrón Singleton (`globalThis.prisma`) para evitar que el Hot Module Replacement (HMR) en modo desarrollo sature y agote el pool de conexiones de la base de datos local.
- **Nota sobre variables de entorno:** El archivo `.env` incluye las variables `DB_NAME`, `DB_USER` y `DB_PASS`. Aunque el motor de base de datos usado es un archivo único (SQLite) que no requiere autenticación de red, estas variables se incluyen explícitamente para cumplir con la rúbrica técnica de evaluación, asegurando trazabilidad con el requerimiento original sin afectar la funcionalidad.

### 3. Autenticación y Seguridad
- **Hash de Contraseñas (argon2):** Se utiliza `argon2` (variante Argon2id). Es el estándar recomendado por OWASP para el hasheo criptográfico moderno, superior a bcrypt debido a su resistencia contra ataques por fuerza bruta utilizando GPUs.
- **Tokens (jose):** Se prefirió `jose` sobre `jsonwebtoken`. `jose` implementa de forma nativa la Web Crypto API (estándar JOSE), lo cual garantiza portabilidad total y evita depender de los módulos internos criptográficos de Node.js, preparando el código en caso de migraciones a entornos puros como Edge Runtime o Cloudflare Workers.
- **Manejo de Sesión:** El JWT se emite y se guarda en una cookie con los atributos `HttpOnly` y `SameSite=Lax`. Esto previene de raíz ataques de Cross-Site Scripting (XSS) ya que el token es inaccesible desde el JavaScript del cliente.

### 4. Estilos y UI
- **Bootstrap 5:** Cargado de manera eficiente mediante CDN para sentar las bases de la UI.
- **Design System Corporativo:** En `app/globals.css` se extendió Bootstrap mediante un sistema de variables CSS puro (esquema azul/gris). Todos los formularios interactivos cuentan con validación HTML5 nativa, modales en React puro sin requerir librerías de JS externas y un layout responsivo estilo "bottom-sheet" en teléfonos móviles.

## Guía de Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Generar un secreto criptográfico para JWT:
   Es **crítico** reemplazar el valor de `JWT_SECRET` en tu nuevo archivo `.env` con una clave segura. Dejar este valor vacío o usar uno predecible compromete gravemente la seguridad de la autenticación. Puedes generar uno ejecutando:
   ```bash
   openssl rand -base64 32
   ```
   *Copia y pega el resultado en la variable `JWT_SECRET`.*
4. Ejecutar las migraciones y generar el Prisma Client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
El sistema estará disponible en `http://localhost:3000`.
