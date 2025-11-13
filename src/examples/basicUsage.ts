import { createAxiosManager, createRouteConfig, get, post, put, del } from '../index';

// Definir las rutas con el helper
const apiRoutes = createRouteConfig({
  auth: {
    login: post('/auth/login'),
    register: post('/auth/register'),
    logout: post('/auth/logout'),
    me: get('/auth/me'),
  },
  users: {
    getAll: get('/users'),
    getById: get('/users/{id}'),
    create: post('/users'),
    update: put('/users/{id}'),
    delete: del('/users/{id}'),
  },
  products: {
    getAll: get('/products'),
    getById: get('/products/{id}'),
    create: post('/products'),
    update: put('/products/{id}'),
    delete: del('/products/{id}'),
    search: get<{ q: string; limit?: number }>('/products/search'),
  },
});

// Crear el manager
type ApiRoutes = typeof apiRoutes;
const manager = createAxiosManager<ApiRoutes>({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// Crear las funciones tipadas
const api = manager.createTypedRoutes(apiRoutes);

// Ejemplos de uso con los problemas resueltos:

// 1. ✅ Query params realmente opcionales
async function examples() {
  // Sin query params - NO requiere argumentos
  const users = await api.users.getAll();
  
  // Con query params - TypeScript infiere que necesitas el objeto
  const products = await api.products.search({ q: 'laptop', limit: 10 });
  
  // 2. ✅ Path bindings funcionan correctamente
  const user = await api.users.getById({ id: 123 });
  
  // 3. ✅ Body params bien tipados
  const newUser = await api.auth.login({
    email: 'user@example.com',
    password: 'password123'
  });
  
  // 4. ✅ Combinación de parámetros
  const updatedUser = await api.users.update(
    { name: 'John Doe', email: 'john@example.com' },
    { id: 123 }
  );
}

api.products.search()
// Exportar para uso en toda la aplicación
export { manager, api };
export type { ApiRoutes };
