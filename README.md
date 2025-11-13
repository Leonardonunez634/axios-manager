# Typed Axios Manager

Un gestor de axios fuertemente tipado con autocompletado inteligente, soporte para rutas dinámicas y parámetros de consulta opcionales.

Comentario del Creador:
Por que cree este typed manager?
Cuando inicie el camino en la programacion, me incertaron en la mente que hay que hacer las cosas de la manera más 
eficiente posible. Siempre buscar optimizar el codigo,funciones pero tambien nuestra forma de codear.
Hoy con la IA podemos ser muy eficientes, pero no hay que dejar de crear las herramientas que mantengan organizado
nuestros proyecto y mejorar nuestra experiencia de desarrollo.

Arranque creando archivos para todos los path. 
Rapidamente se convirtio en un sin fin de constantes.

Un claro ejemplo que seguramente todos recordaremos:
```
const PATH_CREATE_USER = "/api/user/"
const PATH_GET_USER = (id: number)=>`/api/user/${id}`
const PATH_UPDATE_USER = (id: number)=> `/api/user/${id}`
...
```

Y mientras buscaba proyectos mas grandes, surgio la necesidad de organizar esto diferente
Probe con una carpeta API y archivos x endpoint

```
api/
├── auth/
│   ├── login.ts
│   ├── register.ts
│   ├── me.ts
├── users/
│   ├── getAll.ts
│   ├── getById.ts
│   ├── create.ts
│   ├── update.ts
│   ├── delete.ts
│   ├── search.ts
├── products/
│   ├── getAll.ts
│   ├── getById.ts
│   ├── search.ts
```

Pero no resolvia el problema de las constantes, y los archivos crecian sin parar. Sin contar que cuando empezas, tenes poca organizacion. Cambias objetos, se te rompen request y despues anda a acordarte donde esta y que cambio.
Cosas como tener que cambiar el path en MIL lugares, cuando deberia cambiarlo en 1.

Despues conoci React - con sus miles de componentes (los que yo creaba) + Axios
Y facilmente empece a crear axios.get("y un path") en un componente, y luego usar en otro, y asi sucesivamente.

Que archivo use? En que componente esta? en un child-component del form?
Organizarme es fundamental. Los proyectos grandes requieren que seamos desarrolladores organizados.

En mi experiencia pase por Redux, Zustand, librerias que me gustan mucho por la organizacion
Aunque el que tiene que mejorar en organizacion soy yo, me inspire en la forma en la que ellos tienen sus generadores.

Dije: esto, para un axios, estaria barbaro. 

Empece a probar, genere varias versiones, y ahora me siento lo suficientemente confiado para mostrar este invento.

Lo tengo funcionando en 2 proyectos. Esta es la primera version que subo porque quiero que sea una dependencia en y no un conjunto de archivos dentro de /helper.

La idea es tener mas organizado los proyectos y la conexion con el backend, en un solo archivo
Una unica fuente de la verdad
Menos erroes, mas proyectos, mas rapido, mas $$$$

Si a alguien le sirve, encantado de saberlo.
Happy Coding! 

## 🚀 Características

-  **TypeScript First**: Tipado fuerte con autocompletado inteligente
-  **Query Params Opcionales**: No más objetos vacíos obligatorios
-  **Path Bindings**: Soporte para rutas dinámicas con `{param}`
-  **Framework Agnostic**: Funciona con React, Vue, Node.js, Next.js, Astro
-  **Sin Dependencias de Estado**: No requiere Redux ni ningún estado específico
-  **Testing Ready**: Tests incluidos con Vitest
-  **ESM + CommonJS**: Compatible con ambos sistemas de módulos
-  **Hooks de React Opcionales**: Usa los hooks si quieres, no es obligatorio

## 📦 Instalación

```bash
npm install typed-axios-manager axios

```

## 🔧 Uso Básico

### 1. Define tus rutas

```typescript
import { createRouteConfig, get, post, put, del } from 'typed-axios-manager';

type User = { name: string; email: string };
type Product = { name: string; price: number };
type ProductSearchRequest = { name: string; limit?: number; page: number };

const apiRoutes = createRouteConfig({
  auth: {
    login: post('/auth/login'),
    register: post('/auth/register'),
    me: get('/auth/me'),
  },
  users: {
    getAll: get<User[]>('/users'),
    getById: get<User>('/users/{id}'), // Ruta dinámica
    create: post<{ name: string; email: string }, User>('/users'),
    update: put<Partial<User>>('/users/{id}'),
    delete: del('/users/{id}'),
    search: get<User[], { q: string; limit?: number }>('/users/search'), // Con query params
  },
  products: {
    getAll: get<Product[]>('/products'),
    getById: get<Product>('/products/{id}'),
    search: get<Product[], ProductSearchRequest>('/products/search'), // query params opcionales
  },
});

type ApiRoutes = typeof apiRoutes;
```

### 2. Crea el manager

```typescript
const manager = createAxiosManager<ApiRoutes>({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

// Crea las funciones tipadas
const api = manager.createTypedRoutes(apiRoutes);
```

### 3. Usa las funciones

```typescript
// Query params realmente opcionales
const users = await api.users.getAll(); // No requiere argumentos

//  Con query params cuando los necesites
const products = await api.products.search({ 
  q: 'laptop', 
  limit: 10,
  sort: 'price_asc' 
});

//  Path bindings funcionan perfectamente
const user = await api.users.getById({ id: 123 });

//  Body params bien tipados
const newUser = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});
```

## 🧩 Ejemplos de Query Params

### Declarar rutas con tipos de query

```typescript
import { createRouteConfig, get, post, patch } from 'typed-axios-manager';

const routes = createRouteConfig({
  users: {
    search: get<unknown, { q: string; limit?: number }>('/users/search'),
    getById: get<unknown, { include?: 'profile' | 'roles' }>('/users/{id}'),
    create: post<{ name: string; email: string }, unknown, { sendWelcomeEmail?: boolean }>('/users'),
    partialUpdate: patch<{ name?: string; email?: string }, unknown, { notify?: boolean }>('/users/{id}'),
  },
});
```

### Llamadas con y sin query

```typescript
// GET sin query
await api.users.search();

// GET con query tipada
await api.users.search({ q: 'neo', limit: 10 });

// GET con bindings y query
await api.users.getById({ include: 'profile' }, { id: 1 });

// POST con body, sin query
await api.users.create({ name: 'John', email: 'john@example.com' });

// POST con body y query
await api.users.create(
  { name: 'John', email: 'john@example.com' },
  { sendWelcomeEmail: true }
);

// PATCH con body y bindings
await api.users.partialUpdate({ name: 'John' }, { id: 1 });

// PATCH con body, query y bindings
await api.users.partialUpdate(
  { name: 'John' },
  { notify: true },
  { id: 1 }
);
```

## � Orden de argumentos y bindings

Los helpers aceptan argumentos en un orden consistente que determina cómo se construye la `request` de axios:

```typescript
// GET / DELETE
// Sin bindings: (query?)
await api.users.getAll();
await api.users.search({ q: 'neo', limit: 10 });

// Con bindings: (bindings) o (query, bindings)
await api.users.getById({ id: 1 });
await api.users.getById({ include: 'profile' }, { id: 1 });

// POST / PUT / PATCH
// Sin bindings: (body, query?)
await api.users.create({ name: 'John', email: 'john@example.com' });
await api.users.create({ name: 'John', email: 'john@example.com' }, { sendWelcomeEmail: true });

// Con bindings: (body, bindings) o (body, query, bindings)
await api.users.update({ name: 'Jane' }, { id: 3 });
await api.users.partialUpdate({ name: 'Neo' }, { notify: true }, { id: 99 });
```

- `bindings` reemplaza variables de ruta `{id}` en el `url` (ver `src/core/AxiosManager.ts:113-121`).
- `query` se envía como `axios` `params` (ver GET/DELETE en `src/core/AxiosManager.ts:75-86`).
- `body` se envía como `axios` `data` (ver POST/PUT/PATCH en `src/core/AxiosManager.ts:101-106`).

Esto permite que las firmas sean limpias y que el `path` se infiera directamente del argumento de la función, evitando repetirlo en los genéricos.

## �📘 Uso de TypeScript

### Tipar rutas y obtener funciones tipadas

```typescript
const routes = createRouteConfig({
  products: {
    getAll: get('/products'),
    search: get<{ q: string; limit?: number }>('/products/search'),
  },
});

type Routes = typeof routes;
const manager = createAxiosManager<Routes>({ baseURL: 'https://api.example.com' });
const api = manager.createTypedRoutes(routes);
```

### Tipar la respuesta de las llamadas

```typescript
type Product = { id: number; name: string };

const products = await api.products.getAll<Product[]>();
// products.data: Product[]

const searched = await api.products.search<Product[]>({ q: 'laptop', limit: 5 });
// searched.data: Product[]
```

### Tipos auxiliares disponibles

```typescript
import type { QueryParams, PathBindings, ResponseWrapper } from 'typed-axios-manager';

const qp: QueryParams = { q: 'neo', limit: 10 };
const pb: PathBindings = { id: 1 };
const res: ResponseWrapper<{ ok: boolean }> = { code: 'SUCCESS', httpStatus: 200, message: 'OK', data: { ok: true } };
```

## 🎯 Uso con React (Opcional)

### Con Hooks

```tsx
import { useApiCall, useAuth } from 'typed-axios-manager';

function UserProfile({ userId }: { userId: number }) {
  const { execute, loading, error, data: user } = useApiCall(manager);

  useEffect(() => {
    execute(() => api.users.getById({ id: userId }));
  }, [userId, execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Con Context Provider

```tsx
import { createAxiosContext } from 'typed-axios-manager';

const { Provider: AxiosProvider, useApi, useManager } = createAxiosContext<ApiRoutes>();

function App() {
  return (
    <AxiosProvider manager={manager}>
      <YourComponents />
    </AxiosProvider>
  );
}

function YourComponent() {
  const api = useApi();
  const manager = useManager();
  
  // Usa api.auth.login(), api.users.getAll(), etc.
}
```

## 🛠️ Uso con Node.js/Next.js/Astro

```typescript
// server/api.ts
import { createAxiosManager, createRouteConfig, get, post } from 'typed-axios-manager';

const routes = createRouteConfig({
  posts: {
    getAll: get('/posts'),
    create: post('/posts'),
  },
});

const apiManager = createAxiosManager<typeof routes>({
  baseURL: process.env.API_URL || 'https://api.example.com',
});

export const api = apiManager.createTypedRoutes(routes);

// pages/api/posts.ts (Next.js)
import { api } from '../server/api';

export default async function handler(req, res) {
  try {
    const posts = await api.posts.getAll();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## ⚙️ Configuración Avanzada

### Headers Dinámicos

```typescript
// Establecer token de autenticación
manager.setAuthToken('your-jwt-token');

// Agregar headers personalizados
manager.setHeader('X-Custom-Header', 'value');

// Remover token
manager.removeAuthToken();
```

### Múltiples Instancias

```typescript
const publicApi = createAxiosManager({ 
  baseURL: 'https://api.public.com' 
});

const privateApi = createAxiosManager({ 
  baseURL: 'https://api.private.com' 
});

const publicRoutes = publicApi.createTypedRoutes(publicRouteConfig);
const privateRoutes = privateApi.createTypedRoutes(privateRouteConfig);
```

## 📚 API Reference

### `createAxiosManager(config)`

Crea una nueva instancia del manager.

**Parámetros:**
- `baseURL?: string` - URL base para todas las peticiones
- `timeout?: number` - Timeout en milisegundos (default: 5000)
- `headers?: Record<string, string>` - Headers por defecto
- `responseWrapper?: object` - Configuración del wrapper de respuesta

**Retorna:** `AxiosManager<T>`

### `createRouteConfig(config)`

Crea una configuración de rutas tipadas.

**Retorna:** `T` (tipado según tu configuración)

### Helpers de rutas

- `get(path)` - GET request
- `post(path)` - POST request  
- `put(path)` - PUT request
- `del(path)` - DELETE request
- `patch(path)` - PATCH request

### Manager Methods

- `createTypedRoutes(config)` - Crea las funciones tipadas
- `setHeader(key, value)` - Establece un header
- `setAuthToken(token)` - Establece token de auth
- `removeAuthToken()` - Remueve el token
- `getInstance()` - Obtiene la instancia de axios

### React Hooks (opcionales)

- `useApiCall(manager)` - Hook para llamadas con loading/error states
- `useAuth(manager)` - Hook para autenticación
- `createAxiosContext()` - Crea context provider

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
