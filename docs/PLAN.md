# PLAN.md — Tech Solutions: Sistema de Gestión de Proyectos

> Documento de diseño previo a la implementación. No contiene código ejecutable.

---

## 1. Estructura de Carpetas

```
/
├── app/
│   ├── layout.tsx                   # Layout raíz (importa Bootstrap CSS)
│   ├── page.tsx                     # Home → redirige a /login o /proyectos
│   ├── login/
│   │   └── page.tsx                 # Vista Client Component — formulario login
│   ├── register/
│   │   └── page.tsx                 # Vista Client Component — formulario registro
│   ├── proyectos/
│   │   └── page.tsx                 # Vista protegida — listado de proyectos (Etapa futura)
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts    # POST /api/auth/register
│       │   └── login/route.ts       # POST /api/auth/login
│       └── proyectos/
│           ├── route.ts             # GET (listar) / POST (crear)
│           └── [id]/route.ts        # GET (uno) / PUT (editar) / DELETE (eliminar)
├── lib/
│   └── prisma.ts                    # Singleton PrismaClient
├── middleware.ts                    # Verificación JWT en Edge Runtime
├── prisma/
│   ├── schema.prisma                # Modelos Usuario y Proyecto
│   └── migrations/                  # Generadas por `prisma migrate dev`
├── .env                             # Variables de entorno (gitignored)
└── .env.example                     # Plantilla sin valores sensibles
```

---

## 2. Modelos Prisma (schema.prisma)

### Usuario
| Campo   | Tipo     | Notas                              |
|---------|----------|------------------------------------|
| id      | Int      | PK, autoincrement                  |
| nombre  | String   |                                    |
| correo  | String   | `@unique` — identificador de login |
| clave   | String   | Hash Argon2id (nunca texto plano)  |

### Proyecto
| Campo          | Tipo     | Notas                                    |
|----------------|----------|------------------------------------------|
| id             | Int      | PK, autoincrement                        |
| nombre         | String   |                                          |
| fecha_de_inicio| DateTime |                                          |
| estado         | String   | p.ej. "Activo", "Pausado", "Finalizado"  |
| responsable    | String   |                                          |
| monto          | Float    |                                          |
| created_by     | Int      | FK → Usuario.id                          |
| usuario        | Usuario  | Relación `@relation` con Usuario         |

### Relación
`Usuario` 1 → N `Proyecto` vía `created_by`.

---

## 3. Migraciones

Flujo:
1. `npx prisma migrate dev --name init` — crea `prisma/migrations/…_init/migration.sql` y aplica.
2. Prisma genera `@prisma/client` automáticamente tras la migración.
3. Cambios futuros al schema → nueva migración con nombre descriptivo.

El archivo `dev.db` (SQLite) vive en `prisma/dev.db` y está cubierto por `.gitignore`.

---

## 4. Endpoints API

### Auth

| Método | Ruta                  | Descripción                                              |
|--------|-----------------------|----------------------------------------------------------|
| POST   | /api/auth/register    | Recibe `{ nombre, correo, clave }`, hashea con Argon2id, guarda Usuario |
| POST   | /api/auth/login       | Valida credenciales, firma JWT con `jose`, devuelve cookie `httpOnly` |

**Respuestas de error estándar:** `{ error: string }` con status HTTP apropiado (400, 401, 409, 500).

### Proyectos (todas protegidas por middleware)

| Método | Ruta                  | Descripción                                              |
|--------|-----------------------|----------------------------------------------------------|
| GET    | /api/proyectos        | Lista todos los proyectos del usuario autenticado        |
| POST   | /api/proyectos        | Crea proyecto; `created_by` tomado del payload JWT       |
| GET    | /api/proyectos/[id]   | Devuelve proyecto por id (valida pertenencia al usuario) |
| PUT    | /api/proyectos/[id]   | Actualiza campos del proyecto                            |
| DELETE | /api/proyectos/[id]   | Elimina proyecto                                         |

Body esperado en POST/PUT:
```json
{
  "nombre": "string",
  "fecha_de_inicio": "ISO8601",
  "estado": "string",
  "responsable": "string",
  "monto": 0.0
}
```

---

## 5. Estrategia de Autenticación

### Librería: `jose` (única para todo el proyecto)

**Por qué `jose` y no `jsonwebtoken`:**

`jsonwebtoken` usa APIs de Node.js (`crypto`, `Buffer`) que no están disponibles en Edge Runtime. El `middleware.ts` de Next.js corre obligatoriamente en Edge; si se usara `jsonwebtoken` allí, fallaría en tiempo de ejecución. `jose` implementa la Web Crypto API (estándar W3C), compatible con Edge, Node, y Deno sin cambios.

Mantener una sola librería evita la tentación de importar `jsonwebtoken` fuera de las API Routes por error y garantiza que firma y verificación sean simétricas.

### Flujo completo

```
POST /api/auth/login
  → argon2.verify(hash_bd, clave_recibida)
  → true → jose.SignJWT({ sub: userId, correo }).sign(JWT_SECRET)
  → Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Secure (prod); Path=/
  → 200 OK

Petición protegida (ej. GET /api/proyectos)
  → middleware.ts recibe `request: NextRequest`
  → const token = request.cookies.get('token')?.value
  → jose.jwtVerify(token, JWT_SECRET) → extrae payload.sub (userId)
  → válido → NextResponse.next() con header `x-user-id: <userId>` reescrito
  → inválido/ausente → NextResponse.redirect('/login')
```

### Cookie

| Atributo   | Valor         | Motivo                                                  |
|------------|---------------|---------------------------------------------------------|
| HttpOnly   | true          | Inaccesible desde JS del cliente → protege XSS          |
| SameSite   | lax           | Protege CSRF en navegación normal; permite GET cross-site |
| Secure     | true (prod)   | Solo HTTPS en producción                                |
| Path       | /             | Válida en todo el sitio                                 |

### JWT Payload
```json
{
  "sub": "1",
  "correo": "usuario@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```
Expiración: **24 horas**.

---

## 6. Middleware (`middleware.ts`)

- Corre en **Edge Runtime** — sin acceso a `next/headers`, sin Node.js APIs.
- Intercepta rutas: `/api/proyectos/:path*` y `/proyectos/:path*`.
- Lee la cookie directamente del objeto `NextRequest`:
  ```ts
  const token = request.cookies.get('token')?.value;
  ```
- Verifica con `jose.jwtVerify(token, secret)` y extrae `payload.sub` (el `userId`).
- **Si el token es inválido o está ausente** → `NextResponse.redirect(new URL('/login', request.url))`.
- **Si el token es válido** → clona los headers de la request, añade `x-user-id`,
  y los reenvía al Route Handler a través de `NextResponse.next({ request: { headers } })`.
  Esto reescribe la **request** que recibe el handler, no la respuesta al navegador:
  ```ts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.sub as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  ```

### Flujo userId: middleware → Route Handler

El `userId` viaja del middleware a cada Route Handler protegido a través del header
`x-user-id`. Este mecanismo es **obligatorio** para los endpoints de proyectos:

| Endpoint             | Uso de `x-user-id`                                              |
|----------------------|-----------------------------------------------------------------|
| GET /api/proyectos   | `where: { created_by: userId }` — filtra proyectos del dueño   |
| POST /api/proyectos  | `created_by: userId` — asigna el dueño al crear                |
| GET /api/proyectos/[id] | Verifica que `proyecto.created_by === userId`               |
| PUT /api/proyectos/[id] | Verifica pertenencia antes de actualizar                    |
| DELETE /api/proyectos/[id] | Verifica pertenencia antes de eliminar                 |

Cada Route Handler lee el valor así:
```ts
const userId = Number(request.headers.get('x-user-id'));
```

```ts
// matcher config
export const config = {
  matcher: ["/api/proyectos/:path*", "/proyectos/:path*"],
};
```

---

## 7. Vistas React

### `/login` — Client Component (`"use client"`)
- Formulario Bootstrap: campos `correo` + `clave`.
- `fetch POST /api/auth/login` → redirect a `/proyectos` si 200.
- Muestra error inline si 401.

### `/register` — Client Component (`"use client"`)
- Formulario Bootstrap: campos `nombre` + `correo` + `clave`.
- `fetch POST /api/auth/register` → redirect a `/login` si 201.
- Muestra error inline si 400/409.

---

## 8. Variables de Entorno

| Variable     | Uso                                           |
|--------------|-----------------------------------------------|
| DATABASE_URL | Ruta SQLite (`file:./prisma/dev.db`)           |
| DB_NAME      | Requerido por rúbrica (`desarrollo_software_1`)|
| DB_USER      | Requerido por rúbrica (`root`)                |
| DB_PASS      | Requerido por rúbrica (`desarrollo_software_1`)|
| JWT_SECRET   | Secreto para firmar/verificar JWT (≥32 bytes) |

---

## 9. Orden de Implementación (Bloques)

| Bloque | Contenido                                                      |
|--------|----------------------------------------------------------------|
| 1      | Modelos Prisma finales + migración inicial (`prisma migrate dev`) |
| 2      | `lib/prisma.ts` singleton + `/api/auth/register` + `/api/auth/login` |
| 3      | `middleware.ts` con verificación JWT                           |
| 4      | CRUD completo `/api/proyectos` y `/api/proyectos/[id]`         |
| 5      | Vistas `/login` y `/register` (Client Components + Bootstrap)  |

---

*Esperando validación antes de iniciar Bloque 1.*
