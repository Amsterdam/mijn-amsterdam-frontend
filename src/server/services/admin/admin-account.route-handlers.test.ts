import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/config.ts', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    IS_DB_ENABLED: true,
  };
});

vi.mock('./admin-account.model.ts', () => ({
  getOrCreateAccountData: vi.fn(),
  updateAccountData: vi.fn(),
}));

import {
  getOrCreateAccountData,
  updateAccountData,
} from './admin-account.model.ts';
import {
  getAccountDataHandler,
  updateAccountDataHandler,
} from './admin-account.route-handlers.ts';
import { RequestMock, ResponseMock } from '../../../testing/utils.ts';

const mockedGetOrCreateAccountData = vi.mocked(getOrCreateAccountData);
const mockedUpdateAccountData = vi.mocked(updateAccountData);

describe('admin-account-route-handlers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns unauthorized when username is missing for GET', async () => {
    const req = RequestMock.new().get();
    const res = ResponseMock.new();

    await getAccountDataHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
      })
    );
  });

  it('returns account data for GET', async () => {
    const req = RequestMock.new().get();
    Object.assign(req, {
      session: {
        username: 'alice@example.com',
      },
    });
    const res = ResponseMock.new();

    mockedGetOrCreateAccountData.mockResolvedValue({
      username: 'alice@example.com',
      jiraApiToken: 'token',
      lastSignInDate: '2026-08-06T08:00:00.000Z',
    });

    await getAccountDataHandler(req, res);

    expect(mockedGetOrCreateAccountData).toHaveBeenCalledWith(
      'alice@example.com'
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'OK',
        content: expect.objectContaining({
          username: 'alice@example.com',
          jiraApiToken: 'token',
        }),
      })
    );
  });

  it('rejects invalid PUT body', async () => {
    const req = RequestMock.new().get();
    Object.assign(req, {
      session: {
        username: 'alice@example.com',
      },
      body: {},
    });
    const res = ResponseMock.new();

    await updateAccountDataHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUpdateAccountData).not.toHaveBeenCalled();
  });

  it('updates account data for PUT', async () => {
    const req = RequestMock.new().get();
    Object.assign(req, {
      session: {
        username: 'alice@example.com',
      },
      body: {
        jiraApiToken: 'new-token',
      },
    });
    const res = ResponseMock.new();

    mockedUpdateAccountData.mockResolvedValue({
      username: 'alice@example.com',
      jiraApiToken: 'new-token',
      lastSignInDate: '2026-08-06T08:00:00.000Z',
    });

    await updateAccountDataHandler(req, res);

    expect(mockedUpdateAccountData).toHaveBeenCalledWith('alice@example.com', {
      jiraApiToken: 'new-token',
    });
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'OK',
        content: expect.objectContaining({
          jiraApiToken: 'new-token',
        }),
      })
    );
  });
});
