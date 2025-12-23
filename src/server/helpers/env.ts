import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import memoizee from 'memoizee';

import { logger } from '../logging';
import { captureException } from '../services/monitoring';

export function loadEnvVariables(filePath?: string): void {
  console.debug(`Using local env file ${filePath}`);
  const envConfig = dotenv.config({ path: filePath });
  dotenvExpand.expand(envConfig);
}

/** Retrieve an environment variable.
 *
 * - Will never return undefined when `isRequired` (defaults `true`).
 * - Throws an error when a variable doesn't exist and it `isRequired`.
 */
function getFromEnv_(
  key: string,
  isRequired: boolean = true
): string | undefined {
  if (key in process.env) {
    return process.env[key];
  }
  if (isRequired) {
    const error = new Error(`ENV undefined key: ${key}.`);
    logger.error(error); // So we see it in logstream.
    captureException(error); // So we see it in monitoring.
  } else {
    logger.warn(`ENV undefined, but not required: ${key}`);
  }
}

// Prevents spamming the console with duplicate missing env messages
export const getFromEnv = memoizee(getFromEnv_);
