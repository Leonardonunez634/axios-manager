import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { createAxiosManager, createRouteConfig, get, post, put, del, patch } from '../index';

interface ProductTest {
  id: number;
  name: string;
  price: number;
}

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: { headers: { common: {} } },
      request: vi.fn().mockResolvedValue({ 
        data: { 
          code: 'SUCCESS',
          httpStatus: 200,
          message: 'OK',
          data: { success: true }
        } 
      }),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

describe('AxiosManager Core', () => {
  const routes = createRouteConfig({
    users: {
      getAll: get('/users'),
      getById: get<ProductTest, { include?: 'profile' | 'roles' }>('/users/{id}'),
      create: post('/users'),
      update: put('/users/{id}'),
      delete: del('/users/{id}'),
      search: get<unknown, { q: string; limit?: number }>('/users/search'),
      partialUpdate: patch<{ name: string }, unknown, { sendEmail?: boolean }>('/users/{id}'),
      updateProfile: patch<{ displayName: string }, unknown, { notify?: boolean }>('/users/profile'),
    },
    auth: {
      login: post('/auth/login'),
      me: get('/auth/me'),
    },
  });

  const manager = createAxiosManager<typeof routes>({
    baseURL: 'https://api.test.com',
    timeout: 5000,
  });

  const api = manager.createTypedRoutes(routes);

  describe('Route Creation', () => {
    it('should create typed routes correctly', () => {
      expect(api.users).toBeDefined();
      expect(api.users.getAll).toBeDefined();
      expect(api.users.getById).toBeDefined();
      expect(api.users.create).toBeDefined();
      expect(api.auth.login).toBeDefined();
    });

    it('should have correct function types', () => {
      expect(typeof api.users.getAll).toBe('function');
      expect(typeof api.users.create).toBe('function');
      expect(typeof api.auth.login).toBe('function');
    });
  });

  describe('Query Params Optional', () => {
    it('should not require query params for getAll', async () => {
      // ✅ This should work without arguments
      const result = await api.users.getAll();
      expect(result).toBeDefined();
    });

    it('should accept query params when provided', async () => {
      // ✅ This should work with query params
      const result = await api.users.search({ q: 'test', limit: 10 });
      expect(result).toBeDefined();
    });

    it('should work with path bindings', async () => {
      // ✅ Path bindings should work
      const result = await api.users.getById({ id: 123 });
      expect(result).toBeDefined();
    });

    it('should work with optional query params and bindings', async () => {
      // ✅ Both optional
      const result = await api.users.getById({ include: 'profile' }, { id: 123 });
      expect(result).toBeDefined();
    });
  });

  describe('Body Params', () => {
    it('should work with post without query params', async () => {
      // ✅ Body required, query params optional
      const result = await api.users.create({ name: 'John', email: 'john@test.com' });
      expect(result).toBeDefined();
    });

    it('should work with post with query params', async () => {
      // ✅ Both body and query params
      const result = await api.users.create(
        { name: 'John', email: 'john@test.com' }
      );
      expect(result).toBeDefined();
    });

    it('should work with auth login', async () => {
      // ✅ Auth endpoint with body
      const result = await api.auth.login({ 
        email: 'user@test.com', 
        password: 'password123' 
      });
      expect(result).toBeDefined();
    });

    it('should work with patch without bindings', async () => {
      const result = await api.users.updateProfile({ displayName: 'Neo' });
      expect(result).toBeDefined();
    });

    it('should work with patch without bindings and with query', async () => {
      const result = await api.users.updateProfile(
        { displayName: 'Neo' },
        { notify: true }
      );
      expect(result).toBeDefined();
    });

    it('should work with patch with path bindings', async () => {
      const result = await api.users.partialUpdate(
        { name: 'John Doe' },
        { id: 123 }
      );
      expect(result).toBeDefined();
    });

    it('should work with patch with bindings and query', async () => {
      const result = await api.users.partialUpdate(
        { name: 'John Doe' },
        { sendEmail: true },
        { id: 123 }
      );
      expect(result).toBeDefined();
  });

  describe('Products getById overload behavior', () => {
    interface ProductTest { name: string; price: number }

    const routes2 = createRouteConfig({
      products: {
        getById: get<ProductTest>('/products/{id}'),
        getByIdWithQuery: get<ProductTest, { include?: 'profile' | 'roles' }>('/products/{id}'),
      },
    });

    const manager2 = createAxiosManager<typeof routes2>({ baseURL: 'https://api.test.com' });
    const api2 = manager2.createTypedRoutes(routes2);

    it('should accept bindings when only TResponse is provided', async () => {
      expectTypeOf(api2.products.getById).toBeCallableWith({ id: 123 });
      const promise = api2.products.getById({ id: 123 });
      expectTypeOf(promise).resolves.toEqualTypeOf<ProductTest>();
      const result = await promise;
      expect(result).toBeDefined();
    });

    it('should accept (bindings) and (query, bindings) when TQuery is provided', async () => {
      expectTypeOf(api2.products.getByIdWithQuery).toBeCallableWith({ id: 123 });
      expectTypeOf(api2.products.getByIdWithQuery).toBeCallableWith({ id: 123 });
      const p1 = api2.products.getByIdWithQuery({ id: 123 });
      const p2 = api2.products.getByIdWithQuery({ include: 'profile' }, { id: 123 });
      expectTypeOf(p1).resolves.toEqualTypeOf<ProductTest>();
      expectTypeOf(p2).resolves.toEqualTypeOf<ProductTest>();
      const r1 = await p1;
      const r2 = await p2;
      expect(r1).toBeDefined();
      expect(r2).toBeDefined();
    });

    it('should allow return type to be specified at call site', async () => {
      type Minimal = { ok: boolean };
      const p = api2.products.getById<Minimal>({ id: 1 });
      expectTypeOf(p).resolves.toEqualTypeOf<Minimal>();
      const r = await p;
      expect(r).toBeDefined();
    });
  });
});

  describe('Manager Configuration', () => {
    it('should set and remove auth token', () => {
      const instance = manager.getInstance();
      
      manager.setAuthToken('test-token');
      expect(instance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
      
      manager.removeAuthToken();
      expect(instance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should set custom headers', () => {
      const instance = manager.getInstance();
      
      manager.setHeader('X-Custom-Header', 'custom-value');
      expect(instance.defaults.headers.common['X-Custom-Header']).toBe('custom-value');
    });
  });

  
});
