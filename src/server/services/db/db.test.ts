import { describe, expect, vi } from 'vitest';

const mocksDbConfig = vi.hoisted(() => {
  return {
    IS_PG: false,
    IS_DISABLED: false,
  };
});

vi.mock('./config', async () => {
  const module: object = await vi.importActual('./config');
  return {
    ...module,
    get IS_PG() {
      return mocksDbConfig.IS_PG;
    },
    get IS_DISABLED() {
      return mocksDbConfig.IS_DISABLED;
    },
  };
});

describe('db', () => {
  it('should return a fake db', async () => {
    mocksDbConfig.IS_DISABLED = true;
    const { db } = await import('./db');
    const result = await db();
    expect(result.id).toBe('fake-db');
  });

  it('should return a postgres id when IS_PG is true', async () => {
    mocksDbConfig.IS_PG = true;
    mocksDbConfig.IS_DISABLED = false;

    const { db } = await import('./db');
    const result = await db();
    expect(result.id).toBe('postgres');
  });

  it('should return sqlite3 id when db is sqlite3', async () => {
    mocksDbConfig.IS_PG = false;
    mocksDbConfig.IS_DISABLED = false;

    const { db } = await import('./db');
    const result = await db();
    expect(result.id).toBe('sqlite3');
  });
});
