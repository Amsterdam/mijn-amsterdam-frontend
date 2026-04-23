import { vi, describe, it, expect, beforeEach } from 'vitest';

import { forTesting } from './env.ts';
import { logger } from '../logging.ts';
import * as monitoring from '../services/monitoring.ts';

describe('getFromEnv', () => {
  const loggerSpy = vi.spyOn(logger, 'error');
  const warnSpy = vi.spyOn(logger, 'warn');
  const captureExceptionSpy = vi.spyOn(monitoring, 'captureException');

  beforeEach(() => {
    // ensure no lingering env vars between tests
    delete process.env.TEST_KEY;
    delete process.env.MY_KEY;
    delete process.env.MISSING_KEY;
  });

  it('returns the environment variable when present', async () => {
    process.env.MY_KEY = 'value';
    expect(forTesting.getFromEnv_('MY_KEY')).toBe('value');
  });

  it('logs an error and captures exception when missing and required', async () => {
    expect(forTesting.getFromEnv_('MISSING_KEY')).toBeUndefined();
    expect(loggerSpy).toHaveBeenCalled();
    expect(captureExceptionSpy).toHaveBeenCalled();
  });

  it('warns when the variable is not required', async () => {
    expect(forTesting.getFromEnv_('MISSING_KEY', false)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('throws when doThrow is true for a missing required variable', async () => {
    expect(() => forTesting.getFromEnv_('MISSING_KEY', true, true)).toThrow(
      /ENV undefined key: MISSING_KEY/
    );
  });
});
