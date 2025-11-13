// Tipos base mejorados
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type GetDeleteMethod = Extract<HttpMethod, 'get' | 'delete'>;
export type PostPutPatchMethod = Extract<HttpMethod, 'post' | 'put' | 'patch'>;

// Configuración de rutas
export interface RouteConfig<Path extends string = string, Method extends HttpMethod = HttpMethod> {
  path: Path;
  httpMethod: Method;
}

// Tipos para parámetros de query mejorados
export type QueryParams = Record<string, string | number | boolean | undefined>;

// Tipos para binding de rutas
export type PathBindings = Record<string, string | number>;

// Response wrapper configurable
// Eliminado wrapper rígido; el retorno se tipa libremente por ruta y por llamada

// Configuración del generador
export type HasBindings<Path extends string> = Path extends `${string}{${string}}${string}` ? true : false;

export interface RouteDef<Path extends string, Method extends HttpMethod, TBody = never, TQuery = never, HasQuery extends boolean = false, TResponse = unknown> {
  path: Path;
  httpMethod: Method;
  __body: TBody;
  __query: TQuery;
  __hasQuery: HasQuery;
  __response: TResponse;
}

// Evitar alias que ensanchan tipos: trabajar directamente con los tipos específicos inferidos

// Funciones de fetch mejoradas - versión simplificada que realmente funciona
export type FetchFunction<TResponse = any> = (
  queryParams?: QueryParams,
  bindings?: PathBindings
) => Promise<TResponse>;

export type FetchFunctionWithBody<TResponse = any, TBody = any> = (
  body: TBody,
  queryParams?: QueryParams,
  bindings?: PathBindings
) => Promise<TResponse>;

// Mapeo de métodos HTTP a funciones
export type FuncForGet<Path extends string, TQuery, HasQuery extends boolean, TDefault> =
  HasBindings<Path> extends true
    ? HasQuery extends true
      ? {
          <TReturn = TDefault>(query: TQuery, bindings: PathBindings): Promise<TReturn>;
          <TReturn = TDefault>(bindings: PathBindings): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(bindings: PathBindings): Promise<TReturn>;
        }
    : HasQuery extends true
      ? {
          <TReturn = TDefault>(query?: TQuery): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(): Promise<TReturn>;
        };

export type FuncForBody<Path extends string, TBody, TQuery, HasQuery extends boolean, TDefault> =
  HasBindings<Path> extends true
    ? HasQuery extends true
      ? {
          <TReturn = TDefault>(body: TBody, query: TQuery, bindings: PathBindings): Promise<TReturn>;
          <TReturn = TDefault>(body: TBody, bindings: PathBindings): Promise<TReturn>;
        }
      : {
          <TReturn = TDefault>(body: TBody, bindings: PathBindings): Promise<TReturn>;
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
