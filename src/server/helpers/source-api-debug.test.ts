import { describe, expect, it, vi } from 'vitest';

import { forTesting } from './source-api-debug';

describe('isDebugRequestDataMatch', () => {
  it('returns true when the path and terms match', async () => {
    const fn = forTesting.isDebugRequestDataMatch({
      url: 'https://domain.nl/parent/path',
      params: ['param'],
      data: ['data'],
    });
    expect(fn('path')).toBeTruthy();
    expect(fn('parent/path')).toBeTruthy();
    expect(fn('path|param')).toBeTruthy();
    expect(fn('path|data')).toBeTruthy();
    expect(fn('path|data;param')).toBeTruthy();

    expect(fn('path|nomatch;param')).toBeTruthy();
    expect(fn('path|data;nomatch')).toBeTruthy();

    expect(fn('otherpath')).toBeFalsy();
    expect(fn('|param')).toBeFalsy();
    expect(fn('|data')).toBeFalsy();
    expect(fn('|data;param')).toBeFalsy();
  });
});

describe('test', () => {
  const processEnvOriginal = { ...process.env };

  beforeEach(() => {
    // The debug package reads process.env.debug on import. This resets the package to read the new debug env.
    process.env.DEBUG = undefined;
    vi.resetModules();
    vi.doMock('../debug', async () => {
      return {
        ...(await vi.importActual('../debug')),
        debugRequest: vi.fn(),
      };
    });
  });

  afterEach(() => {
    process.env = { ...processEnvOriginal };
  });

  it('debugs a matching request', async () => {
    process.env.DEBUG_REQUEST_DATA = 'path';

    const { debugRequest } = await import('../debug');
    const { addRequestDataDebugging } = await import('./source-api-debug');

    addRequestDataDebugging({
      method: 'GET',
      url: 'path',
      params: 'param',
      data: { key: 'value' },
    });

    expect(debugRequest).toHaveBeenCalledWith('------');
  });

  it('does not debug a non-matching request', async () => {
    process.env.DEBUG_REQUEST_DATA = 'non-path';

    const { debugRequest } = await import('../debug');
    const { addRequestDataDebugging } = await import('./source-api-debug');

    addRequestDataDebugging({
      method: 'GET',
      url: 'path',
      params: 'param',
      data: { key: 'value' },
    });

    expect(debugRequest).not.toHaveBeenCalled();
  });
});
