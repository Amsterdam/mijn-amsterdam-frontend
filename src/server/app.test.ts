import type { ILayer, IRoute } from 'express-serve-static-core/index.js';

vi.mock('@azure/msal-node');

const mocks = vi.hoisted(() => {
  return {
    IS_OT: true,
    IS_AP: false,
  };
});

vi.mock('../universal/config/env', async (importOriginal) => {
  return {
    ...((await importOriginal()) as object),
    IS_DEVELOPMENT: false,
    get IS_OT() {
      return mocks.IS_OT;
    },
    get IS_AP() {
      return mocks.IS_AP;
    },
  };
});

describe('app', async () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('app middleware OT', async () => {
    const appModule = await import('./app.ts');
    const app = appModule.forTesting.app;
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle ? layer.handle.BFF_ID === 'router-dev' : false
      )
    ).toBe(true);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle ? layer.handle.BFF_ID === 'router-oidc' : false
      )
    ).toBe(false);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle
          ? layer.handle.BFF_ID === 'router-protected'
          : false
      )
    ).toBe(true);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle
          ? layer.handle.BFF_ID === 'router-private-network'
          : false
      )
    ).toBe(true);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle
          ? layer.handle.BFF_ID === 'router-admin'
          : false
      )
    ).toBe(true);
  }, 30000);

  test('app middleware AP', async () => {
    mocks.IS_AP = true;
    mocks.IS_OT = false;

    const appModule = await import('./app.ts');
    const app = appModule.forTesting.app;

    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle ? layer.handle.BFF_ID === 'router-dev' : false
      )
    ).toBe(false);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle ? layer.handle.BFF_ID === 'router-oidc' : false
      )
    ).toBe(true);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle
          ? layer.handle.BFF_ID === 'router-protected'
          : false
      )
    ).toBe(true);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle
          ? layer.handle.BFF_ID === 'router-private-network'
          : false
      )
    ).toBe(true);
    expect(
      app.router.stack.some((layer: ILayer) =>
        'BFF_ID' in layer.handle
          ? layer.handle.BFF_ID === 'router-admin'
          : false
      )
    ).toBe(true);
  });

  test('App Router admin', async () => {
    const appModule = await import('./app.ts');
    const app = appModule.forTesting.app;
    const routerAdmin = app.router.stack.find((layer: ILayer) => {
      return 'BFF_ID' in layer.handle && layer.handle.BFF_ID === 'router-admin';
    });

    const [
      sessionMiddleware,
      adminRouterPublic,
      authenticationMiddleware,
      adminRouterProtected,
    ] = (routerAdmin?.handle as unknown as IRoute).stack;
    expect(sessionMiddleware.handle.name).toBe('session');
    expect(
      'BFF_ID' in adminRouterPublic.handle && adminRouterPublic.handle.BFF_ID
    ).toBe('ma-admin-router-public');
    expect(authenticationMiddleware.name).toBe('isAuthenticatedAdmin');
    expect(
      'BFF_ID' in adminRouterProtected.handle &&
        adminRouterProtected.handle.BFF_ID
    ).toBe('ma-admin-router-protected');
  });

  test('App Router protected', async () => {
    const appModule = await import('./app.ts');
    const app = appModule.forTesting.app;
    const routerProtected = app.router.stack.find((layer: ILayer) => {
      return (
        'BFF_ID' in layer.handle && layer.handle.BFF_ID === 'router-protected'
      );
    });

    expect(routerProtected).toBeTruthy();

    expect(
      app.router.stack.some(
        (x: object) => 'name' in x && x.name === 'handleIsAuthenticated'
      )
    ).toBe(true);
  });
});
