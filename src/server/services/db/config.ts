import {
  APP_MODE,
  FeatureToggle,
  IS_OT,
  IS_PRODUCTION,
} from '../../../universal/config';

export const IS_PG = process.env.BFF_DB_PG_ENABLED === 'true';

export const IS_DISABLED = FeatureToggle.dbDisabled;

export const IS_VERBOSE = IS_OT && APP_MODE !== 'unittest';

export const tableNameLoginCount =
  process.env.BFF_LOGIN_COUNT_TABLE ||
  (IS_PRODUCTION ? 'prod_login_count' : 'acc_login_count');

export const tableNameSessionBlacklist =
  process.env.BFF_LOGIN_SESSION_BLACKLIST_TABLE ||
  (IS_PRODUCTION ? 'prod_session_blacklist' : 'acc_session_blacklist');
