import { describe, expect, vi } from 'vitest';

const mocksUniversalConfig = vi.hoisted(() => {
  return {
    FeatureToggle: {
      dbDisabled: false,
    },
    IS_AP: true,
  };
});

vi.mock('../../../universal/config', async () => {
  const module = await vi.importActual('../../../universal/config');

  return {
    // @ts-ignore
    ...module,
    ...mocksUniversalConfig,
  };
});

describe('db', () => {
  it('should return a fake db', async () => {
    mocksUniversalConfig.FeatureToggle.dbDisabled = true;

    const db = await import('./db');
    const result = await db.db();

    expect(result.id).toBe('fake-db');
  });

  it('should return a postgres db', async () => {
    mocksUniversalConfig.FeatureToggle.dbDisabled = false;

    const db = await import('./db');
    const result = await db.db();

    expect(result.id).toBe('postgres');
    expect(result.id).toBe('postgres');
  });

  // it('should return a sqlite db', async () => {
  //   mocksUniversalConfig.FeatureToggle.dbDisabled = false;
  //   mocksUniversalConfig.IS_AP = true;
  //
  //   const db = await import('./db');
  //   const result = await db.db();
  //
  //   expect(result.id).toBe('sqlite3');
  // });
});
