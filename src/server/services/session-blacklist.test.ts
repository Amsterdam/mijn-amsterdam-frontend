import { isBlacklisted } from './session-blacklist';

type Mocks = { queryGET: null | { count: number } };

const mocks: Mocks = vi.hoisted(() => {
  return {
    queryGET: null,
  };
});

describe('Session-blacklist', () => {
  vi.mock('./db/db', () => {
    return {
      db: async () => ({
        queryGET: async (sessionID: string) => mocks.queryGET,
        query: vi.fn(),
        queryALL: vi.fn(),
      }),
    };
  });

  test('Is blacklisted', async () => {
    const sessionID = 'test123';
    mocks.queryGET = { count: 1 };
    const rs = await isBlacklisted(sessionID);

    expect(rs).toBe(true);
  });

  test('Is Not blacklisted', async () => {
    const sessionID = 'test123';
    mocks.queryGET = { count: 0 };
    const rs = await isBlacklisted(sessionID);

    expect(rs).toBe(false);
  });
});
