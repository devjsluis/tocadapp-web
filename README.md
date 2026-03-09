# TocadApp — Frontend

Aplicación web para músicos que quieren llevar el control de sus tocadas, finanzas y banda.
Construida con **Next.js 16**, **React 19** y **Tailwind CSS 4**.

---

## Índice

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Páginas y rutas](#páginas-y-rutas)
- [Componentes](#componentes)
- [Servicios](#servicios)
- [Tecnologías](#tecnologías)
- [Convenciones de código](#convenciones-de-código)

---

## Requisitos

- Node.js 18+
- npm 9+
- API backend corriendo (ver `tocadapp-api/README.md`)

---

## Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local

# Correr en desarrollo
npm run dev
```

La app queda disponible en `http://localhost:3000`.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

| Variable              | Descripción               | Ejemplo                 |
|-----------------------|---------------------------|-------------------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API backend | `http://localhost:4000` |

---

## Estructura del proyecto

```
tocadapp-web/
├── app/                        # Rutas (Next.js App Router)
│   ├── layout.tsx              # Layout raíz: fuentes y metadata global
│   ├── page.tsx                # Landing page (/)
│   ├── login/page.tsx          # Inicio de sesión
│   ├── register/page.tsx       # Registro de cuenta
│   ├── forgot-password/page.tsx
│   └── dashboard/
│       ├── layout.tsx          # Layout del dashboard con Sidebar
│       ├── page.tsx            # Inicio (/dashboard)
│       ├── gigs/page.tsx       # Tocadas
│       ├── finances/page.tsx   # Finanzas
│       └── musicians/page.tsx  # Músicos de la banda
│
├── components/
│   ├── Sidebar.tsx             # Nav lateral (desktop) + bottom nav (mobile)
│   ├── customized/
│   │   └── NavbarLanding.tsx   # Navbar de la landing page
│   └── ui/                     # Componentes base (Radix UI + Tailwind)
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── sonner.tsx
│
├── services/
│   └── auth.service.ts         # Registro y login
│
├── lib/
│   ├── axios.ts                # Instancia Axios con baseURL
│   └── utils.ts                # cn() para merge de clases Tailwind
│
└── types/
    └── auth.ts                 # Interfaces TypeScript de autenticación
```

---

## Páginas y rutas

### Públicas

| Ruta               | Descripción                                         |
|--------------------|-----------------------------------------------------|
| `/`                | Landing: hero, features, precios y contacto         |
| `/login`           | Inicio de sesión                                    |
| `/register`        | Registro de cuenta nueva                            |
| `/forgot-password` | Solicitud de recuperación de contraseña             |

### Dashboard (requieren sesión activa)

| Ruta                    | Descripción                                                      |
|-------------------------|------------------------------------------------------------------|
| `/dashboard`            | Stats, gráfica de ganancias, lugares top, próximos eventos       |
| `/dashboard/gigs`       | Crear, editar y eliminar tocadas. Vista grid o agrupada por mes  |
| `/dashboard/finances`   | Ganado real vs por cobrar, comparativa mensual, tabla detallada  |
| `/dashboard/musicians`  | Agregar y eliminar integrantes de la banda                       |

---

## Componentes

### `Sidebar`
Navegación principal del dashboard.
- **Desktop**: barra lateral fija de 256px con links y botón de logout
- **Mobile**: barra inferior fija con íconos y etiquetas
- Usa `usePathname()` para resaltar la ruta activa en morado

### `NavbarLanding`
Navbar de la página de inicio.
- Hace scroll a las secciones del landing al hacer clic
- Si el usuario tiene token en cookies muestra "Ir al Dashboard"

### Componentes UI (`components/ui/`)

Wrappers sobre **Radix UI** estilizados con Tailwind CSS:

| Componente | Descripción                                   |
|------------|-----------------------------------------------|
| `Button`   | Botón con variantes (`default`, `ghost`, etc.) usando CVA |
| `Input`    | Campo de texto estilizado                     |
| `Label`    | Etiqueta accesible (Radix Label)              |
| `Select`   | Selector dropdown accesible (Radix Select)    |

---

## Servicios

### `auth.service.ts`

Funciones para autenticación contra la API:

```ts
/**
 * Registra un nuevo usuario.
 * @param userData - Datos del formulario de registro
 * @returns El usuario creado
 */
register(userData: RegisterRequest): Promise<User>

/**
 * Inicia sesión.
 * Guarda el JWT en una cookie ("token", expira en 1 día)
 * y lo inyecta en el header Authorization de Axios.
 * @param credentials - Email y contraseña
 * @returns Token JWT + datos básicos del usuario
 */
login(credentials: { email: string; password: string }): Promise<LoginResponse>
```

### `lib/axios.ts`

Instancia de Axios preconfigurada:
- `baseURL` apunta a `NEXT_PUBLIC_API_URL`
- Header por defecto: `Content-Type: application/json`
- Al autenticarse se inyecta `Authorization: Bearer <token>` para todas las peticiones siguientes

---

## Tecnologías

| Tecnología    | Versión  | Uso                                      |
|---------------|----------|------------------------------------------|
| Next.js       | 16.1.2   | Framework con App Router                 |
| React         | 19.2.3   | UI                                       |
| TypeScript    | 5        | Tipado estático                          |
| Tailwind CSS  | 4        | Estilos utilitarios                      |
| Radix UI      | 1.4.3    | Componentes accesibles sin estilos       |
| Axios         | 1.13.5   | Cliente HTTP                             |
| js-cookie     | 3.0.5    | Manejo de cookies para el JWT            |
| Lucide React  | 0.562.0  | Íconos                                   |
| Recharts      | 2.x      | Gráfica de barras (dashboard/finances)   |
| Sonner        | 2.0.7    | Notificaciones toast                     |

---

## Convenciones de código

- **Client components**: todos los componentes del dashboard usan `"use client"` (necesitan hooks)
- **Fechas sin timezone**: se usa `parseLocalDate(str)` que parsea `YYYY-MM-DD` como fecha local y evita el desfase de UTC
- **Formato de moneda**: `toLocaleString("en-US", { minimumFractionDigits: 2 })` → `1,234.56`
- **Empty states**: cuando un arreglo está vacío siempre se muestra ícono + mensaje, nunca pantalla en blanco
- **Skeletons**: `animate-pulse` con divs de `bg-zinc-800` mientras carga la data de la API
- **Confirmaciones destructivas**: modal propio (no `window.confirm`) antes de eliminar registros
