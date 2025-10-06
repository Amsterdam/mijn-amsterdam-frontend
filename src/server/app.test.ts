import { ILayer } from 'express-serve-static-core/index';

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
    const appModule = await import('./app');
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
  }, 30000);

  test('app middleware AP', async () => {
    mocks.IS_AP = true;
    mocks.IS_OT = false;

    const appModule = await import('./app');
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
  });

  test('Router protected', async () => {
    const appModule = await import('./app');
    const app = appModule.forTesting.app;
    const routerProtected = app.router.stack.find((layer: ILayer) => {
      return (
        'BFF_ID' in layer.handle && layer.handle.BFF_ID === 'router-protected'
      );
    });

    expect(routerProtected).toBeTruthy();

    expect(
      routerProtected.handle.stack.some(
        (x: object) => 'name' in x && x.name === 'handleIsAuthenticated'
      )
    ).toBe(true);
    expect(
      routerProtected.handle.stack.some(
        (x: object) => 'name' in x && x.name === 'handleCheckProtectedRoute'
      )
    ).toBe(true);
  });
});
