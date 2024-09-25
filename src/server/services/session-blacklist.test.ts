import {
  addToBlackList,
  cleanupSessionIds,
  getIsBlackListed,
} from './session-blacklist';

const mocks = vi.hoisted(() => {
  return {
    db: {
      id: 'x',
      query: vi.fn(),
      queryGET: vi.fn(),
      queryALL: vi.fn(),
    },
  };
});

vi.mock('../services/db/db', async () => {
  return {
    db: async () => mocks.db,
  };
});

describe('Session-blacklist', () => {
  const sessionID = 'test123';

  test('Is NOT blacklisted', async () => {
    const rs = await getIsBlackListed(sessionID);
    expect(mocks.db.queryGET).toHaveBeenCalled();
    expect(rs).toBe(false);
  });

  test('Add to black list', async () => {
    await addToBlackList(sessionID);
    expect(mocks.db.query).toHaveBeenCalledWith(
      'INSERT INTO session_blacklist (session_id) VALUES ($1) RETURNING id',
      ['test123']
    );
  });

  test('Is blacklisted', async () => {
    mocks.db.queryGET.mockResolvedValueOnce({ count: 1 });
    const rs = await getIsBlackListed(sessionID);
    expect(rs).toBe(true);
  });

  test('Clean up session ids', async () => {
    await cleanupSessionIds(-1);
    const rs = await getIsBlackListed(sessionID);
    expect(rs).toBe(false);
  });
});
