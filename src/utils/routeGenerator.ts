import type { RouteDef } from '../types';

/**
 * Helper function to create typed route configurations
 * This provides better DX and type safety
 */
export function createRouteConfig<const T>(config: T): T {
  return config;
}

/**
 * Helper for creating individual route configs
 */
// Declarative route helper kept for advanced cases
export function route<Path extends string, Method extends 'get' | 'post' | 'put' | 'delete' | 'patch', Body = never, Query = never, HasQuery extends boolean = false, Response = unknown>(
  path: Path,
  method: Method
) {
  return { path, httpMethod: method } as RouteDef<Path, Method, Body, Query, HasQuery, Response>;
}

/**
 * Common HTTP method shortcuts
 */
export function get(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'get', never, never, false, unknown>;
export function get<TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'get', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function get<TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'get', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function get<TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'get' } as any;
}

export function post(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'post', unknown, never, false, unknown>;
export function post<TBody = unknown, TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'post', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function post<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'post', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function post<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'post' } as any;
}

export function put(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'put', unknown, never, false, unknown>;
export function put<TBody = unknown, TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'put', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function put<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'put', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function put<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'put' } as any;
}

export function del(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'delete', never, never, false, unknown>;
export function del<TQuery = never, TResponse = unknown>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'delete', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function del<TQuery = never, TResponse = unknown, TPath extends string = string>(path: TPath): RouteDef<TPath, 'delete', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function del<TQuery = never, TResponse = unknown, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'delete' } as any;
}

export function patch(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'patch', unknown, never, false, unknown>;
export function patch<TBody = unknown, TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'patch', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function patch<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<TPath, 'patch', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function patch<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'patch' } as any;
}

/**
 * Explicit binding helpers to preserve path literals when only TResponse/TBody/TQuery are provided
 */
export function getBind<TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'get', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function getBind(path: `${string}{${string}}${string}`) {
  return { path, httpMethod: 'get' } as any;
}

export function postBind<TBody = unknown, TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'post', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function postBind(path: `${string}{${string}}${string}`) {
  return { path, httpMethod: 'post' } as any;
}

export function putBind<TBody = unknown, TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'put', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function putBind(path: `${string}{${string}}${string}`) {
  return { path, httpMethod: 'put' } as any;
}

export function delBind<TQuery = never, TResponse = unknown>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'delete', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function delBind(path: `${string}{${string}}${string}`) {
  return { path, httpMethod: 'delete' } as any;
}

export function patchBind<TBody = unknown, TResponse = unknown, TQuery = never>(path: `${string}{${string}}${string}`): RouteDef<typeof path, 'patch', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
export function patchBind(path: `${string}{${string}}${string}`) {
  return { path, httpMethod: 'patch' } as any;
}
