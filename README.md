# Typed Axios Manager

Un gestor de axios fuertemente tipado con autocompletado inteligente, soporte para rutas dinámicas y parámetros de consulta opcionales.

## 🚀 Características

- ✅ **TypeScript First**: Tipado fuerte con autocompletado inteligente
- ✅ **Query Params Opcionales**: No más objetos vacíos obligatorios
- ✅ **Path Bindings**: Soporte para rutas dinámicas con `{param}`
- ✅ **Framework Agnostic**: Funciona con React, Vue, Node.js, Next.js, Astro
- ✅ **Sin Dependencias de Estado**: No requiere Redux ni ningún estado específico
- ✅ **Testing Ready**: Tests incluidos con Vitest
- ✅ **ESM + CommonJS**: Compatible con ambos sistemas de módulos
- ✅ **Hooks de React Opcionales**: Usa los hooks si quieres, no es obligatorio

## 📦 Instalación

```bash
npm install typed-axios-manager axios
# o
yarn add typed-axios-manager axios
# o
pnpm add typed-axios-manager axios
```

## 🔧 Uso Básico

### 1. Define tus rutas

```typescript
import { createAxiosManager, createRouteConfig, get, post, put, del } from 'typed-axios-manager';

const apiRoutes = createRouteConfig({
  auth: {
    login: post('/auth/login'),
    register: post('/auth/register'),
    me: get('/auth/me'),
  },
  users: {
    getAll: get('/users'),
    getById: get('/users/{id}'), // Ruta dinámica
    create: post('/users'),
    update: put('/users/{id}'),
    delete: del('/users/{id}'),
    search: get('/users/search'), // Con query params
  },
  products: {
    getAll: get('/products'),
    getById: get('/products/{id}'),
    search: get('/products/search'), // query params opcionales
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
// ✅ Query params realmente opcionales
const users = await api.users.getAll(); // No requiere argumentos

// ✅ Con query params cuando los necesites
const products = await api.products.search({ 
  q: 'laptop', 
  limit: 10,
  sort: 'price_asc' 
});

// ✅ Path bindings funcionan perfectamente
const user = await api.users.getById({ id: 123 });

// ✅ Body params bien tipados
const newUser = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// ✅ Combinación de todos los parámetros
const updatedUser = await api.users.update(
  { name: 'John Doe', email: 'john@example.com' }, // body
  undefined, // query params opcionales
  { id: 123 } // path bindings
);
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

### Response Wrapper Personalizado

```typescript
const manager = createAxiosManager({
  baseURL: 'https://api.example.com',
  responseWrapper: {
    codeKey: 'status',
    statusKey: 'httpStatus',
    messageKey: 'msg',
    dataKey: 'result'
  }
});
```

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

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ver cobertura
npm run test:coverage

# UI interactivo
npm run test:ui
```

Ejemplo de test:

```typescript
import { describe, it, expect } from 'vitest';
import { createAxiosManager, createRouteConfig, get } from 'typed-axios-manager';

describe('API Tests', () => {
  const routes = createRouteConfig({
    users: {
      getAll: get('/users'),
      getById: get('/users/{id}'),
    },
  });

  const manager = createAxiosManager<typeof routes>({
    baseURL: 'https://api.test.com',
  });

  const api = manager.createTypedRoutes(routes);

  it('should not require query params', async () => {
    // ✅ Esto compila sin errores
    const users = await api.users.getAll();
    expect(users).toBeDefined();
  });

  it('should work with path bindings', async () => {
    const user = await api.users.getById({ id: 123 });
    expect(user).toBeDefined();
  });
});
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

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Axios](https://github.com/axios/axios) por el increíble cliente HTTP
- La comunidad de TypeScript por hacer el tipado tan poderoso