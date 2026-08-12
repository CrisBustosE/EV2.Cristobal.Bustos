# Project Context & Agent Instructions (Tech Solutions)

Este archivo contiene el contexto del proyecto, reglas de arquitectura y lecciones aprendidas durante su construcción. Los agentes de IA deben leer este archivo para alinearse con el stack y las convenciones establecidas.

## 1. Stack Tecnológico & Arquitectura
- **Framework:** Next.js 16 (App Router, Turbopack).
- **Base de Datos:** SQLite gestionado a través de Prisma ORM 7.
- **Estilos:** Bootstrap 5 (vía CDN en `layout.tsx`) + CSS Personalizado en `app/globals.css`.
- **Autenticación:** JWT (JSON Web Tokens) usando la librería `jose`. Se eligió para mantener una única librería consistente y estandarizada (Web Crypto API/JOSE) tanto para firmar como verificar tokens, lo que mantiene el código portable en caso de necesitar ejecutarse en un entorno Edge puro en el futuro. Hash de contraseñas con `argon2` (Argon2id).

## 2. Decisiones Clave y Lecciones Aprendidas (Quirks)

### Next.js 16 Proxy (Reemplazo de Middleware)
- **Runtime Node.js:** Next.js 16 deprecó `middleware.ts` en favor de `proxy.ts`. A diferencia del antiguo middleware que corría obligatoriamente en Edge, `proxy.ts` corre **exclusivamente en el runtime de Node.js**.
- **Manejo de Redirecciones vs Fetch:** 
  - *Regla Crítica:* Para solicitudes no autenticadas, `proxy.ts` DEBE devolver una respuesta JSON `401 Unauthorized` si la ruta comienza con `/api/`, y un redirect `307` si es una ruta de página (ej. `/proyectos`). 
  - *Razón:* La API `fetch` del navegador sigue los redirects `307` por defecto. Si la API devuelve un redirect hacia `/login` (que es HTML), el cliente intentará parsearlo con `res.json()` y fallará con `SyntaxError: JSON.parse: unexpected character at line 1 column 1`.
- **Inyección de Identidad:** El proxy extrae el `userId` del token y se lo pasa a los Route Handlers inyectando el header `x-user-id`.

### Prisma 7 con SQLite
- **Driver Adapters Obligatorios:** Prisma 7 ya no se conecta directamente a SQLite solo usando la variable de entorno `DATABASE_URL`. Requiere instalar y configurar un driver adapter (`@prisma/adapter-better-sqlite3`).
- **Singleton Pattern:** La instancia se crea en `lib/prisma.ts` utilizando `globalThis`. Esto es vital para evitar agotar el pool de conexiones de la base de datos debido a las recargas del Hot Module Replacement (HMR) en desarrollo.

### Diseño de Interfaz y Formularios
- **Design System Corporativo:** El proyecto usa un esquema de azul oscuro y gris claro. Las clases utilitarias de UI personalizadas llevan el prefijo `ts-` (ej. `ts-btn-primary`, `ts-form-control`, `ts-hero`).
- **Fuente:** Se utiliza `Inter` cargada globalmente vía `next/font/google` en `layout.tsx`. No definir `font-family` directamente en el body del CSS.
- **Validaciones HTML5:** Los formularios deben depender de la validación nativa de HTML5 (`required`, `type="email"`, etc.). NUNCA colocar el atributo `noValidate` en los tags `<form>`, ya que esto anula la protección del navegador antes del envío a la API.
- **Componentes:** Los modales se construyen como componentes de React (`components/NotificationModal.tsx`) manejando la visibilidad mediante estados booleanos y opacidades de CSS puro, evitando los scripts invasivos de Bootstrap (jQuery/JS).

## 3. Flujo de Trabajo (Git)
- **Commits:** Usa Conventional Commits única y exclusivamente en **Inglés** (ej. `feat: ...`, `fix: ...`, `style: ...`).
- **Ramas:** Las features nuevas se desarrollan en ramas secundarias (ej. `feat/projects-crud`), se prueban y luego se mezclan a `main` usando merge commits (`git merge --no-ff`).
