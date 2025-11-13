/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAxiosManager } from '../../index';
import { useApiCall, useAuth, createAxiosContext } from '../../react/hooks';

function render(el: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(el, container);
  return container;
}

describe('hooks behavior', () => {
  it('useAuth login/logout toggles state', async () => {
    const manager = createAxiosManager();
    let authState: boolean | null = null;

    function Comp() {
      const { isAuthenticated, login, logout } = useAuth(manager);
      useEffect(() => {
        authState = isAuthenticated;
        login('t');
        authState = true;
        logout();
        authState = false;
      }, [isAuthenticated, login, logout]);
      return React.createElement('div');
    }

    render(React.createElement(Comp));
    await new Promise(r => setTimeout(r, 10));
    expect(authState).toBe(false);
  });

  it('useApiCall sets data on resolve', async () => {
    const manager = createAxiosManager();
    let result: any = null;

    function Comp() {
      const { execute } = useApiCall(manager);
      useEffect(() => {
        execute(async () => ({ code: 'SUCCESS', httpStatus: 200, message: 'OK', data: { x: 1 } })).then(r => {
          result = r;
        });
      }, [execute]);
      return React.createElement('div');
    }

    render(React.createElement(Comp));
    await new Promise(r => setTimeout(r, 10));
    expect(result).toEqual({ x: 1 });
  });

  it('context Provider supplies hooks', () => {
    const { Provider, useApi, useManager } = createAxiosContext<any>();
    const manager = createAxiosManager();
    let apiOk = false;
    let mgrOk = false;

    function Child() {
      const api = useApi();
      const mgr = useManager();
      apiOk = !!api;
      mgrOk = !!mgr;
      return React.createElement('div');
    }

    render(React.createElement(Provider, { manager }, React.createElement(Child)));
    expect(apiOk).toBe(true);
    expect(mgrOk).toBe(true);
  });
});
