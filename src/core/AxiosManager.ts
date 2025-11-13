import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  TypedRoutes,
  RouteConfig,
  HttpMethod,
  PathBindings,
  QueryParams,
  AxiosManagerConfig,
} from '../types/index.js';

export class AxiosManager<TGenerator extends Record<string, Record<string, unknown>>> {
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
    const typedRoutes = {} as TypedRoutes<TGenerator>;

    for (const [moduleName, moduleConfig] of Object.entries(generator)) {
      (typedRoutes as any)[moduleName] = this.createModuleFunctions(moduleConfig);
    }

    return typedRoutes;
  }

  // Crear funciones para un módulo
  private createModuleFunctions<TModule extends Record<string, unknown>>(
    moduleConfig: TModule
  ) {
    const moduleFunctions = {} as any;

    for (const [functionName, routeConfig] of Object.entries(moduleConfig)) {
      moduleFunctions[functionName] = this.createRouteFunction(routeConfig as RouteConfig);
    }

    return moduleFunctions;
  }

  // Crear función individual para una ruta
  private createRouteFunction<TMethod extends HttpMethod>(
    routeConfig: RouteConfig
  ) {
    const { path, httpMethod } = routeConfig;
    const hasBindings = /\{[^}]+\}/.test(path);

    if (httpMethod === 'get' || httpMethod === 'delete') {
      if (hasBindings) {
        const fn = async <T = any>(a: any, b?: any): Promise<T> => {
          const queryParams = b === undefined ? undefined : a;
          const bindings = b === undefined ? a : b;
          const finalPath = this.bindPath(path, bindings);
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as any;
      } else {
        const fn = async <T = any>(queryParams?: QueryParams): Promise<T> => {
          const finalPath = path;
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as any;
      }
    } else {
      if (hasBindings) {
        const fn = async <T = any>(body: any, a: any, b?: any): Promise<T> => {
          const queryParams = b === undefined ? undefined : a;
          const bindings = b === undefined ? a : b;
          const finalPath = this.bindPath(path, bindings);
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, data: body, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as any;
      } else {
        const fn = async <T = any>(body: any, queryParams?: QueryParams): Promise<T> => {
          const finalPath = path;
          const config: AxiosRequestConfig = { method: httpMethod, url: finalPath, data: body, params: queryParams };
          const response = await this.axiosInstance.request(config);
          return response.data as T;
        };
        return fn as any;
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
export function createAxiosManager<TGenerator extends Record<string, Record<string, unknown>>>(
  config?: AxiosManagerConfig
): AxiosManager<TGenerator> {
  return new AxiosManager<TGenerator>(config);
}
