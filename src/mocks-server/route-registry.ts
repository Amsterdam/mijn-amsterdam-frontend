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

function summarizeVariantOptions(
  variant: SupportedVariant
): Record<string, unknown> {
  if (variant.type === 'json') {
    return {
      status: variant.options.status,
      delayMs: variant.options.delayMs ?? 0,
    };
  }

  return {
    hasMiddleware: true,
    delayMs: variant.options.delayMs ?? 0,
  };
}

function executeVariant(
  route: MockRouteDefinition,
  variant: SupportedVariant,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const executeResponse = () => {
    if (variant.type === 'json') {
      res.status(variant.options.status).send(variant.options.body);
      return;
    }

    variant.options.middleware(req, res, next, core);
  };

  const delayMs = variant.options.delayMs ?? 0;
  const delayed = delayMs > 0;

  logger.info(
    {
      routeId: route.id,
      variantId: variant.id,
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
    const variant = getDefaultVariant(route);
    const delayMs = variant.options.delayMs ?? 0;

    logger.info(
      {
        routeId: route.id,
        method: route.method,
        url: route.url,
        variantId: variant.id,
        variantType: variant.type,
        delayed: delayMs > 0,
        options: summarizeVariantOptions(variant),
      },
      'registering mock route variant'
    );

    app[method](
      route.url,
      (req: Request, res: Response, next: NextFunction) => {
        executeVariant(route, variant, req, res, next);
      }
    );
  }
}
