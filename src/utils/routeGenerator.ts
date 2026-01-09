import type { RouteDef, ValidatePath, RouteBuilderGet, RouteBuilderBody, RouteBuilderDelete } from '../types';

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
  return { path, httpMethod: method } as unknown as RouteDef<Path, Method, Body, Query, HasQuery, Response>;
}

/**
 * Common HTTP method shortcuts with Fluent API
 */

// Helper to attach chainable methods
function attachGetMethods<D extends RouteDef<any, 'get', never, any, any, any>>(def: D): RouteBuilderGet<D['path'], D['__query'], D['__response']> {
  const response = <T>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], 'get', never, D['__query'], D['__hasQuery'], T>;
    return attachGetMethods(newDef);
  };

  const query = <Q>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], 'get', never, Q, true, D['__response']>;
    return attachGetMethods(newDef);
  };

  return Object.assign(def, { response, query });
}

function attachBodyMethods<D extends RouteDef<any, 'post' | 'put' | 'patch', any, any, any, any>>(def: D): RouteBuilderBody<D['path'], D['httpMethod'], D['__body'], D['__query'], D['__response']> {
  const response = <T>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], D['httpMethod'], D['__body'], D['__query'], D['__hasQuery'], T>;
    return attachBodyMethods(newDef);
  };

  const query = <Q>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], D['httpMethod'], D['__body'], Q, true, D['__response']>;
    return attachBodyMethods(newDef);
  };

  const body = <B>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], D['httpMethod'], B, D['__query'], D['__hasQuery'], D['__response']>;
    return attachBodyMethods(newDef);
  };

  return Object.assign(def, { response, query, body });
}

function attachDeleteMethods<D extends RouteDef<any, 'delete', never, any, any, any>>(def: D): RouteBuilderDelete<D['path'], D['__query'], D['__response']> {
  const response = <T>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], 'delete', never, D['__query'], D['__hasQuery'], T>;
    return attachDeleteMethods(newDef);
  };

  const query = <Q>() => {
    const newDef = { ...def } as unknown as RouteDef<D['path'], 'delete', never, Q, true, D['__response']>;
    return attachDeleteMethods(newDef);
  };

  return Object.assign(def, { response, query });
}

export function get<TResponse = unknown, TQuery = never, TPath extends string = string>(
  path: TPath extends ValidatePath<TPath> ? TPath : ValidatePath<TPath>
): RouteBuilderGet<TPath, TQuery, TResponse> {
  const def = { path, httpMethod: 'get' } as unknown as RouteDef<TPath, 'get', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
  return attachGetMethods(def);
}

export function post<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(
  path: TPath extends ValidatePath<TPath> ? TPath : ValidatePath<TPath>
): RouteBuilderBody<TPath, 'post', TBody, TQuery, TResponse> {
  const def = { path, httpMethod: 'post' } as unknown as RouteDef<TPath, 'post', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
  return attachBodyMethods(def);
}

export function put<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(
  path: TPath extends ValidatePath<TPath> ? TPath : ValidatePath<TPath>
): RouteBuilderBody<TPath, 'put', TBody, TQuery, TResponse> {
  const def = { path, httpMethod: 'put' } as unknown as RouteDef<TPath, 'put', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
  return attachBodyMethods(def);
}

export function del<TQuery = never, TResponse = unknown, TPath extends string = string>(
  path: TPath extends ValidatePath<TPath> ? TPath : ValidatePath<TPath>
): RouteBuilderDelete<TPath, TQuery, TResponse> {
  const def = { path, httpMethod: 'delete' } as unknown as RouteDef<TPath, 'delete', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
  return attachDeleteMethods(def);
}

export function patch<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(
  path: TPath extends ValidatePath<TPath> ? TPath : ValidatePath<TPath>
): RouteBuilderBody<TPath, 'patch', TBody, TQuery, TResponse> {
  const def = { path, httpMethod: 'patch' } as unknown as RouteDef<TPath, 'patch', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
  return attachBodyMethods(def);
}

/**
 * Explicit binding helpers kept for backward compatibility or edge cases
 */
export function getBind<TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'get' } as unknown as RouteDef<TPath, 'get', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
}

export function postBind<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'post' } as unknown as RouteDef<TPath, 'post', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
}

export function putBind<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'put' } as unknown as RouteDef<TPath, 'put', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
}

export function delBind<TQuery = never, TResponse = unknown, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'delete' } as unknown as RouteDef<TPath, 'delete', never, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
}

export function patchBind<TBody = unknown, TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath) {
  return { path, httpMethod: 'patch' } as unknown as RouteDef<TPath, 'patch', TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse>;
}
