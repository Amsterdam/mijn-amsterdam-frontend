// Load environment variables.
//
// DO NOT POLLUTE THIS FILE WITH MORE IMPORTS.
// Reason being, that this can cause unexpected side effects.

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// Try not to import anything in the following imported file.
// If you need to do this, then make sure not to import anything that constructs something -
// that is dependent on environment variables.
import { IS_DEVELOPMENT } from '../../universal/config/env';

const LOCAL_ENV_FILE = '.env.local';

if (IS_DEVELOPMENT) {
  console.debug(`Using local env file ${LOCAL_ENV_FILE}`);
  const envConfig = dotenv.config({ path: LOCAL_ENV_FILE });
  dotenvExpand.expand(envConfig);
}
