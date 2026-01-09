import { describe, it, expect, vi } from 'vitest';
import { createAxiosManager, createRouteConfig, get } from '../index';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: { headers: { common: {} } },
      request: vi.fn().mockResolvedValue({ 
        data: { 
          code: 'SUCCESS',
          httpStatus: 200,
          message: 'OK',
          data: { ok: true }
        } 
      }),
    })),
  },
}));

describe('bindPath without bindings branch', () => {
  const routes = createRouteConfig({
    items: {
      view: get('/items/{id}'),
    },
  });

  const manager = createAxiosManager<typeof routes>({ baseURL: 'https://api.test.com' });
  const api = manager.createTypedRoutes(routes);

  it('throws error when bindings are undefined for route with params', async () => {
    // Expect the promise to reject with the validation error
    await expect(
      (api.items.view as any)({ include: 'x' }, undefined)
    ).rejects.toThrow(/Missing required binding/);
  });
});

