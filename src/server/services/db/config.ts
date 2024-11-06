import { APP_MODE, IS_OT } from '../../../universal/config/env';
import { getFromEnv } from '../../helpers/env';

export const IS_DB_ENABLED = getFromEnv('BFF_DB_ENABLED') === 'true';

export const IS_VERBOSE = IS_OT && APP_MODE !== 'unittest';

export const tableNameLoginCount =
  getFromEnv('BFF_LOGIN_COUNT_TABLE', false) || 'visitor_count';

export const tableNameSessionBlacklist =
  getFromEnv('BFF_LOGIN_SESSION_BLACKLIST_TABLE', false) || 'session_blacklist';
