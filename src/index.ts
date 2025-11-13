// Core exports
export { AxiosManager, createAxiosManager } from './core/AxiosManager';

// Types exports
export type {
  HttpMethod,
  RouteConfig,
  RouteGenerator,
  TypedRoutes,
  QueryParams,
  PathBindings,
  ResponseWrapper,
  AxiosManagerConfig,
  FetchFunction,
  FetchFunctionWithBody,
} from './types';

// Utils exports
export { createRouteConfig, route, get, post, put, del, patch } from './utils/routeGenerator';

// React exports (optional) moved to separate entry to simplify typecheck

// Default export
import { createAxiosManager } from './core/AxiosManager.js';
export default createAxiosManager;
