import type { Express, NextFunction, Request, Response } from 'express';

import { logger } from './logger.ts';
import type {
  MockHttpMethod,
  MockRouteDefinition,
  MockServerCore,
  SupportedHandler,
} from './types.ts';

const core: MockServerCore = {
  logger,
};

function summarizeHandlerOptions(
  handler: SupportedHandler
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

function executeHandler(
  route: MockRouteDefinition,
  handler: SupportedHandler,
  req: Request,
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

export function registerRoutes(
  app: Express,
  routes: MockRouteDefinition[]
): void {
  for (const route of routes) {
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

    app[method](
      route.url,
      (req: Request, res: Response, next: NextFunction) => {
        executeHandler(route, handler, req, res, next);
      }
    );
  }
}
