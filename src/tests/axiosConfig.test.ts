import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAxiosManager, createRouteConfig, get, post, put, del, patch } from '../index';

let lastConfig: any = null;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: { headers: { common: {} } },
      request: vi.fn(async (config: any) => {
        lastConfig = config;
        return {
          data: {
            code: 'SUCCESS',
            httpStatus: 200,
            message: 'OK',
            data: { ok: true },
          },
        };
      }),
    })),
  },
}));

describe('Axios request configuration', () => {
  const routes = createRouteConfig({
    users: {
      getAll: get('/users'),
      search: get<unknown, { q: string; limit?: number }>('/users/search'),
      getByIdOnlyBinding: get<unknown>('/users/{id}'),
      getById: get<unknown, { include?: 'profile' | 'roles' }>('/users/{id}'),
      delete: del('/users/{id}'),
      create: post<{ name: string; email: string }, unknown, { sendWelcomeEmail?: boolean }>('/users'),
      update: put<{ name: string; email: string }>('/users/{id}'),
      partialUpdate: patch<{ name?: string }, unknown, { notify?: boolean }>('/users/{id}'),
    },
  });

  const manager = createAxiosManager<typeof routes>({ baseURL: 'https://api.test.com' });
  const api = manager.createTypedRoutes(routes);

  beforeEach(() => {
    lastConfig = null;
  });

  it('GET: sends correct method and path', async () => {
    await api.users.getAll();
    expect(lastConfig).toBeTruthy();
    expect(lastConfig.method).toBe('get');
    expect(lastConfig.url).toBe('/users');
    expect(lastConfig.params).toBeUndefined();
    expect(lastConfig.data).toBeUndefined();
  });

  it('GET with query params', async () => {
    await api.users.search({ q: 'neo', limit: 10 });
    expect(lastConfig.method).toBe('get');
    expect(lastConfig.url).toBe('/users/search');
    expect(lastConfig.params).toEqual({ q: 'neo', limit: 10 });
  });

  it('GET with bindings only', async () => {
    await api.users.getByIdOnlyBinding({ id: 42 });
    expect(lastConfig.method).toBe('get');
    expect(lastConfig.url).toBe('/users/42');
    expect(lastConfig.params).toBeUndefined();
  });

  it('GET with query and bindings (order: query, bindings)', async () => {
    await api.users.getById({ include: 'profile' }, { id: 7 });
    expect(lastConfig.method).toBe('get');
    expect(lastConfig.url).toBe('/users/7');
    expect(lastConfig.params).toEqual({ include: 'profile' });
  });

  it('DELETE with bindings', async () => {
    await api.users.delete({ id: 9 });
    expect(lastConfig.method).toBe('delete');
    expect(lastConfig.url).toBe('/users/9');
    expect(lastConfig.params).toBeUndefined();
  });

  it('POST with body only', async () => {
    await api.users.create({ name: 'John', email: 'john@example.com' });
    expect(lastConfig.method).toBe('post');
    expect(lastConfig.url).toBe('/users');
    expect(lastConfig.data).toEqual({ name: 'John', email: 'john@example.com' });
    expect(lastConfig.params).toBeUndefined();
  });

  it('POST with body and query', async () => {
    await api.users.create(
      { name: 'John', email: 'john@example.com' },
      { sendWelcomeEmail: true }
    );
    expect(lastConfig.method).toBe('post');
    expect(lastConfig.url).toBe('/users');
    expect(lastConfig.data).toEqual({ name: 'John', email: 'john@example.com' });
    expect(lastConfig.params).toEqual({ sendWelcomeEmail: true });
  });

  it('PUT with body and bindings', async () => {
    await api.users.update({ name: 'Jane', email: 'jane@example.com' }, { id: 3 });
    expect(lastConfig.method).toBe('put');
    expect(lastConfig.url).toBe('/users/3');
    expect(lastConfig.data).toEqual({ name: 'Jane', email: 'jane@example.com' });
    expect(lastConfig.params).toBeUndefined();
  });

  it('PATCH with body, query and bindings (order: body, query, bindings)', async () => {
    await api.users.partialUpdate({ name: 'Neo' }, { notify: true }, { id: 99 });
    expect(lastConfig.method).toBe('patch');
    expect(lastConfig.url).toBe('/users/99');
    expect(lastConfig.data).toEqual({ name: 'Neo' });
    expect(lastConfig.params).toEqual({ notify: true });
  });
});
