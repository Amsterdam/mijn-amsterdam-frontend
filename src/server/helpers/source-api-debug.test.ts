import type { AxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../debug', () => ({ debugRequest: vi.fn(), debugResponse: vi.fn() }));
import * as debug from '../debug.ts';
import {
  forTesting,
  addRequestDataDebugging,
  addResponseDataDebugging,
} from './source-api-debug.ts';

describe('source-api-debug', () => {
  describe('isDebugResponseDataMatch', () => {
    it('supports url + params + response term combinations', () => {
      const fn = forTesting.isDebugResponseDataMatch(
        {
          url: 'https://domain.nl/parent/path',
          params: {
            page: 2,
            filter: 'active',
          },
        },
        '{"items":[{"id":1}],"state":"ok"}'
      );

      expect(fn('path')).toBeTruthy();
      expect(fn('parent/path|filter|state')).toBeTruthy();
      expect(fn('parent/path|filter|')).toBeTruthy();
      expect(fn('parent/path||state')).toBeTruthy();
      expect(fn('parent/path|page;filter|items;state')).toBeTruthy();
      expect(fn('parent/path|2|')).toBeTruthy();
      expect(fn('parent/path||"id":1')).toBeTruthy();

      expect(fn('parent/path|page;missing|state;nope')).toBeFalsy();
      expect(fn('parent/path|missing|state')).toBeFalsy();
      expect(fn('parent/path|filter|missing')).toBeFalsy();
      expect(fn('other-path|filter|state')).toBeFalsy();
      expect(fn('|filter|state')).toBeFalsy();
      expect(fn('filter')).toBeFalsy();
      expect(fn('state')).toBeFalsy();
      expect(fn('missing')).toBeFalsy();
    });
  });

  describe('isDebugRequestDataMatch', () => {
    it('returns true when the path and terms match', () => {
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
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it('debugs a matching request', () => {
      vi.stubEnv('DEBUG_REQUEST_DATA', 'path');
      const spy = vi.spyOn(debug, 'debugRequest');
      addRequestDataDebugging({ url: 'path' });
      expect(spy).toHaveBeenCalled();
    });

    it('does not debug a non-matching request', () => {
      vi.stubEnv('DEBUG_REQUEST_DATA', 'non-path');
      const spy = vi.spyOn(debug, 'debugRequest');
      addRequestDataDebugging({ url: 'path' });
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not debug when DEBUG_REQUEST_DATA is empty', () => {
      vi.stubEnv('DEBUG_REQUEST_DATA', '');
      const spy = vi.spyOn(debug, 'debugRequest');
      addRequestDataDebugging({ url: 'path' });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('addResponseDataDebugging', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it('debugs a matching response using structured terms', () => {
      vi.stubEnv('DEBUG_RESPONSE_DATA', 'path|id|ready');
      const spy = vi.spyOn(debug, 'debugResponse');
      const config: AxiosRequestConfig = {
        url: 'https://domain.nl/path',
        params: {
          id: 123,
        },
      };

      addResponseDataDebugging(config);
      const [debugTransformer] = config.transformResponse as Array<
        (data: string, headers: object, status: number) => string
      >;

      debugTransformer('{"state":"ready"}', { 'x-request-id': 'abc' }, 200);

      expect(spy).toHaveBeenCalledWith('[STATUS]: %d', 200);
    });

    it('does not debug a non-matching response when structured terms do not match', () => {
      vi.stubEnv('DEBUG_RESPONSE_DATA', 'path|missing|ready');
      const spy = vi.spyOn(debug, 'debugResponse');
      const config: AxiosRequestConfig = {
        url: 'https://domain.nl/path',
        params: {
          id: 123,
        },
      };

      addResponseDataDebugging(config);
      const [debugTransformer] = config.transformResponse as Array<
        (data: string, headers: object, status: number) => string
      >;

      debugTransformer('{"state":"ready"}', { 'x-request-id': 'abc' }, 200);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
