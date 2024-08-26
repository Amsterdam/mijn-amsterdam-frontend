import { describe, expect, vi } from 'vitest';

const mocksDbConfig = vi.hoisted(() => {
  return {
    IS_PG: false,
    IS_ENABLED: false,
  };
});

vi.mock('./config', async () => {
  const module: object = await vi.importActual('./config');
  return {
    ...module,
    get IS_PG() {
      return mocksDbConfig.IS_PG;
    },
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

  it('should return a postgres id when IS_PG is true', async () => {
    mocksDbConfig.IS_PG = true;
    mocksDbConfig.IS_ENABLED = true;

    const { db } = await import('./db');
    const result = await db();
    expect(result.id).toBe('postgres');
  });

  it('should return sqlite3 id when db is sqlite3', async () => {
    mocksDbConfig.IS_PG = false;
    mocksDbConfig.IS_ENABLED = true;

    const { db } = await import('./db');
    const result = await db();
    expect(result.id).toBe('sqlite3');
  });
});
