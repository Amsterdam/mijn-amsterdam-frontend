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
  return {
    router: {
      public: createMockBffRouter('ma-admin-router-public'),
      protected: createMockBffRouter('ma-admin-router-protected'),
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
  isEnabled = true,
  isAuthEnabled = true,
}: {
  isEnabled?: boolean;
  isAuthEnabled?: boolean;
} = {}) {
  return createAdminRouter({
    isAdminRouterEnabled: isEnabled,
    isAdminAuthenticationMiddlewareEnabled: isAuthEnabled,
    isProduction: false,
    bffAdminAuthExpressSessionSecret: 'test-secret',
    bffAdminAuthSessionCookieName: 'test-cookie',
  });
}

describe('app-router-admin', { timeout: 10000 }, () => {
  test('should have admin router disabled when the feature toggle is off', async () => {
    const router = await buildAdminRouter({ isEnabled: false });
    expect(router.stack.length).toBe(1);
    expect(router.stack[0].name).toBe('nextRouter');
  });

  test('should have admin router enabled when the feature toggle is on', async () => {
    const router = await buildAdminRouter({ isEnabled: true });
    expect(router.stack.length).toBeGreaterThan(1);
    expect(router.stack[0].name).not.toBe('nextRouter');
  });

  test('should have admin authentication middleware', async () => {
    const router = await buildAdminRouter({
      isEnabled: true,
      isAuthEnabled: true,
    });
    expect(
      router.stack.some((layer) => layer.name === 'isAuthenticatedAdmin')
    ).toBe(true);
  });

  test('should NOT have admin authentication middleware', async () => {
    const router = await buildAdminRouter({
      isEnabled: true,
      isAuthEnabled: false,
    });
    expect(
      router.stack.some((layer) => layer.name === 'isAuthenticatedAdmin')
    ).toBe(false);
  });

  test('should mount admin middleware stack in expected order', async () => {
    const router = await buildAdminRouter({
      isEnabled: true,
      isAuthEnabled: true,
    });
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
