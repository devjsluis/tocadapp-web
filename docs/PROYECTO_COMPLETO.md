# TocadApp — Documentación Técnica Completa

> Última actualización: Marzo 2026

---

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Base de datos](#base-de-datos)
5. [Backend (tocadapp-api)](#backend-tocadapp-api)
6. [Frontend (tocadapp-web)](#frontend-tocadapp-web)
7. [Autenticación y seguridad](#autenticación-y-seguridad)
8. [Flujos principales](#flujos-principales)
9. [Variables de entorno](#variables-de-entorno)
10. [Estado actual y pendientes](#estado-actual-y-pendientes)
11. [Roadmap técnico](#roadmap-técnico)

---

## Visión general

TocadApp es una plataforma para músicos que permite registrar tocadas (gigs), gestionar bandas con agenda compartida, controlar finanzas personales completas y detectar conflictos de horario.

- **Repositorio web:** `tocadapp-web/` (Next.js)
- **Repositorio API:** `tocadapp-api/` (Express)
- **DB:** PostgreSQL hosteada en AWS (44.214.181.37)
- **Dominio planeado:** `tocadapp.com` / `api.tocadapp.com`

### Modelo de usuarios

Un mismo usuario puede:
- Crear bandas propias → se convierte en **líder** de esa banda
- Unirse a otras bandas → participa como **músico**
- Registrar tocadas personales (sin banda)
- Registrar su ganancia personal en gigs de cualquier banda

No hay rol global restrictivo. El rol se define por banda, no por cuenta.

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.1.2 | Framework principal (App Router) |
| React | 19.2.3 | UI |
| TypeScript | 5.x | Tipado |
| Tailwind CSS | 4.x | Estilos |
| Radix UI | 1.4.3 | Componentes base |
| Recharts | 3.8.0 | Gráficas |
| Axios | 1.13.5 | HTTP client con interceptor JWT |
| Sonner | 2.0.7 | Toast notifications |
| Lucide React | 0.562.0 | Iconos |
| js-cookie | 3.0.5 | Manejo de cookies |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Express | 5.2.1 | Framework HTTP |
| TypeScript | 5.9.3 | Tipado |
| PostgreSQL (pg) | 8.18.0 | Base de datos |
| jsonwebtoken | 9.0.3 | Auth JWT |
| bcrypt | 6.0.0 | Hash de contraseñas |
| cors | 2.8.5 | CORS |
| swagger-ui-express | 5.0.1 | Documentación API |

---

## Estructura de carpetas

### Frontend (`tocadapp-web/`)
```
tocadapp-web/
├── middleware.ts                  # Protección de /dashboard/* (requiere token)
├── app/
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   ├── globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx   # Sin funcionalidad real aún
│   └── dashboard/
│       ├── layout.tsx             # Sidebar + layout
│       ├── page.tsx               # Stats + gráfica + próximas (finanzas propias)
│       ├── gigs/page.tsx          # CRUD tocadas + banda + mi pago + conflictos
│       ├── bands/page.tsx         # Gestión de bandas (crear, unirse, miembros)
│       ├── musicians/page.tsx     # Libreta de contactos musical
│       └── finances/page.tsx      # Finanzas completas (propias + banda con mi pago)
├── components/
│   ├── ui/                        # Button, Input, Label, Select, Card, Sonner
│   ├── customized/NavbarLanding.tsx
│   └── Sidebar.tsx                # Inicio, Tocadas, Bandas, Músicos, Finanzas
├── services/
│   └── auth.service.ts
├── types/
│   └── auth.ts
├── lib/
│   ├── axios.ts                   # Cliente Axios + interceptor JWT automático
│   └── utils.ts                   # cn() helper
└── .env.local
```

### Backend (`tocadapp-api/`)
```
tocadapp-api/
├── src/
│   ├── index.ts
│   ├── app.ts                     # Express + middlewares + rutas
│   ├── swagger.ts
│   ├── lib/db.ts                  # Pool de pg
│   ├── middleware/
│   │   └── auth.ts                # authMiddleware + AuthRequest interface
│   ├── routes/
│   │   ├── users.routes.ts
│   │   ├── gigs.routes.ts
│   │   ├── musicians.routes.ts
│   │   └── bands.routes.ts        # Nuevo
│   ├── controllers/
│   │   ├── users.controller.ts
│   │   ├── gigs.controller.ts
│   │   ├── musicians.controller.ts
│   │   └── bands.controller.ts    # Nuevo
│   └── migrations/
│       ├── 002_create_musicians.sql
│       ├── 003_bands_and_user_isolation.sql  # Bandas + user_id en gigs/musicians
│       └── 004_gig_earnings.sql             # Ganancias personales por gig
```

---

## Base de datos

> **Migraciones pendientes de correr manualmente:**
> - `003_bands_and_user_isolation.sql`
> - `004_gig_earnings.sql`

### Tabla: `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255) NOT NULL,
  last_name  VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50) NOT NULL CHECK (role IN ('musician', 'manager')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `bands`
```sql
CREATE TABLE IF NOT EXISTS bands (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id    INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invite_code VARCHAR(10) UNIQUE NOT NULL,  -- 6 chars, auto-generado
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `band_members`
```sql
CREATE TABLE IF NOT EXISTS band_members (
  id        SERIAL PRIMARY KEY,
  band_id   INTEGER REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role      VARCHAR(50) NOT NULL DEFAULT 'musician',  -- 'leader' | 'musician'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(band_id, user_id)
);
-- El owner también se inserta aquí con role='leader' al crear la banda
```

### Tabla: `gigs`
```sql
CREATE TABLE IF NOT EXISTS gigs (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  place      VARCHAR(255) NOT NULL,
  date       DATE NOT NULL,
  time       TIME NOT NULL,
  amount     NUMERIC(10, 2) NOT NULL,
  hours      NUMERIC(4, 1) NOT NULL,
  notes      TEXT,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,   -- quién lo creó
  band_id    INTEGER REFERENCES bands(id) ON DELETE SET NULL,  -- banda (opcional)
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Visibilidad de gigs:**
- `user_id = yo` → lo ves siempre (gig personal o de banda que creaste)
- `band_id IN (mis bandas)` → lo ves aunque no lo hayas creado (agenda compartida)

### Tabla: `gig_earnings`
```sql
CREATE TABLE IF NOT EXISTS gig_earnings (
  id      SERIAL PRIMARY KEY,
  gig_id  INTEGER REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount  NUMERIC(10, 2) NOT NULL,
  UNIQUE(gig_id, user_id)
);
```

Permite que cada músico registre su ganancia personal en cualquier gig de banda.

### Tabla: `musicians`
```sql
CREATE TABLE IF NOT EXISTS musicians (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  instrument VARCHAR(255),
  phone      VARCHAR(50),
  notes      TEXT,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Libreta de contactos musicales personal (no son usuarios de la app).

---

## Backend (tocadapp-api)

### Endpoints

#### Auth (`/users`) — sin JWT requerido
| Método | Ruta | Descripción | Body |
|---|---|---|---|
| POST | `/users` | Registro | `{email, name, lastName, password, role}` |
| POST | `/users/login` | Login | `{email, password}` → `{token, user}` |
| GET | `/users` | Listar usuarios | — |

#### Tocadas (`/gigs`) — JWT requerido
| Método | Ruta | Descripción | Body |
|---|---|---|---|
| GET | `/gigs` | Mis gigs + gigs de mis bandas | — |
| POST | `/gigs` | Crear gig | `{title, place, date, time, amount, hours, notes?, band_id?}` |
| PUT | `/gigs/:id` | Editar gig (solo owner) | Igual que POST |
| PUT | `/gigs/:id/my-earnings` | Registrar mi ganancia personal | `{amount}` |
| DELETE | `/gigs/:id` | Eliminar gig (solo owner) | — |

#### Músicos (`/musicians`) — JWT requerido
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/musicians` | Mis contactos musicales |
| POST | `/musicians` | Agregar contacto |
| DELETE | `/musicians/:id` | Eliminar (solo owner) |

#### Bandas (`/bands`) — JWT requerido
| Método | Ruta | Descripción | Body |
|---|---|---|---|
| GET | `/bands` | Mis bandas (owned + member) | — |
| POST | `/bands` | Crear banda | `{name, description?}` |
| POST | `/bands/join` | Unirse por código | `{invite_code}` |
| GET | `/bands/:id/members` | Ver miembros | — |
| DELETE | `/bands/:id/leave` | Salir de banda | — |
| DELETE | `/bands/:id` | Eliminar banda (solo owner) | — |

### Formato de respuestas

**GET /gigs — campos relevantes:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "1",
      "title": "Boda García",
      "band_name": "Los Favoritos",   // null si es gig personal
      "is_owner": true,               // false si es gig de banda que no creaste
      "my_amount": 1500.00,           // null si no has registrado tu pago
      "amount": 8000.00               // el total del gig (del owner)
    }
  ]
}
```

**Lógica de monto efectivo en frontend:**
```typescript
function effectiveAmount(gig: Gig): number | null {
  if (gig.is_owner) return Number(gig.amount);  // tu gig, tu monto
  return gig.my_amount != null ? Number(gig.my_amount) : null;  // banda: tu registro
}
```

---

## Frontend (tocadapp-web)

### Páginas y funcionalidades

#### Landing (`/`)
- Hero, características, precios, contacto
- Navbar dinámico: "Ir al Dashboard" si hay token

#### Dashboard (`/dashboard`)
- Stats: tocadas propias realizadas, ganado total propio, este mes, próximo evento
- Bar chart ganancias por mes (solo gigs propios)
- Top lugares más visitados (solo gigs propios)
- Lista próximas tocadas (todas, incluyendo banda, con badge de banda)

#### Tocadas (`/dashboard/gigs`)
- Vista grid y vista por mes
- CRUD completo (crear, editar, eliminar)
- **Selector de banda** en el form (solo bandas donde eres líder)
- **Badge de banda** en las cards
- **Icono candado** en gigs de banda que no son tuyos (no editables)
- **"¿Cuánto te tocó?"** — botón en gigs de banda para registrar tu ganancia personal
- **Detección de conflictos** — aviso y badge amarillo si dos gigs se empalman

#### Bandas (`/dashboard/bands`)
- Sección "Mis Bandas" (soy líder): nombre, código de invitación (copiable), integrantes
- Sección "Bandas en que participo" (soy músico): nombre, encargado, salir
- Modal crear banda
- Modal unirse con código de 6 caracteres
- Modal ver miembros con roles

#### Músicos (`/dashboard/musicians`)
- Libreta de contactos musical personal
- Crear, eliminar
- Sin relación con usuarios de la app

#### Finanzas (`/dashboard/finances`)
- **Todo cuenta:** propios + gigs de banda donde registré mi pago
- Barra anual (ganado vs por cobrar)
- "Ya en tu bolsillo": total, promedio, horas, ingreso/hora
- Comparativa mes vs anterior
- Mejor mes histórico
- "Por cobrar": total esperado, tocadas, horas (con badge de banda)
- Tabla detallada con columna "Mi pago" — muestra "Sin registrar" para gigs de banda sin monto personal

### Detección de conflictos (client-side)

```typescript
function gigsConflict(a: Gig, b: Gig): boolean {
  if (a.date !== b.date) return false;
  const startA = timeToMinutes(a.time);
  const endA = startA + Number(a.hours) * 60;
  const startB = timeToMinutes(b.time);
  const endB = startB + Number(b.hours) * 60;
  return startA < endB && startB < endA;
}
```

Detecta overlap real de tiempo (no solo mismo día). Marca ambos gigs con badge amarillo "Conflicto".

---

## Autenticación y seguridad

### Flujo
1. **Registro:** `POST /users` → bcrypt hash → insert DB
2. **Login:** `POST /users/login` → bcrypt.compare → JWT 24h → cookie "token"
3. **Requests:** Axios interceptor lee cookie → agrega `Authorization: Bearer <token>` automáticamente
4. **Backend:** `authMiddleware` en `/gigs`, `/musicians`, `/bands` valida JWT → `req.user = {id, email, role}`
5. **Rutas Next.js:** `middleware.ts` redirige a `/login` si no hay cookie "token"
6. **Logout:** borra cookie + redirige a `/`

### Auth middleware (`src/middleware/auth.ts`)
```typescript
export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}
// Valida Bearer token, pone req.user, llama next() o retorna 401
```

---

## Flujos principales

### Gig personal
```
Músico → Form sin banda → POST /gigs {user_id=yo, band_id=null}
→ Solo yo lo veo → Cuenta en mis finanzas al 100%
```

### Gig de banda (líder)
```
Líder → Form + selecciona banda → POST /gigs {user_id=líder, band_id=X}
→ Todos los miembros de banda X lo ven en su agenda
→ Solo cuenta en finanzas del líder (con amount del gig)
→ Cada músico puede registrar "mi pago" → PUT /gigs/:id/my-earnings
→ Ese monto SÍ cuenta en las finanzas del músico
```

### Unirse a una banda
```
Encargado comparte código de 6 chars → Músico entra a /dashboard/bands
→ "Unirme con código" → POST /bands/join {invite_code}
→ Se inserta en band_members con role='musician'
→ Ahora ve los gigs de esa banda en su agenda
```

### Detección de conflicto
```
Frontend carga todos mis gigs → getConflictingIds()
→ Compara fecha + rango horario de todos con todos
→ IDs conflictivos marcados con border amarillo + badge "Conflicto"
→ Aviso global en la parte superior de la página
```

---

## Variables de entorno

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (`.env`)
```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://tocadapp_user:PASSWORD@44.214.181.37:5432/tocadapp_db
JWT_SECRET=JeLc2nrm9teNJN9IUFgU+O7fThFk104K
```

---

## Estado actual y pendientes

### Lo que funciona
- [x] Auth completo (registro, login, logout, JWT, cookies)
- [x] Rutas protegidas (middleware.ts en Next.js + authMiddleware en Express)
- [x] CRUD completo de tocadas con auth
- [x] Múltiples bandas (crear, unirse por código, ver miembros, salir, eliminar)
- [x] Agenda compartida (gigs de banda visibles a todos los miembros)
- [x] Selector de banda al crear gig
- [x] Ganancia personal en gigs de banda (`gig_earnings`)
- [x] Finanzas unificadas (propios + banda con mi pago)
- [x] Detección de conflictos de horario
- [x] Dashboard con stats solo de gigs propios
- [x] Badge de banda en gigs y finanzas
- [x] CRUD de músicos (libreta de contactos) con auth
- [x] Sidebar con sección Bandas

### Pendientes de DB
- [ ] **Correr `003_bands_and_user_isolation.sql`** en la DB
- [ ] **Correr `004_gig_earnings.sql`** en la DB

### Pendientes de producto
- [ ] Edición de músicos (solo crear y borrar)
- [ ] Forgot password real (email con link)
- [ ] Middleware.ts de Next.js: actualmente revisa solo cookie, no valida JWT
- [ ] Refresh token (actual dura 24h)
- [ ] Notificaciones cuando el líder crea un gig de banda
- [ ] Exportar finanzas a PDF/Excel
- [ ] Onboarding para nuevos usuarios

---

## Roadmap técnico

### Fase 0 — URGENTE (ya implementado, falta correr migraciones)
- [x] user_id en gigs/musicians
- [x] JWT middleware en Express
- [x] Next.js middleware protegiendo /dashboard
- [x] Bandas con invite code
- [x] Agenda compartida
- [x] Ganancias personales por gig de banda
- [ ] Correr 003 y 004 en DB de producción

### Fase 1 — Pulido UX (~2-3 semanas)
1. Notificación push/email cuando líder agrega gig de banda
2. Edición de músicos
3. Forgot password real
4. Onboarding (tutorial de 3 pasos al registrarse)

### Fase 2 — Monetización (~1 mes)
1. Integrar Stripe con plan Pro
2. Límite de 5 gigs/mes en plan gratuito
3. Bandas ilimitadas en plan Pro
4. Exportar finanzas PDF

### Fase 3 — Crecimiento (~ongoing)
1. App móvil (PWA o React Native)
2. Historial de pagos por banda
3. Reseñas de lugares
4. Directorio de músicos entre bandas
