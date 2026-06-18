import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { ILayer } from 'express-serve-static-core/index.js';

import { createAdminRouter } from './app-router-admin.ts';

function createMockBffRouter(id: string) {
  const router = express.Router() as express.Router & { BFF_ID: string };
  router.BFF_ID = id;
  return router;
}

vi.mock('express-session', () => {
  return {
    default: () =>
      function session(_req: Request, _res: Response, next: NextFunction) {
        next();
      },
  };
});

vi.mock('../services/admin/admin-route-handlers.ts', () => {
  return {
    isAuthenticatedAdmin(_req: Request, _res: Response, next: NextFunction) {
      next();
    },
  };
});

vi.mock('../services/admin/admin-router.ts', () => {
  const protectedRouter = createMockBffRouter('ma-admin-router-protected');
  protectedRouter.get('/admin', (_req: Request, res: Response) => {
    res.status(200).send('ok');
  });

  return {
    router: {
      public: createMockBffRouter('ma-admin-router-public'),
      protected: protectedRouter,
    },
  };
});

vi.mock('../services/user-feedback/user-feedback.router.ts', () => {
  return {
    userFeedbackRouter: {
      admin: createMockBffRouter('router-user-feedback-admin'),
    },
  };
});

vi.mock(
  '../services/amsapp/notifications/amsapp-notifications-router.ts',
  () => {
    return {
      amsappNotificationsRouter: {
        admin: createMockBffRouter('router-amsapp-notifications-admin'),
      },
    };
  }
);

async function buildAdminRouter({
  isAdminRouterEnabled,
  isAdminAuthenticationMiddlewareEnabled,
  isProduction,
}: {
  isAdminRouterEnabled: boolean;
  isAdminAuthenticationMiddlewareEnabled: boolean;
  isProduction: boolean;
}) {
  return createAdminRouter({
    isAdminRouterEnabled,
    isAdminAuthenticationMiddlewareEnabled,
    isProduction,
    bffAdminAuthExpressSessionSecret: 'test-secret',
    bffAdminAuthSessionCookieName: 'test-cookie',
  });
}

async function requestPathFromRouter({
  router,
  path,
}: {
  router: express.Router;
  path: string;
}) {
  const app = express();
  app.use(router);
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).send(err instanceof Error ? err.message : 'Unknown error');
  });

  const server = app.listen(0);

  try {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test server to a port');
    }

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    const text = await response.text();

    return {
      status: response.status,
      text,
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

describe('app-router-admin', () => {
  it('should have admin router disabled when the feature toggle is off', async () => {
    const router = await buildAdminRouter({
      isAdminRouterEnabled: false,
      isAdminAuthenticationMiddlewareEnabled: true,
      isProduction: true,
    });
    expect(router.stack.length).toBe(1);
    expect(router.stack[0].name).toBe('nextRouter');
  });

  it('should NOT have admin authentication middleware', async () => {
    const router = await buildAdminRouter({
      isAdminRouterEnabled: true,
      isAdminAuthenticationMiddlewareEnabled: false,
      isProduction: false,
    });
    expect(
      router.stack.some((layer) => layer.name === 'isAuthenticatedAdmin')
    ).toBe(false);
  });

  it('should return 200 when auth middleware is enabled in production', async () => {
    const router = await buildAdminRouter({
      isAdminRouterEnabled: true,
      isAdminAuthenticationMiddlewareEnabled: true,
      isProduction: true,
    });

    const response = await requestPathFromRouter({
      router,
      path: '/admin',
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });

  it('should return 500 when auth middleware is disabled in production', async () => {
    const router = await buildAdminRouter({
      isAdminRouterEnabled: true,
      isAdminAuthenticationMiddlewareEnabled: false,
      isProduction: true,
    });

    const response = await requestPathFromRouter({
      router,
      path: '/admin',
    });

    expect(response.status).toBe(500);
    expect(response.text).toContain(
      'Admin authentication middleware MUST be enabled in production.'
    );
  });

  describe('when admin router and auth middleware are enabled', () => {
    let router: Awaited<ReturnType<typeof buildAdminRouter>>;

    beforeAll(async () => {
      router = await buildAdminRouter({
        isAdminRouterEnabled: true,
        isAdminAuthenticationMiddlewareEnabled: true,
        isProduction: false,
      });
    });

    it('should have admin router enabled when the feature toggle is on', () => {
      expect(router.stack.length).toBeGreaterThan(1);
      expect(router.stack[0].name).not.toBe('nextRouter');
    });

    it('should have admin authentication middleware', () => {
      expect(
        router.stack.some((layer) => layer.name === 'isAuthenticatedAdmin')
      ).toBe(true);
    });

    it('should mount admin middleware stack in expected order', () => {
      const [
        sessionMiddleware,
        adminRouterPublic,
        authenticationMiddleware,
        adminRouterProtected,
        userFeedbackAdmin,
        amsappNotificationsAdmin,
      ] = router.stack as ILayer[];

      expect(sessionMiddleware.handle.name).toBe('session');
      expect(
        'BFF_ID' in adminRouterPublic.handle && adminRouterPublic.handle.BFF_ID
      ).toBe('ma-admin-router-public');
      expect(authenticationMiddleware.handle.name).toBe('isAuthenticatedAdmin');
      expect(
        'BFF_ID' in adminRouterProtected.handle &&
          adminRouterProtected.handle.BFF_ID
      ).toBe('ma-admin-router-protected');
      expect(
        'BFF_ID' in userFeedbackAdmin.handle && userFeedbackAdmin.handle.BFF_ID
      ).toBe('router-user-feedback-admin');
      expect(
        'BFF_ID' in amsappNotificationsAdmin.handle &&
          amsappNotificationsAdmin.handle.BFF_ID
      ).toBe('router-amsapp-notifications-admin');
    });
  });
});
