import { createAxiosManager, createRouteConfig, get, post, put, del } from '../index';


interface UserTest {
  name:string,
  email:string,
}

interface ProductTest {
  name:string,
  price:number,
}

interface ProductSearchRequest {
  name:string,
  limit?: number,
  page: number,
}
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
    getAllWithQuery: get<UserTest,{ limit?: number; offset?: number }>('/users'),
    getById: get('/users/{id}'),
    create: post('/users'),
    update: put('/users/{id}'),
    delete: del('/users/{id}'),
  },
  products: {
    getAll: get<ProductTest[]>('/products'),
    getById: get<ProductTest>('/products/{id}'),
    create: post('/products'),
    update: put<Partial<ProductTest>>('/products/{id}'),
    delete: del('/products/{id}'),
    search: get<ProductTest[], ProductSearchRequest>('/products/search'),
  },
} as const);

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
  const users = await api.users.getAll<UserTest[]>();
  // users es de tipo {name:"user"}[]
  const usersWithQuery = await api.users.getAllWithQuery({ limit: 10, offset: 0 });
  // Con query params - TypeScript infiere que necesitas el objeto
  const products = await api.products.search({ name: 'laptop', page: 1 });
  // products es de tipo {name:"product"}[]
  
  // 2. ✅ Path bindings funcionan correctamente
  const user = await api.users.getById({ id: 123 });
  // user es de tipo {name:"user"}
  
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

  const getProductById = await api.products.getById({ id: 456 });
}
// Exportar para uso en toda la aplicación
export { manager, api };
export type { ApiRoutes };
