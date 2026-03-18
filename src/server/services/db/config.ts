import { APP_MODE, IS_OT } from '../../../universal/config/env.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const IS_DB_ENABLED = getFromEnv('BFF_DB_ENABLED') === 'true';

export const IS_VERBOSE = IS_OT && APP_MODE !== 'unittest';

export const tableNameLoginCount =
  getFromEnv('BFF_LOGIN_COUNT_TABLE', false) || 'visitor_count';
