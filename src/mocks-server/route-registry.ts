import type { Express, NextFunction, Request, Response } from 'express';

import { logger } from './logger.ts';
import type {
  MockHttpMethod,
  MockRouteDefinition,
  MockServerCore,
  SupportedVariant,
} from './types.ts';

const core: MockServerCore = {
  logger,
};

function getDefaultVariant(route: MockRouteDefinition): SupportedVariant {
  return (
    route.variants.find((variant) => variant.id === 'standard') ??
    route.variants[0]
  );
}

function executeVariant(
  variant: SupportedVariant,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (variant.type === 'json') {
    res.status(variant.options.status).send(variant.options.body);
    return;
  }

  variant.options.middleware(req, res, next, core);
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
    const variant = getDefaultVariant(route);

    logger.info(`${route.method} ${route.url} (${route.id}:${variant.id})`);

    app[method](
      route.url,
      (req: Request, res: Response, next: NextFunction) => {
        executeVariant(variant, req, res, next);
      }
    );
  }
}
