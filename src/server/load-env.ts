import process from 'node:process';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import { IS_DEVELOPMENT } from '../universal/config/env.ts';

if (IS_DEVELOPMENT) {
  const ENV_FILE = '.env.local';
  // This runs local only and -
  // we can't load the logger before we loader our environment variables.
  // eslint-disable-next-line no-console
  console.debug(`Using local env file ${ENV_FILE}`);
  const envConfig = dotenv.config({ path: ENV_FILE });
  dotenvExpand.expand(envConfig);
}

if (process.env.DEBUG_RESPONSE_DATA) {
  process.env.DEBUG = `source-api-request:request,${process.env.DEBUG ?? ''}`;
}
