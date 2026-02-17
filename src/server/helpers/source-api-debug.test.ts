import { describe, expect, it, vi } from 'vitest';

vi.mock('../debug', async () => {
  const original = await import('../debug');
  return {
    ...original,
    debugRequest: vi.fn(),
  };
});
import { debugRequest } from '../debug';
import { forTesting, addRequestDataDebugging } from './source-api-debug';

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

  afterEach(() => {
    process.env = { ...processEnvOriginal };
  });

  // These tests are dependend on each other. Resetting the process.env in the afterEach or before calling addRequestDataDebugging does not work. Placing this in front of the other test does.
  it('A requests is not debugged', () => {
    addRequestDataDebugging({
      method: 'GET',
      url: 'path',
      params: 'param',
      data: { key: 'value' },
    });

    expect(debugRequest).not.toHaveBeenCalled();
  });

  it('A requests is debugged', () => {
    process.env.DEBUG_REQUEST_DATA = 'path';

    addRequestDataDebugging({
      method: 'GET',
      url: 'path',
      params: 'param',
      data: { key: 'value' },
    });

    expect(debugRequest).toHaveBeenCalledWith('------');
  });
});
