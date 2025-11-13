import type { AxiosManager } from '../core/AxiosManager';
import type { RouteGenerator, ResponseWrapper } from '../types';

/**
 * Hook for making API calls with loading and error states
 * React is optional - will throw if used without React installed
 */
export function useApiCall<
  TManager extends AxiosManager<any>,
  TResponse = any
>(manager: TManager) {
  // Dynamic import to make React optional
  let React: any;
  try {
    React = require('react');
  } catch {
    throw new Error('useApiCall requires React to be installed');
  }

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<TResponse | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const execute = React.useCallback(
    async (apiCall: () => Promise<ResponseWrapper<TResponse>>) => {
      setLoading(true);
      setError(null);
      
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await apiCall();
        setData(response.data);
        return response.data;
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { execute, loading, error, data };
}

/**
 * Hook for authentication with the axios manager
 * React is optional - will throw if used without React installed
 */
export function useAuth<TManager extends AxiosManager<any>>(manager: TManager) {
  let React: any;
  try {
    React = require('react');
  } catch {
    throw new Error('useAuth requires React to be installed');
  }

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const login = React.useCallback((token: string) => {
    manager.setAuthToken(token);
    setIsAuthenticated(true);
  }, [manager]);

  const logout = React.useCallback(() => {
    manager.removeAuthToken();
    setIsAuthenticated(false);
  }, [manager]);

  return { isAuthenticated, login, logout };
}

/**
 * Context provider factory for React applications
 * React is optional - will throw if used without React installed
 */
export function createAxiosContext<TGenerator extends RouteGenerator>() {
  let React: any;
  try {
    React = require('react');
  } catch {
    throw new Error('createAxiosContext requires React to be installed');
  }

  interface ContextValue {
    manager: AxiosManager<TGenerator>;
    api: any; // Would be TypedRoutes<TGenerator> but avoiding circular deps
  }

  const context = React.createContext<ContextValue | null>(null);

  function Provider({ 
    manager, 
    children 
  }: { 
    manager: AxiosManager<TGenerator>; 
    children: any;
  }) {
    const api = manager.createTypedRoutes({} as TGenerator);
    
    return React.createElement(
      context.Provider,
      { value: { manager, api } },
      children
    );
  }

  function useApi() {
    const ctx = React.useContext(context);
    if (!ctx) {
      throw new Error('useApi must be used within AxiosProvider');
    }
    return ctx.api;
  }

  function useManager() {
    const ctx = React.useContext(context);
    if (!ctx) {
      throw new Error('useManager must be used within AxiosProvider');
    }
    return ctx.manager;
  }

  return { Provider, useApi, useManager };
}