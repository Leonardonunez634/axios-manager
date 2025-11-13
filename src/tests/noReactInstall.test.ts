import { describe, it, expect, vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: { headers: { common: {} } },
      request: vi.fn().mockResolvedValue({ data: { code: 'SUCCESS', httpStatus: 200, message: 'OK', data: { ok: true } } }),
    })),
  },
}));

describe('Install without React', () => {
  it('package should not depend on React', async () => {
    const pkgJson = await import('../../package.json', { assert: { type: 'json' } }) as any;
    const deps = (pkgJson.default?.dependencies || pkgJson.dependencies || {}) as Record<string, string>;
    const peerDeps = (pkgJson.default?.peerDependencies || pkgJson.peerDependencies || {}) as Record<string, string>;
    expect(deps['react']).toBeUndefined();
    expect(peerDeps['react']).toBeUndefined();
  });

  it('should import main entry without React and work', async () => {
    const pkg = await import('../index');

    expect(pkg.createAxiosManager).toBeDefined();
    expect(pkg.createRouteConfig).toBeDefined();
    expect(pkg.get).toBeDefined();
    expect(pkg.patch).toBeDefined();
    // React APIs are not part of the main entry
    expect((pkg as any).useApiCall).toBeUndefined();
    expect((pkg as any).useAuth).toBeUndefined();
    expect((pkg as any).createAxiosContext).toBeUndefined();

    const routes = pkg.createRouteConfig({
      sample: {
        ping: pkg.get('/ping'),
        update: pkg.patch('/item/{id}'),
      },
    });

    const manager = pkg.createAxiosManager();
    const api = manager.createTypedRoutes(routes);

    const res1 = await api.sample.ping();
    expect(res1.data.ok).toBe(true);

    const res2 = await api.sample.update({ name: 'test' }, { id: 1 });
    expect(res2.data.ok).toBe(true);
  });
});
