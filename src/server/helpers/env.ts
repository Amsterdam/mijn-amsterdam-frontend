import memoizee from 'memoizee';

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
    console.error(new Error(`ENV undefined key: ${key}.`));
  } else {
    console.warn(`ENV undefined, but not required: ${key}`);
  }
}

// Prevents spamming the console with duplicate missing env messages
export const getFromEnv = memoizee(getFromEnv_);
