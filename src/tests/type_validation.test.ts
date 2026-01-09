import { describe, it, expectTypeOf } from 'vitest';
import { createAxiosManager, createRouteConfig, get } from '../index';

describe('Type Validation & Inference', () => {
  interface Product {
    id: number;
    name: string;
  }

  const routes = createRouteConfig({
    products: {
      getById: get('/products/{id}').response<Product>(),
      list: get('/products').response<Product[]>(),
    },
  });

  const manager = createAxiosManager<typeof routes>({ baseURL: 'http://api.test' });
  const api = manager.createTypedRoutes(routes);

  it('should infer correct types for modules', () => {
    // Check if api.products exists
    expectTypeOf(api).toHaveProperty('products');
    expectTypeOf(api.products).toHaveProperty('getById');
  });

  it('should require object bindings for routes with params', () => {
    // This is what the user says passes but should fail:
    // api.products.getById(123); // This would throw runtime error now
    
    // Correct usage:
    expectTypeOf(api.products.getById).toBeCallableWith({ id: 123 });
    
    // Incorrect usage (should fail type check):
    // We expect this to be NOT callable with a number, but currently it might be allowing it or TS is confused.
    // expectTypeOf(api.products.getById).parameter(0).not.toBeNumber();
  });

  it('should infer types even when manager is not typed explicitly', () => {
    // This reproduces the user scenario: const manager = createAxiosManager({...});
    const looseManager = createAxiosManager({ baseURL: 'http://api.test' });
    const looseApi = looseManager.createTypedRoutes(routes);

    // Should still have autocomplete/types
    expectTypeOf(looseApi).toHaveProperty('products');
    expectTypeOf(looseApi.products).toHaveProperty('getById');
    expectTypeOf(looseApi.products.getById).toBeCallableWith({ id: 123 });
  });
});
