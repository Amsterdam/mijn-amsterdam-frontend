import { describe, expect, it, vi } from 'vitest';

vi.mock('../debug', () => ({ debugRequest: vi.fn() }));
import * as debug from '../debug';
import { forTesting, addRequestDataDebugging } from './source-api-debug';

describe('source-api-debug', () => {
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

  describe('addRequestDataDebugging', () => {
    const processEnvOriginal = { ...process.env };

    afterEach(() => {
      process.env = { ...processEnvOriginal };
      vi.restoreAllMocks();
    });

    it('debugs a matching request', () => {
      process.env.DEBUG_REQUEST_DATA = 'path';
      const spy = vi.spyOn(debug, 'debugRequest');
      addRequestDataDebugging({ url: 'path' });
      expect(spy).toHaveBeenCalled();
    });

    it('does not debug a non-matching request', () => {
      process.env.DEBUG_REQUEST_DATA = 'non-path';
      const spy = vi.spyOn(debug, 'debugRequest');
      addRequestDataDebugging({ url: 'path' });
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not debug when DEBUG_REQUEST_DATA is empty', () => {
      process.env.DEBUG_REQUEST_DATA = '';
      const spy = vi.spyOn(debug, 'debugRequest');
      addRequestDataDebugging({ url: 'path' });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
