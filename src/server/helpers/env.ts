import memoizee from 'memoizee';

import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { logger } from '../logging.ts';
import { captureException } from '../services/monitoring.ts';

/** Retrieve an environment variable.
 *
 * - Will never return undefined when `isRequired` (defaults `true`).
 * - Throws an error when a variable doesn't exist and it `isRequired`.
 */
function getFromEnv_(
  key: string,
  isRequired: boolean = true,
  doThrow: boolean = false
): string | undefined {
  if (key in process.env) {
    return process.env[key];
  }
  if (isRequired) {
    const error = new Error(`ENV undefined key: ${key}.`);

    if (doThrow) {
      throw error;
    }

    logger.error(error); // So we see it in logstream.
    captureException(error); // So we see it in monitoring.
  } else {
    logger.warn(`ENV undefined, but not required: ${key}`);
  }
}

// Prevents spamming the console with duplicate missing env messages
export const getFromEnv = memoizee(getFromEnv_);
export const forTesting = { getFromEnv_ };

export function parseValueMapString(envValue?: string): Map<string, string> {
  if (!envValue) {
    return new Map();
  }

  const envValueMap = new Map(
    envValue
      .split(',')
      .filter((pair) => pair.includes('='))
      .map((pair) => pair.split('='))
      .filter(([key]) => !!key) as Iterable<[string, string]>
  );

  return envValueMap;
}

export function getValueMapFromEnv(envKey: string): Map<string, string> {
  return parseValueMapString(getFromEnv(envKey, false));
}

export function getValueFromEnvByKey(
  envKey: string,
  valueKey: string
): string | null {
  return getValueMapFromEnv(envKey).get(valueKey) ?? null;
}

export function translateValueFromEnv<K>(envKey: string, valueKey: K): K {
  // IS_PRODUCTION is explicitly set to exclude this code from being used in this environment.
  const envValueMap = getValueMapFromEnv(envKey);

  if (IS_PRODUCTION || envValueMap.size === 0) {
    return valueKey;
  }

  return (envValueMap.get(valueKey as unknown as string) as K) ?? valueKey;
}
