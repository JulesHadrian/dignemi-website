# DIGNEMI Admin - Guía de Arquitectura

## Descripción del Proyecto

**DIGNEMI Admin** es un panel de administración para gestionar contenido de salud mental, incluyendo rutas terapéuticas, actividades, biblioteca de recursos y ayuda en crisis. El sistema permite a los administradores crear, editar y publicar contenido estructurado para una aplicación de bienestar mental.

**Puerto de desarrollo**: `3001` (configurado en package.json)

---

## Stack Tecnológico

### Frontend Core
- **Next.js 16.1.6** - Framework React con App Router
- **React 19.2.3** - UI Library (versión más reciente)
- **TypeScript 5** - Type safety y developer experience
- **TailwindCSS 4** - Utility-first CSS framework

### Librerías Clave
- **@tanstack/react-query 5.90.20** - Server state management, data fetching y caching
- **zustand 5.0.11** - Client state management (usado para auth)
- **axios 1.13.4** - HTTP client con interceptores
- **react-hook-form 7.71.1** - Form handling
- **zod 4.3.6** - Schema validation
- **@hookform/resolvers 5.2.2** - Integración RHF + Zod

### UI/UX
- **lucide-react 0.563.0** - Icon library
- **@dnd-kit** - Drag and drop functionality para ordenar bloques
  - `@dnd-kit/core 6.3.1`
  - `@dnd-kit/sortable 10.0.0`
  - `@dnd-kit/utilities 3.2.2`

### Autenticación
- **jwt-decode 4.0.0** - Decodificar JWT tokens

---

## Arquitectura del Proyecto

### Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: páginas de autenticación
│   │   ├── login/
│   │   └── verify/
│   ├── (dashboard)/              # Route group: páginas protegidas
│   │   ├── dashboard/
│   │   │   ├── activities/       # CRUD de actividades
│   │   │   ├── routes/          # CRUD de rutas terapéuticas
│   │   │   │   └── [id]/        # Editor de rutas (drag & drop)
│   │   │   └── page.tsx         # Dashboard principal
│   │   └── layout.tsx           # Layout con sidebar y auth protection
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Página principal (/)
│   └── globals.css              # Estilos globales + Tailwind imports
│
├── components/
│   ├── admin/                   # Componentes específicos del admin
│   │   └── sortable-item.tsx    # Wrapper para dnd-kit
│   ├── providers/               # Context providers
│   │   └── query-provider.tsx   # TanStack Query provider
│   └── ui/                      # Componentes UI reutilizables
│       └── status-badge.tsx     # Badge de estados (draft, published, etc.)
│
├── lib/
│   └── api-client.ts            # Instancia de axios configurada
│
├── services/
│   ├── auth-service.ts          # Lógica de autenticación
│   └── content-service.ts       # Llamadas API para contenido
│
├── store/
│   └── auth-store.ts            # Zustand store para autenticación
│
└── types/
    ├── auth.ts                  # Tipos de User, Auth, etc.
    └── content.ts               # Tipos de Route, Activity, Topic, etc.
```

### Route Groups

El proyecto usa **route groups** de Next.js para organizar rutas sin afectar la URL:

- `(auth)` - Páginas públicas de autenticación
- `(dashboard)` - Páginas protegidas que requieren autenticación

---

## Patrones de Arquitectura

### 1. Servicios Centralizados

Todas las llamadas API están centralizadas en la carpeta `services/`:

```typescript
// src/services/content-service.ts
export const contentService = {
  getRoutes: async (): Promise<Route[]> => {
    const response = await apiClient.get('/content/catalog');
    return response.data;
  },
  createRoute: async (data: any) => {
    return await apiClient.post('/content', data);
  }
};
```

### 2. API Client con Interceptores

El archivo [lib/api-client.ts](src/lib/api-client.ts) configura axios con:

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` o `http://localhost:3000/v1`
- **Request Interceptor**: Inyecta automáticamente el token JWT en cada request
- **Response Interceptor**: Maneja errores 401 (sesión expirada) y redirige al login

```typescript
// Interceptor de request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response (401 handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. State Management

**Zustand** para client state (autenticación):
- Store persistido en localStorage como `dignemi-auth-storage`
- Maneja: `token`, `user`, `isAuthenticated`
- Ver: [store/auth-store.ts](src/store/auth-store.ts)

**TanStack Query** para server state:
- Caching automático de datos del servidor
- Revalidación en background
- Provider configurado en [components/providers/query-provider.tsx](src/components/providers/query-provider.tsx)

### 4. Form Validation

**React Hook Form + Zod** para todos los formularios:

```typescript
const routeSchema = z.object({
  title: z.string().min(5, 'Título requerido'),
  slug: z.string().min(3),
  topic: z.string().min(1, 'Selecciona un tema'),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  paywall: z.enum(['free', 'pro']),
  status: z.enum(['draft', 'review', 'published']),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(routeSchema),
  defaultValues: { status: 'draft' }
});
```

### 5. Protección de Rutas

El layout del dashboard [app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) protege todas las rutas:

```typescript
useEffect(() => {
  const checkAuth = setTimeout(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, 100);
  return () => clearTimeout(checkAuth);
}, [isAuthenticated, router]);
```

---

## Tipos de Contenido (Data Models)

El sistema maneja varios tipos de contenido definidos en [types/content.ts](src/types/content.ts):

### Entidades Principales

1. **Route (Ruta Terapéutica)**
   - Programa estructurado de múltiples días
   - Cada día contiene bloques (lecciones, actividades, reflexiones)
   - Estados: `draft`, `review`, `published`, `archived`
   - Niveles: `basic`, `intermediate`, `advanced`
   - Paywall: `free`, `pro`

2. **Activity (Ejercicio/Actividad)**
   - Tipos: `breathing_timer`, `grounding`, `checklist`, `reflection`, etc.
   - Incluye instrucciones, pasos, configuración de timer
   - Relacionada con topics

3. **Topic (Tema)**
   - Categorías principales: ansiedad, sueño, autoestima, etc.
   - Usados para organizar routes y activities

4. **Library Item**
   - Contenido educativo: artículos, guías, FAQs
   - Rich text content con fuentes citadas

5. **Help Resource**
   - Recursos de ayuda en crisis
   - Números de emergencia por país/locale

### Estados del Contenido

```typescript
type ContentStatus = 'draft' | 'review' | 'published' | 'archived';
type PaywallType = 'free' | 'pro';
type Difficulty = 'basic' | 'intermediate' | 'advanced';
```

---

## Funcionalidades Clave

### Editor de Rutas con Drag & Drop

El editor de rutas [app/(dashboard)/dashboard/routes/[id]/page.tsx](src/app/(dashboard)/dashboard/routes/[id]/page.tsx) es una de las features más complejas:

**Características**:
- Layout de 3 columnas: Metadata | Builder | Preview
- Navegación por días (tabs)
- Drag & Drop para reordenar bloques dentro de un día
- Calculadora de tiempo total
- Preview en tiempo real estilo mobile
- Tipos de bloques: lesson, activity, reflection, checklist

**Tecnologías usadas**:
- `@dnd-kit` para drag and drop
- React Hook Form para metadata
- Local state (useState) para la estructura de días/bloques

### Sidebar de Navegación

El dashboard incluye un sidebar colapsable con las siguientes secciones:

- Dashboard principal
- Rutas (programas terapéuticos)
- Actividades (ejercicios individuales)
- Biblioteca (contenido educativo)
- Disclaimers (avisos legales)
- Ayuda Ahora (recursos de crisis)
- Temas y Tags
- Publicaciones (releases/versiones)
- Auditoría (logs)
- Configuración

---

## Flujo de Autenticación

1. **Login** → [app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx)
   - Usuario ingresa credenciales
   - `authService.login()` hace POST a `/auth/login`
   - Recibe token JWT + datos de usuario

2. **Almacenamiento**
   - Token guardado en `localStorage` como `auth_token`
   - Store Zustand persiste user data como `dignemi-auth-storage`

3. **Verificación** (opcional)
   - Si requiere 2FA, redirige a `/verify`
   - Confirma código y actualiza estado

4. **Protección de Rutas**
   - Layout del dashboard verifica `isAuthenticated`
   - Redirige a `/login` si no está autenticado

5. **Logout**
   - Limpia `localStorage`
   - Resetea Zustand store
   - Redirige a `/login`

6. **Token Refresh**
   - Interceptor axios detecta 401
   - Limpia storage y fuerza logout

---

## Convenciones de Código

### Naming Conventions

- **Componentes**: PascalCase (`RouteEditorPage`, `SortableItem`)
- **Archivos**: kebab-case para archivos normales, PascalCase para componentes
- **Tipos**: PascalCase para interfaces/types (`Route`, `Activity`)
- **Constantes**: SCREAMING_SNAKE_CASE si son globales
- **Funciones**: camelCase (`getRoutes`, `createRoute`)

### Organización de Imports

```typescript
// 1. Imports externos
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// 2. Imports de librerías de UI
import { ArrowLeft, Save } from 'lucide-react';

// 3. Imports locales (components, services, types)
import { SortableItem } from '@/components/admin/sortable-item';
import { contentService } from '@/services/content-service';
```

### Estructura de Componentes

```typescript
// 1. Tipos y Schemas
const schema = z.object({...});
type FormValues = z.infer<typeof schema>;

// 2. Componente
export default function MyComponent() {
  // 3. Hooks
  const [state, setState] = useState();
  const { data } = useQuery(...);

  // 4. Funciones auxiliares
  const handleSubmit = () => {...};

  // 5. Render
  return (...);
}

// 6. Helpers fuera del componente
function helperFunction() {...}
```

### Client Components

La mayoría de componentes del dashboard son `'use client'` porque usan:
- State (`useState`, `useEffect`)
- Event handlers
- Browser APIs (`localStorage`, `window`)

---

## API Integration

### Endpoints Base

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` → `/v1`
- **Auth**: `/auth/login`, `/auth/verify`
- **Content**: `/content/catalog` (GET routes), `/content` (POST create)

### Variables de Entorno

Crear un archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

---

## Scripts de Desarrollo

```bash
# Desarrollo (puerto 3001)
npm run dev

# Build de producción
npm run build

# Start production server (puerto 3001)
npm run start

# Lint
npm run lint
```

---

## Mejores Prácticas

### 1. Siempre usar el apiClient
No crear instancias de axios manualmente. El apiClient ya maneja:
- Headers
- Auth tokens
- Error handling

### 2. Centralizar llamadas API en services
No hacer `fetch` o `axios` directamente en componentes.

### 3. Usar React Query para data fetching
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['routes'],
  queryFn: contentService.getRoutes
});
```

### 4. Validar todos los formularios
Usar Zod + React Hook Form para validación consistente.

### 5. Tipos estrictos
Aprovechar TypeScript al máximo. Evitar `any` salvo casos excepcionales.

### 6. Responsive Design
Tailwind está configurado con breakpoints:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)

Ejemplo: `col-span-12 lg:col-span-3` (full width en mobile, 25% en desktop)

---

## Debugging

### Verificar Token JWT
```typescript
// En DevTools Console
localStorage.getItem('auth_token')
```

### Ver Store de Zustand
```typescript
// En DevTools Console
JSON.parse(localStorage.getItem('dignemi-auth-storage'))
```

### React Query DevTools
Considera agregar `@tanstack/react-query-devtools` para desarrollo.

---

## Próximos Pasos Comunes

1. **Crear nueva ruta de contenido**
   - Agregar página en `app/(dashboard)/dashboard/[nueva-seccion]/`
   - Crear service en `services/`
   - Definir tipos en `types/`
   - Agregar item al menú en el layout

2. **Agregar nuevo tipo de bloque**
   - Actualizar `BlockType` en el editor de rutas
   - Agregar icono y color en helpers
   - Implementar renderizado en preview

3. **Integrar nuevo endpoint**
   - Agregar método en el service correspondiente
   - Usar con React Query en el componente
   - Manejar loading/error states

---

## Notas Importantes

- **Puerto 3001**: El proyecto corre en puerto 3001 para no colisionar con otras apps
- **TypeScript strict**: Aprovechar al máximo el type checking
- **Auth requerido**: Todas las rutas `/dashboard/*` están protegidas
- **Drag & Drop**: Requiere configuración especial de sensores (ver `activationConstraint` para evitar conflictos con inputs)

---

## Contacto y Recursos

- **Repositorio**: [Agregar URL si aplica]
- **API Docs**: [Agregar URL de Swagger/Postman si existe]
- **Figma/Diseño**: [Agregar URL si aplica]
