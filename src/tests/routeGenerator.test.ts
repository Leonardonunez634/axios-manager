import { describe, it, expect } from 'vitest';
import { route, get, post, put, del, patch } from '../index';

describe('routeGenerator helpers', () => {
  it('route() returns path and method', () => {
    const r = route('/x', 'get');
    expect(r.path).toBe('/x');
    expect(r.httpMethod).toBe('get');
  });

  it('method shortcuts return correct method', () => {
    expect(get('/a').httpMethod).toBe('get');
    expect(post('/b').httpMethod).toBe('post');
    expect(put('/c').httpMethod).toBe('put');
    expect(del('/d').httpMethod).toBe('delete');
    expect(patch('/e').httpMethod).toBe('patch');
  });
});

