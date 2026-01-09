// Tipos base mejorados
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type GetDeleteMethod = Extract<HttpMethod, 'get' | 'delete'>;
export type PostPutPatchMethod = Extract<HttpMethod, 'post' | 'put' | 'patch'>;

// Helper para expandir tipos en mensajes de error (Prettify)
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Configuración de rutas
export interface RouteConfig<Path extends string = string, Method extends HttpMethod = HttpMethod> {
  path: Path;
  httpMethod: Method;
}

// Tipos para parámetros de query mejorados
export type QueryParams = Record<string, string | number | boolean | undefined>;

// Helper para extraer parámetros de la URL: '/users/{id}/posts/{postId}' -> 'id' | 'postId'
export type ExtractRouteParams<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : never;

// Validar duplicados en tiempo de diseño (opcional, para uso futuro o mejora de DX en definición)
export type ValidatePath<T extends string, Seen = never, Original extends string = T> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends Seen
      ? `Error: Duplicate param '${Param}'`
      : ValidatePath<Rest, Seen | Param, Original>
    : Original;

// Tipos para binding de rutas
// Usamos Prettify para que el error muestre el objeto { id: string | number } en lugar de PathBindings<...>
export type PathBindings<Path extends string> = Prettify<Record<ExtractRouteParams<Path>, string | number>>;

// Configuración del generador
export type HasBindings<Path extends string> = ExtractRouteParams<Path> extends never ? false : true;

export interface RouteDef<Path extends string, Method extends HttpMethod, TBody = never, TQuery = never, HasQuery extends boolean = false, TResponse = unknown> {
  path: Path; // Podríamos usar ValidatePath<Path> aquí si quisiéramos forzarlo en la definición
  httpMethod: Method;
  __body: TBody;
  __query: TQuery;
  __hasQuery: HasQuery;
  __response: TResponse;
}

// Fluent Builder Interfaces
export interface RouteBuilderGet<Path extends string, TQuery = never, TResponse = unknown> extends RouteDef<Path, 'get', never, TQuery, [TQuery] extends [never] ? false : true, TResponse> {
  response: <NewResponse>() => RouteBuilderGet<Path, TQuery, NewResponse>;
  query: <NewQuery>() => RouteBuilderGet<Path, NewQuery, TResponse>;
}

export interface RouteBuilderBody<Path extends string, Method extends 'post' | 'put' | 'patch', TBody = unknown, TQuery = never, TResponse = unknown> extends RouteDef<Path, Method, TBody, TQuery, [TQuery] extends [never] ? false : true, TResponse> {
  response: <NewResponse>() => RouteBuilderBody<Path, Method, TBody, TQuery, NewResponse>;
  query: <NewQuery>() => RouteBuilderBody<Path, Method, TBody, NewQuery, TResponse>;
  body: <NewBody>() => RouteBuilderBody<Path, Method, NewBody, TQuery, TResponse>;
}

export interface RouteBuilderDelete<Path extends string, TQuery = never, TResponse = unknown> extends RouteDef<Path, 'delete', never, TQuery, [TQuery] extends [never] ? false : true, TResponse> {
  response: <NewResponse>() => RouteBuilderDelete<Path, TQuery, NewResponse>;
  query: <NewQuery>() => RouteBuilderDelete<Path, NewQuery, TResponse>;
}

// Funciones de fetch mejoradas
// Nota: FetchFunction genérico se mantiene por compatibilidad, pero internamente usaremos los específicos
export type FetchFunction<TResponse = any> = (
  queryParams?: QueryParams,
  bindings?: Record<string, string | number>
) => Promise<TResponse>;

export type FetchFunctionWithBody<TResponse = any, TBody = any> = (
  body: TBody,
  queryParams?: QueryParams,
  bindings?: Record<string, string | number>
) => Promise<TResponse>;

// Mapeo de métodos HTTP a funciones

// GET / DELETE
export type FuncForGet<Path extends string, TQuery, HasQuery extends boolean, TDefault> =
  HasBindings<Path> extends true
    ? HasQuery extends true
      ? {
          <TReturn = TDefault>(query: TQuery, bindings: PathBindings<Path>): Promise<TReturn>;
          <TReturn = TDefault>(bindings: PathBindings<Path>): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(bindings: PathBindings<Path>): Promise<TReturn>;
        }
    : HasQuery extends true
      ? {
          <TReturn = TDefault>(query?: TQuery): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(): Promise<TReturn>;
        };

// POST / PUT / PATCH
export type FuncForBody<Path extends string, TBody, TQuery, HasQuery extends boolean, TDefault> =
  HasBindings<Path> extends true
    ? HasQuery extends true
      ? {
          <TReturn = TDefault>(body: TBody, query: TQuery, bindings: PathBindings<Path>): Promise<TReturn>;
          <TReturn = TDefault>(body: TBody, bindings: PathBindings<Path>): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(body: TBody, bindings: PathBindings<Path>): Promise<TReturn>;
        }
    : HasQuery extends true
      ? {
          <TReturn = TDefault>(body: TBody, query?: TQuery): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(body: TBody): Promise<TReturn>;
        };

export type MethodToFunction<R> = R extends RouteDef<infer P, infer M, infer B, infer Q, infer HQ, infer Res>
  ? M extends GetDeleteMethod
    ? FuncForGet<P, Q, HQ, Res>
    : M extends PostPutPatchMethod
    ? FuncForBody<P, B, Q, HQ, Res>
    : never
  : never;

// Módulo de rutas mejorado
export type RouteModuleFunctions<TModule> = {
  [K in keyof TModule]: MethodToFunction<TModule[K]>;
};

// Generador completo
export type TypedRoutes<TGenerator> = {
  [K in keyof TGenerator]: RouteModuleFunctions<TGenerator[K]>;
};

// Configuración de axios mejorada
export interface AxiosManagerConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}
