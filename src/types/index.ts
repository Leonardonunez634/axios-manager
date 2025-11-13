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
export interface ResponseWrapper<TData = any> {
  code: string;
  httpStatus: number;
  message: string;
  data: TData;
}

// Configuración del generador
export type HasBindings<Path extends string> = Path extends `${string}{${string}}${string}` ? true : false;

export interface RouteDef<Path extends string, Method extends HttpMethod, TBody = never, TQuery = never, HasQuery extends boolean = false> {
  path: Path;
  httpMethod: Method;
  __body: TBody;
  __query: TQuery;
  __hasQuery: HasQuery;
}

type RouteModule = Record<string, RouteDef<any, any, any, any, any>>;
export type RouteGenerator = Record<string, RouteModule>;

// Funciones de fetch mejoradas - versión simplificada que realmente funciona
export type FetchFunction<TResponse = any> = (
  queryParams?: QueryParams,
  bindings?: PathBindings
) => Promise<ResponseWrapper<TResponse>>;

export type FetchFunctionWithBody<TResponse = any, TBody = any> = (
  body: TBody,
  queryParams?: QueryParams,
  bindings?: PathBindings
) => Promise<ResponseWrapper<TResponse>>;

// Mapeo de métodos HTTP a funciones
export type FuncForGet<Path extends string, TQuery, HasQuery extends boolean, TResponse> = HasBindings<Path> extends true
  ? HasQuery extends true
    ? (query: TQuery, bindings: PathBindings) => Promise<ResponseWrapper<TResponse>>
    : (bindings: PathBindings) => Promise<ResponseWrapper<TResponse>>
  : HasQuery extends true
    ? (query: TQuery) => Promise<ResponseWrapper<TResponse>>
    : () => Promise<ResponseWrapper<TResponse>>;

export type FuncForBody<Path extends string, TBody, TQuery, HasQuery extends boolean, TResponse> = HasBindings<Path> extends true
  ? HasQuery extends true
    ? (body: TBody, query: TQuery, bindings: PathBindings) => Promise<ResponseWrapper<TResponse>>
    : (body: TBody, bindings: PathBindings) => Promise<ResponseWrapper<TResponse>>
  : HasQuery extends true
    ? (body: TBody, query: TQuery) => Promise<ResponseWrapper<TResponse>>
    : (body: TBody) => Promise<ResponseWrapper<TResponse>>;

export type MethodToFunction<
  R extends RouteDef<any, any, any, any, any>,
  TResponse = any
> = R['httpMethod'] extends GetDeleteMethod
  ? FuncForGet<R['path'], R['__query'], R['__hasQuery'], TResponse>
  : R['httpMethod'] extends PostPutPatchMethod
  ? FuncForBody<R['path'], R['__body'], R['__query'], R['__hasQuery'], TResponse>
  : never;

// Módulo de rutas mejorado
export type RouteModuleFunctions<TModule extends RouteModule> = {
  [K in keyof TModule]: MethodToFunction<TModule[K]>;
};

// Generador completo
export type TypedRoutes<TGenerator extends RouteGenerator> = {
  [K in keyof TGenerator]: RouteModuleFunctions<TGenerator[K]>;
};

// Configuración de axios mejorada
export interface AxiosManagerConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  responseWrapper?: {
    codeKey?: string;
    statusKey?: string;
    messageKey?: string;
    dataKey?: string;
  };
}
