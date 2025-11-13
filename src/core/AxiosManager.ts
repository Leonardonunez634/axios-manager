import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  AxiosManagerConfig,
  MethodToFunction,
  HttpMethod,
  PathBindings,
  QueryParams,
  RouteDef,
  RouteModuleFunctions,
  TypedRoutes
} from '../types/index.js';

export class AxiosManager<TGenerator extends Record<string, Record<string, RouteDef<string, HttpMethod, unknown, unknown, boolean, unknown>>>> {
  private axiosInstance: AxiosInstance;
  private config: Required<AxiosManagerConfig>;

  constructor(config: AxiosManagerConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 5000,
      headers: config.headers || {},
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });
  }

  // Método para crear las rutas tipadas
  createTypedRoutes(generator: TGenerator): TypedRoutes<TGenerator> {
    const typedRoutes = {} as Partial<TypedRoutes<TGenerator>>;

    for (const moduleName in generator) {
      const key = moduleName as keyof TGenerator;
      const moduleConfig = generator[key] as Record<string, RouteDef<string, HttpMethod, unknown, unknown, boolean, unknown>>;
      const funcs = this.createModuleFunctions(moduleConfig);
      (typedRoutes as TypedRoutes<TGenerator>)[key] = funcs as RouteModuleFunctions<TGenerator[typeof key]>;
    }

    return typedRoutes as TypedRoutes<TGenerator>;
  }

  // Crear funciones para un módulo
  private createModuleFunctions<TModule extends Record<string, RouteDef<string, HttpMethod, unknown, unknown, boolean, unknown>>>(
    moduleConfig: TModule
  ): RouteModuleFunctions<TModule> {
    const moduleFunctions = {} as Partial<RouteModuleFunctions<TModule>>;

    for (const functionName of Object.keys(moduleConfig) as (keyof TModule)[]) {
      const routeConfig = moduleConfig[functionName];
      const fn = this.createRouteFunction(routeConfig);
      (moduleFunctions as RouteModuleFunctions<TModule>)[functionName] = fn as RouteModuleFunctions<TModule>[typeof functionName];
    }

    return moduleFunctions as RouteModuleFunctions<TModule>;
  }

  // Crear función individual para una ruta
  private createRouteFunction<R extends RouteDef<string, HttpMethod, unknown, unknown, boolean, unknown>>(
    routeConfig: R
  ): MethodToFunction<R> {
    const { path, httpMethod } = routeConfig;
    const hasBindings = /\{[^}]+\}/.test(path);

    if (httpMethod === 'get' || httpMethod === 'delete') {
      if (hasBindings) {
        const fn = async <T = unknown>(a: unknown, b?: unknown): Promise<T> => {
          const queryParams = b === undefined ? undefined : a;
          const bindings = b === undefined ? a : b;
          const finalPath = this.bindPath(path, bindings as PathBindings);
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as unknown as MethodToFunction<R>;
      } else {
        const fn = async <T = unknown>(queryParams?: QueryParams): Promise<T> => {
          const finalPath = path;
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as unknown as MethodToFunction<R>;
      }
    } else {
      if (hasBindings) {
        const fn = async <T = unknown>(body: unknown, a: unknown, b?: unknown): Promise<T> => {
          const queryParams = b === undefined ? undefined : a;
          const bindings = b === undefined ? a : b;
          const finalPath = this.bindPath(path, bindings as PathBindings);
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, data: body, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as unknown as MethodToFunction<R>;
      } else {
        const fn = async <T = unknown>(body: unknown, queryParams?: QueryParams): Promise<T> => {
          const finalPath = path;
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, data: body, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as unknown as MethodToFunction<R>;
      }
    }
  }

  // Bind de parámetros en el path
  private bindPath(path: string, bindings?: PathBindings): string {
    if (!bindings) return path;

    let finalPath = path;
    for (const [key, value] of Object.entries(bindings)) {
      finalPath = finalPath.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    return finalPath;
  }

  

  // Métodos de utilidad
  setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  setAuthToken(token: string): void {
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Factory function para crear instancias
export function createAxiosManager<TGenerator extends Record<string, Record<string, RouteDef<string, HttpMethod, unknown, unknown, boolean, unknown>>>>(
  config?: AxiosManagerConfig
): AxiosManager<TGenerator> {
  return new AxiosManager<TGenerator>(config);
}
