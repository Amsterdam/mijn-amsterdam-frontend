import { describe, expect, vi } from 'vitest';

const mocksDbConfig = vi.hoisted(() => {
  return {
    IS_ENABLED: false,
  };
});

vi.mock('./config', async () => {
  const module: object = await vi.importActual('./config');
  return {
    ...module,
    get IS_ENABLED() {
      return mocksDbConfig.IS_ENABLED;
    },
  };
});

describe('db', () => {
  it('should return a fake db', async () => {
    mocksDbConfig.IS_ENABLED = false;
    const { db } = await import('./db');
    const result = await db();
    expect(result.id).toBe('fake-db');
  });
});
