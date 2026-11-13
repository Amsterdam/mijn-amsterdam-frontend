import type { Express, NextFunction, Request, Response } from 'express';
import type { RouteParameters } from 'express-serve-static-core';

import { logger } from './logger.ts';
import type {
  MockHttpMethod,
  MockRouteConfig,
  MockRouteDefinition,
  MockServerCore,
  RegisteredMockRouteDefinition,
  SupportedHandler,
} from './types.ts';

const core: MockServerCore = {
  logger,
};

function summarizeHandlerOptions<Route extends string>(
  handler: SupportedHandler<Route>
): Record<string, unknown> {
  if (handler.type === 'json') {
    return {
      status: handler.status,
      delayMs: handler.delayMs ?? 0,
    };
  }

  return {
    hasMiddleware: true,
    delayMs: handler.delayMs ?? 0,
  };
}

function executeHandler<Route extends string>(
  route: MockRouteConfig<Route>,
  handler: SupportedHandler<Route>,
  req: Request<RouteParameters<Route>>,
  res: Response,
  next: NextFunction
): void {
  const executeResponse = () => {
    if (handler.type === 'json') {
      res.status(handler.status).send(handler.body);
      return;
    }

    handler.middleware(req, res, next, core);
  };

  const delayMs = handler.delayMs ?? 0;
  const delayed = delayMs > 0;

  logger.info(
    {
      routeId: route.id,
      method: req.method,
      url: req.originalUrl,
      delayed,
      delayMs,
    },
    'executing mock route response'
  );

  if (!delayed) {
    executeResponse();
    return;
  }

  setTimeout(executeResponse, delayMs);
}

function toExpressMethod(method: MockHttpMethod): Lowercase<MockHttpMethod> {
  return method.toLowerCase() as Lowercase<MockHttpMethod>;
}

function registerRoute<Route extends string>(
  app: Express,
  route: MockRouteConfig<Route>
): void {
  const method = toExpressMethod(route.method);
  const handler = route.handler;
  const delayMs = handler.delayMs ?? 0;

  logger.debug(
    {
      routeId: route.id,
      method: route.method,
      url: route.url,
      handlerType: handler.type,
      delayed: delayMs > 0,
      options: summarizeHandlerOptions(handler),
    },
    'registering mock route handler'
  );

  app[method]<Route>(route.url, (req, res, next) => {
    executeHandler(route, handler, req, res, next);
  });
}

export function defineMockRoute<const Route extends string>(
  route: MockRouteConfig<Route>
): RegisteredMockRouteDefinition {
  return {
    id: route.id,
    url: route.url,
    method: route.method,
    register(app) {
      registerRoute(app, route);
    },
  };
}

export function registerRoutes(
  app: Express,
  routes: MockRouteDefinition[]
): void {
  for (const route of routes) {
    if ('register' in route) {
      route.register(app);
    } else {
      registerRoute(app, route);
    }
  }
}
