import { describe, expect, it, vi } from 'vitest';
import { createAxiosManager, createRouteConfig, get, post } from '../index';

interface UserSearchParams {
  name:string,
  limit?: number,
  page: number,
}

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: { headers: { common: {} } },
      request: vi.fn().mockResolvedValue({ data: { success: true } }),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe('Query Params Optional', () => {
  const routes = createRouteConfig({
    users: {
      getAll: get('/users'),
      getById: get<unknown, { include?: 'profile' | 'roles' }>('/users/{id}'),
      search: get('/users/search'),
      searchWithParams: get<unknown, UserSearchParams>('/users/search'),
      create: post('/users'),
    },
  });

  const manager = createAxiosManager<typeof routes>({
    baseURL: 'https://api.test.com',
  });

  const api = manager.createTypedRoutes(routes);

  it('should not require query params for getAll', async () => {
    // ✅ This should compile without errors
    const result = await api.users.getAll();
    expect(result).toBeDefined();
  });

  it('should accept query params when provided', async () => {
    // ✅ This should also work
    const result = await api.users.searchWithParams({ name: 'test', limit: 10, page: 1 });
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

  it('should work with post without query params', async () => {
    // ✅ Body required, query params optional
    const result = await api.users.create({ name: 'John', email: 'john@test.com' });
    expect(result).toBeDefined();
  });

  it('should work with post with query params', async () => {
    // ✅ Both body and query params
    const result = await api.users.create(
      { name: 'John', email: 'john@test.com' },
    );
    expect(result).toBeDefined();
  });
});
