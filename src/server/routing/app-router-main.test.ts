import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { ILayer } from 'express-serve-static-core/index.js';

import { createMainRouter } from './app-router-main.ts';

vi.mock('@azure/msal-node');

function createMockBffRouter(id: string) {
  const router = express.Router() as express.Router & { BFF_ID: string };
  router.BFF_ID = id;
  return router;
}

vi.mock('../logging.ts', () => {
  return {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

vi.mock('./app-router-development.ts', () => {
  return {
    authRouterDevelopment: createMockBffRouter('router-dev'),
  };
});

vi.mock('./app-router-oidc.ts', () => {
  return {
    oidcRouter: createMockBffRouter('router-oidc'),
  };
});

vi.mock('./app-router-protected.ts', () => {
  return {
    router: createMockBffRouter('router-protected'),
  };
});

vi.mock('./app-router-private.ts', () => {
  return {
    router: createMockBffRouter('router-private-network'),
  };
});

vi.mock('./app-router-public-external-consumer.ts', () => {
  return {
    router: createMockBffRouter('router-public-external-consumer'),
  };
});

vi.mock('./app-router-public.ts', () => {
  const legacyRouter = express.Router();
  const router = express.Router();

  return {
    legacyRouter,
    router,
  };
});

vi.mock('./app-router-admin.ts', () => {
  return {
    router: createMockBffRouter('router-admin'),
  };
});

vi.mock('./route-handlers.ts', () => {
  return {
    nocache(_req: Request, _res: Response, next: NextFunction) {
      next();
    },
    handleIsAuthenticated(_req: Request, _res: Response, next: NextFunction) {
      next();
    },
  };
});

function hasRouterWithId(router: express.Router, routerId: string) {
  return router.stack.some((layer: ILayer) =>
    'BFF_ID' in layer.handle ? layer.handle.BFF_ID === routerId : false
  );
}

function expectRouterPresence(
  router: express.Router,
  expectedPresence: Partial<Record<string, boolean>>
) {
  for (const routerId of Object.keys(expectedPresence)) {
    expect(hasRouterWithId(router, routerId)).toBe(expectedPresence[routerId]);
  }
}

describe('app-router-main', () => {
  test('app middleware OT', () => {
    const router = createMainRouter({ isOT: true, isAP: false });
    expectRouterPresence(router, {
      'router-dev': true,
      'router-oidc': false,
      'router-protected': true,
      'router-private-network': true,
      'router-admin': true,
    });
  });

  test('app middleware AP', () => {
    const router = createMainRouter({ isOT: false, isAP: true });
    expectRouterPresence(router, {
      'router-dev': false,
      'router-oidc': true,
      'router-protected': true,
      'router-private-network': true,
      'router-admin': true,
    });
  });

  test('App Router admin', () => {
    const router = createMainRouter({ isOT: true, isAP: false });
    expectRouterPresence(router, {
      'router-admin': true,
    });
  });

  test('App Router protected', () => {
    const router = createMainRouter({ isOT: true, isAP: false });
    expectRouterPresence(router, {
      'router-protected': true,
    });
    expect(
      router.stack.some(
        (x: object) => 'name' in x && x.name === 'handleIsAuthenticated'
      )
    ).toBe(true);
  });
});
