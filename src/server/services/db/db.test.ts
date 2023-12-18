import { beforeEach, describe, expect } from 'vitest';

const mocksUniversalConfig = vi.hoisted(() => {
  return {
    FeatureToggle: {
      dbEnabled: false,
    },
    IS_AP: true,
  };
});

vi.mock("../../../universal/config",  async ()=>{
  const module =  await vi.importActual('../../../universal/config');

  return {
     // @ts-ignore
    ...module,
    ...mocksUniversalConfig,
  }
})

// vi.mock("./config",  async ()=>{
//   const module =  await vi.importActual('./config');
//
//   return {
//      // @ts-ignore
//     ...module,
//     ...mocksConfig,
//   }
// })

describe('db', () => {
  it('should return a fake db', async () => {
    mocksUniversalConfig.FeatureToggle.dbEnabled = true

    const db = await import('./db');
    const result = await db.db();
    expect(result.id).toBe('fake-db');
  })

  it('should return a postgres id when IS_AP is true', async () => {
    mocksUniversalConfig.FeatureToggle.dbEnabled = false

    const db = await import('./db');
    const result = await db.db();
      expect(result.id).toBe('postgres');
  })

  it('should return sqlite3 id when db is sqlite3', async () => {
    mocksUniversalConfig.FeatureToggle.dbEnabled = false
    mocksUniversalConfig.IS_AP = true

    const db = await import('./db');
    const result = await db.db();
    expect(result.id).toBe('sqlite3');
  })
})
