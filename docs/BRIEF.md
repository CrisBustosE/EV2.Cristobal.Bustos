# BRIEF: Desarrollo Software de Gestión de Proyectos (Tech Solutions)

**Rol del Agente:** Eres un Arquitecto de Software Senior experto en React y el ecosistema de Next.js (App Router). Tu misión es inicializar y desarrollar este proyecto aplicando buenas prácticas, modularidad y código limpio.

## Contexto del Proyecto
La empresa Tech Solutions ha decidido modernizar su sistema de gestión de proyectos. Se requiere construir una aplicación web Full-Stack utilizando Next.js, cumpliendo con una separación lógica clara (API Routes como controladores y Server/Client Components como vistas), con un sistema de autenticación robusto y gestión de datos básicos.

## Flujo de trabajo obligatorio (NO te saltes pasos)
Este proyecto se construye de forma incremental. Sigue este orden estricto y detente a esperar mi confirmación entre cada etapa:

1. **Inicialización:** lee este BRIEF.md y configura el proyecto base (estructura de carpetas, dependencias, configuración de TypeScript, Next.js, Prisma, Bootstrap). No implementes lógica de negocio todavía.
2. **PLAN.md:** genera un archivo `PLAN.md` que describa, sin implementar código, el diseño propuesto: modelos de Prisma, rutas de la API, estrategia de autenticación (incluyendo qué librería usarás para firmar y cuál para verificar el JWT, y por qué), y estructura de migraciones. Espera mi validación antes de continuar.
3. **Implementación por bloques:** una vez validado el plan, implementa un bloque a la vez (por ejemplo: modelos + migraciones → auth (registro/login) → middleware → CRUD de proyectos → vistas). Después de cada bloque, dime qué se implementó y qué falta.
4. **Corrección:** si algo del bloque implementado no es válido o tiene errores, corrígelo antes de avanzar al siguiente bloque.
5. **Documentación (al final):** el `README.md` se redacta al final, cuando el proyecto ya esté funcionando y las decisiones técnicas estén cerradas (ver sección más abajo).

## Requerimientos Técnicos Base
*   **Lenguaje / Entorno:** Node.js con TypeScript.
*   **Framework Web:** Next.js (utilizando App Router).
*   **Estilos:** Bootstrap 5 (impórtalo en un Client Component si usas JS interactivo de Bootstrap; si solo usas clases CSS, impórtalo en el layout raíz sin problema).
*   **ORM y Base de Datos:** Prisma ORM utilizando **SQLite**.
*   **Seguridad y Autenticación:**
    *   `argon2` para el hash de contraseñas de los usuarios.
    *   Para JWT, usa **`jose`** para firmar y verificar el token. No uses `jsonwebtoken` en ninguna parte del proyecto: como todo el flujo de auth (login, middleware, verificación) puede terminar corriendo en Edge Runtime, mantener una sola librería compatible con Edge en todo el proyecto evita inconsistencias. Si por algún motivo prefieres `jsonwebtoken`, su uso queda restringido exclusivamente a las API Routes (Node runtime) y nunca a `middleware.ts`.
    *   El JWT se entregará en una **cookie `httpOnly`, `secure` (en producción) y `sameSite: 'lax'`**, no en el body de la respuesta.

## Configuración de Entorno (Obligatorio por Rúbrica)
El archivo `.env` **DEBE** contener estrictamente las siguientes variables, independientemente de que el motor sea SQLite:
*   `DB_NAME=desarrollo_software_1`
*   `DB_USER=root`
*   `DB_PASS=desarrollo_software_1`
*   `JWT_SECRET=` (genera un valor aleatorio real de al menos 32 bytes, no dejes un placeholder de ejemplo)

Adicionalmente:
*   Crea un `.env.example` con las mismas claves pero sin valores sensibles.
*   Asegúrate de que `.env` esté incluido en `.gitignore`.

## Modelos de Dominio (Prisma)
Deberás crear los siguientes modelos:

**Usuario**
*   `Id` (Primary Key, UUID o Int)
*   `Nombre`
*   `Correo` (Identificador Único)
*   `Clave` (Almacenará el hash de Argon2)

**Proyecto**
*   `Id` (Primary Key, UUID o Int)
*   `Nombre`
*   `Fecha_de_Inicio` (DateTime)
*   `Estado` (String)
*   `Responsable` (String)
*   `Monto` (Float/Decimal)
*   `created_by` (Relación: Id del Usuario que lo crea)

## Endpoints / Controladores (Next.js API Routes)
Crea las siguientes rutas de API en `app/api/...`:
1.  **Auth - Registro:** Ruta `/api/auth/register` que implemente el hash de la clave con argon2 antes de guardar en la BD.
2.  **Auth - Login:** Ruta `/api/auth/login` que valide la clave y, si las credenciales son correctas, firme un JWT con `jose` y lo entregue en una cookie `httpOnly`.
3.  **Proyectos:** Rutas `/api/proyectos` para el CRUD completo del modelo de Proyectos.

## Middleware de Seguridad
Genera un archivo `middleware.ts` en la raíz del proyecto que **verifique el JWT usando `jose`** (compatible con Edge Runtime) leyendo la cookie `httpOnly`. Debe proteger las rutas del CRUD de proyectos y redirigir al login si no hay un token válido.

## Vistas Requeridas (React Components)
Construir las siguientes páginas (vistas) con estilos básicos que interactúen con las API Routes:
1.  **Inicio de Sesión:** Página `/login` con formulario para enviar credenciales.
2.  **Registro:** Página `/register` con formulario para crear un nuevo usuario.

## Documentación (README.md) — última etapa
Cuando el proyecto esté funcionando y validado, genera un `README.md` que documente, para cada decisión tecnológica (Next.js, Prisma+SQLite, argon2, jose, Bootstrap), el motivo de la elección. Redáctalo como borrador: yo lo voy a revisar y ajustar antes de la entrega final.
