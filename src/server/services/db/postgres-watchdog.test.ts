import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { range } from '../../../universal/helpers/utils.ts';

const DB_WATCHDOG_INTERVAL_MS = 60_000;
const DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES = 5;

const mocks = vi.hoisted(() => {
  return {
    APP_MODE: 'production' as string,
    IS_DEVELOPMENT: false,
    IS_DB_ENABLED: true,

    poolConfig: undefined as unknown,
    poolQuery:
      vi.fn<
        (queryText: string, values?: unknown[]) => Promise<{ rows?: unknown[] }>
      >(),
    poolOn: vi.fn(),
    poolEnd: vi.fn<() => Promise<void>>(),

    captureException: vi.fn(),
  };
});

vi.mock('pg', () => {
  class PoolMock {
    query = mocks.poolQuery;
    on = mocks.poolOn;
    end = mocks.poolEnd;

    constructor(config: unknown) {
      mocks.poolConfig = config;
    }
  }

  return { Pool: PoolMock };
});

vi.mock('../../../universal/config/env', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    get APP_MODE() {
      return mocks.APP_MODE;
    },
    get IS_DEVELOPMENT() {
      return mocks.IS_DEVELOPMENT;
    },
  };
});

vi.mock('./config', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    get IS_DB_ENABLED() {
      return mocks.IS_DB_ENABLED;
    },
  };
});

vi.mock('../monitoring', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    captureException: mocks.captureException,
  };
});

beforeEach(() => {
  mocks.APP_MODE = 'development';
  mocks.IS_DEVELOPMENT = false;
  mocks.IS_DB_ENABLED = true;

  mocks.poolConfig = undefined;
  mocks.poolQuery.mockReset();
  mocks.poolOn.mockReset();
  mocks.poolEnd.mockReset();
  mocks.captureException.mockReset();

  mocks.poolEnd.mockResolvedValue();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

describe('postgres watchdog', () => {
  it('does not start in unittest APP_MODE', async () => {
    vi.resetModules();
    mocks.APP_MODE = 'unittest';
    mocks.IS_DB_ENABLED = true;

    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    const postgres = await import('./postgres.ts');
    postgres.getPool();

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('exits the process after DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES consecutive failed pings (when enabled)', async () => {
    vi.resetModules();
    mocks.APP_MODE = 'development';
    mocks.IS_DB_ENABLED = true;

    const err = new Error('db down');
    mocks.poolQuery.mockRejectedValue(err);

    vi.useFakeTimers();
    const exitSpy = vi
      .spyOn(process, 'exit')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation((() => undefined) as any);

    const postgres = await import('./postgres.ts');
    postgres.getPool();

    for (const _ of range(1, DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES - 1)) {
      await vi.advanceTimersByTimeAsync(DB_WATCHDOG_INTERVAL_MS);
    }

    expect(mocks.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        properties: expect.objectContaining({
          name: 'db-watchdog-ping-failed',
        }),
      })
    );
    expect(mocks.captureException).not.toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        properties: expect.objectContaining({
          name: 'db-watchdog-ping-failed-max-retries',
        }),
      })
    );
    expect(exitSpy).not.toHaveBeenCalled();

    // DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES consecutive failure: should capture and exit.
    await vi.advanceTimersByTimeAsync(DB_WATCHDOG_INTERVAL_MS);

    expect(mocks.captureException).toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        properties: expect.objectContaining({
          name: 'db-watchdog-ping-failed-max-retries',
        }),
      })
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('resets consecutive failures after a successful ping', async () => {
    vi.resetModules();
    mocks.APP_MODE = 'development';
    mocks.IS_DB_ENABLED = true;

    mocks.poolQuery
      .mockRejectedValueOnce(new Error('response 1: fail'))
      .mockResolvedValueOnce({ rows: [{ ok: 1 }] });

    const nMockResponses = 2;
    for (const i of range(
      nMockResponses + 1,
      nMockResponses + DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES - 1
    )) {
      mocks.poolQuery.mockRejectedValueOnce(new Error(`response ${i}: fail`));
    }

    mocks.poolQuery.mockResolvedValue({ rows: [{ ok: 1 }] });

    vi.useFakeTimers();
    const exitSpy = vi
      .spyOn(process, 'exit')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation((() => undefined) as any);

    const postgres = await import('./postgres.ts');
    postgres.getPool();

    for (const _ of range(1, 7)) {
      await vi.advanceTimersByTimeAsync(DB_WATCHDOG_INTERVAL_MS);
    }

    expect(exitSpy).not.toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledTimes(
      DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES
    );
    expect(mocks.captureException).not.toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        properties: expect.objectContaining({
          name: 'db-watchdog-ping-failed-max-retries',
        }),
      })
    );
  });
});
