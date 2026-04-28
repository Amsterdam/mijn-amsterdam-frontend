const mocks = vi.hoisted(() => ({
  IS_ADMIN_ROUTER_ENABLED: true,
  IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED: true,
}));

vi.mock('../services/admin/admin-service-config.ts', async (importActual) => {
  return {
    ...(await importActual()),
    get IS_ADMIN_ROUTER_ENABLED() {
      return mocks.IS_ADMIN_ROUTER_ENABLED;
    },
    get IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED() {
      return mocks.IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED;
    },
  };
});

describe('app-router-admin', () => {
  test('should have admin router disabled when the feature toggle is off', async () => {
    mocks.IS_ADMIN_ROUTER_ENABLED = false;
    vi.resetModules();
    const { router } = await import('./app-router-admin.ts');
    expect(router.stack.length).toBe(1);
    expect(router.stack[0].name).toBe('nextRouter');
  });

  test('should have admin router enabled when the feature toggle is on', async () => {
    mocks.IS_ADMIN_ROUTER_ENABLED = true;
    vi.resetModules();
    const { router } = await import('./app-router-admin.ts');
    expect(router.stack.length).toBeGreaterThan(1);
    expect(router.stack[0].name).not.toBe('nextRouter');
  });

  test('should have admin authentication middleware', async () => {
    mocks.IS_ADMIN_ROUTER_ENABLED = true;
    mocks.IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED = true;
    vi.resetModules();
    const { router } = await import('./app-router-admin.ts');
    expect(
      router.stack.some((layer) => layer.name === 'isAuthenticatedAdmin')
    ).toBe(true);
  });

  test('should NOT have admin authentication middleware', async () => {
    mocks.IS_ADMIN_ROUTER_ENABLED = true;
    mocks.IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED = false;
    vi.resetModules();
    const { router } = await import('./app-router-admin.ts');
    expect(
      router.stack.some((layer) => layer.name === 'isAuthenticatedAdmin')
    ).toBe(false);
  });
}, 10000);
