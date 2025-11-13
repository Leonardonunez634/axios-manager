/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { createAxiosManager } from '../../index';
import { createAxiosContext, useApiCall, useAuth } from '../../react/hooks';

describe('React entry works when React is installed', () => {
  it('createAxiosContext returns Provider and hooks', () => {
    const ctx = createAxiosContext<any>();
    expect(ctx.Provider).toBeTypeOf('function');
    expect(ctx.useApi).toBeTypeOf('function');
    expect(ctx.useManager).toBeTypeOf('function');
  });

  it('Provider can be instantiated', () => {
    const ctx = createAxiosContext<any>();
    const manager = createAxiosManager();
    const element = React.createElement(
      ctx.Provider,
      { manager },
      React.createElement('div', null, 'child')
    );
    expect(element).toBeDefined();
  });

  it('react-specific functions are available', () => {
    expect(typeof useApiCall).toBe('function');
    expect(typeof useAuth).toBe('function');
  });
});
