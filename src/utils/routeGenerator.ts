import type { RouteGenerator, RouteDef } from '../types';

/**
 * Helper function to create typed route configurations
 * This provides better DX and type safety
 */
export function createRouteConfig<T extends RouteGenerator>(config: T): T {
  return config;
}

/**
 * Helper for creating individual route configs
 */
// Declarative route helper kept for advanced cases
export function route<Path extends string, Method extends 'get' | 'post' | 'put' | 'delete' | 'patch', Body = never, Query = never, HasQuery extends boolean = false>(
  path: Path,
  method: Method
) {
  return { path, httpMethod: method } as RouteDef<Path, Method, Body, Query, HasQuery>;
}

/**
 * Common HTTP method shortcuts
 */
export function get<TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'get', never, TQuery, [TQuery] extends [never] ? false : true>;
export function get(path: string) {
  return { path, httpMethod: 'get' } as any;
}

export function post<TBody = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'post', TBody, TQuery, [TQuery] extends [never] ? false : true>;
export function post(path: string) {
  return { path, httpMethod: 'post' } as any;
}

export function put<TBody = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'put', TBody, TQuery, [TQuery] extends [never] ? false : true>;
export function put(path: string) {
  return { path, httpMethod: 'put' } as any;
}

export function del<TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'delete', never, TQuery, [TQuery] extends [never] ? false : true>;
export function del(path: string) {
  return { path, httpMethod: 'delete' } as any;
}

export function patch<TBody = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'patch', TBody, TQuery, [TQuery] extends [never] ? false : true>;
export function patch(path: string) {
  return { path, httpMethod: 'patch' } as any;
}
