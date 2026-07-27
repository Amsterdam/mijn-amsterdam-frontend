import { vi, describe, it, expect, beforeEach } from 'vitest';

import {
  forTesting,
  getValueMapFromEnv,
  translateValueFromEnv,
} from './env.ts';
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

  it('Gets the value map from env when present', async () => {
    process.env.TEST_KEY = 'foo=bar,baz=qux';
    const valueMap = getValueMapFromEnv('TEST_KEY');
    expect(valueMap.get('foo')).toBe('bar');
    expect(valueMap.get('baz')).toBe('qux');
  });

  it('Returns an empty map when the env variable is not present', async () => {
    const valueMap = getValueMapFromEnv('MISSING_KEY');
    expect(valueMap.size).toBe(0);
  });

  it('Returns an empty map when the env variable is empty', async () => {
    process.env.TEST_KEY = '';
    const valueMap = getValueMapFromEnv('TEST_KEY');
    expect(valueMap.size).toBe(0);
  });

  it('Returns an empty map when the env variable is malformed', async () => {
    process.env.TEST_KEY = 'foo=bar,baz';
    const valueMap = getValueMapFromEnv('TEST_KEY');
    expect(valueMap.size).toBe(1);
    expect(valueMap.get('foo')).toBe('bar');
  });

  it('translateValueFromEnv returns the correct value when present', async () => {
    process.env.TEST_KEY = 'foo=bar,baz=qux';
    const result = translateValueFromEnv('TEST_KEY', 'foo');
    expect(result).toBe('bar');
  });

  it('translateValueFromEnv returns the key when not present', async () => {
    process.env.TEST_KEY = 'foo=bar,baz=qux';
    const result = translateValueFromEnv('TEST_KEY', 'nonexistent');
    expect(result).toBe('nonexistent');
  });

  it('translateValueFromEnv returns the key when env variable is not present', async () => {
    const result = translateValueFromEnv('MISSING_KEY', 'nonexistent');
    expect(result).toBe('nonexistent');
  });
});
