import express from 'express';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { RequestMock, ResponseMock } from '../../testing/utils.ts';
import {
  defineMockRoute,
  defineMockRoutes,
  registerRoutes,
} from '../route-registry.ts';
import type { MockRouteDefinition } from '../types.ts';

function dispatch(routes: MockRouteDefinition[], url: string) {
  const app = express();
  app.disable('x-powered-by');
  registerRoutes(app, routes);

  const req = Object.assign(RequestMock.new().setUrl(url), {
    method: 'GET',
  });
  const res = ResponseMock.new();
  const next = vi.fn();
  app(req, res, next);

  return { res, next };
}

describe('mock route registration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('infers each URL independently in a mixed route array', () => {
    const basePath: string = '/mock';
    const routes = defineMockRoutes([
      {
        id: 'named-parameter',
        url: `${basePath}/items/:key`,
        method: 'GET',
        handler: {
          type: 'middleware',
          middleware(req, res) {
            expectTypeOf(req.params).toEqualTypeOf<{ key: string }>();
            res.send(req.params.key.toUpperCase());
          },
        },
      },
      {
        id: 'wildcard-parameter',
        url: '/files/*segments',
        method: 'GET',
        handler: {
          type: 'middleware',
          middleware(req, res) {
            expectTypeOf(req.params).toEqualTypeOf<{ segments: string[] }>();
            res.send(req.params.segments);
          },
        },
      },
      {
        id: 'optional-parameter',
        url: '/optional{/:key}',
        method: 'GET',
        handler: {
          type: 'middleware',
          middleware(req, res) {
            expectTypeOf(req.params.key).toEqualTypeOf<string | undefined>();
            res.send(req.params.key ?? 'all');
          },
        },
      },
      {
        id: 'json-response',
        url: '/status',
        method: 'GET',
        handler: { type: 'json', status: 201, body: { ok: true } },
      },
    ]);

    expect(dispatch(routes, '/mock/items/abc').res.send).toHaveBeenCalledWith(
      'ABC'
    );
    expect(dispatch(routes, '/files/one/two').res.send).toHaveBeenCalledWith([
      'one',
      'two',
    ]);
    expect(dispatch(routes, '/optional').res.send).toHaveBeenCalledWith('all');
    const { res } = dispatch(routes, '/status');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({ ok: true });
  });

  it('infers named parameters after a dynamic prefix and dispatches them', () => {
    const basePath: string = '/mock';
    const route = defineMockRoute({
      id: 'named-parameter',
      url: `${basePath}/items/:key`,
      method: 'GET',
      handler: {
        type: 'middleware',
        middleware(req, res) {
          expectTypeOf(req.params).toEqualTypeOf<{ key: string }>();
          res.send(req.params.key.toUpperCase());
        },
      },
    });

    const { res, next } = dispatch([route], '/mock/items/abc');

    expect(res.send).toHaveBeenCalledWith('ABC');
    expect(next).not.toHaveBeenCalled();
  });

  it('preserves array parameters for wildcard routes', () => {
    const route = defineMockRoute({
      id: 'wildcard-parameter',
      url: '/files/*segments',
      method: 'GET',
      handler: {
        type: 'middleware',
        middleware(req, res) {
          expectTypeOf(req.params).toEqualTypeOf<{ segments: string[] }>();
          res.send(req.params.segments);
        },
      },
    });

    const { res } = dispatch([route], '/files/one/two');

    expect(res.send).toHaveBeenCalledWith(['one', 'two']);
  });

  it('preserves optional named parameters', () => {
    const route = defineMockRoute({
      id: 'optional-parameter',
      url: '/items{/:key}',
      method: 'GET',
      handler: {
        type: 'middleware',
        middleware(req, res) {
          expectTypeOf(req.params.key).toEqualTypeOf<string | undefined>();
          res.send(req.params.key ?? 'all');
        },
      },
    });

    expect(dispatch([route], '/items').res.send).toHaveBeenCalledWith('all');
    expect(dispatch([route], '/items/abc').res.send).toHaveBeenCalledWith(
      'abc'
    );
  });

  it('retains delayed typed handlers and existing JSON routes in one list', () => {
    vi.useFakeTimers();
    const routes: MockRouteDefinition[] = [
      defineMockRoute({
        id: 'delayed-parameter',
        url: '/items/:key',
        method: 'GET',
        handler: {
          type: 'middleware',
          delayMs: 20,
          middleware(req, res) {
            res.send(req.params.key);
          },
        },
      }),
      {
        id: 'json-response',
        url: '/status',
        method: 'GET',
        handler: {
          type: 'json',
          status: 201,
          body: { ok: true },
        },
      },
    ];

    const delayed = dispatch(routes, '/items/abc');
    expect(delayed.res.send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(delayed.res.send).toHaveBeenCalledWith('abc');

    const immediate = dispatch(routes, '/status');
    expect(immediate.res.status).toHaveBeenCalledWith(201);
    expect(immediate.res.send).toHaveBeenCalledWith({ ok: true });
  });
});
