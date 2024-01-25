import {
  APP_MODE,
  IS_AP,
  IS_OT,
  IS_PRODUCTION,
  FeatureToggle,
} from '../../../universal/config';

export const IS_PG = IS_AP;

export const IS_DISABLED = FeatureToggle.dbDisabled;

export const IS_VERBOSE = IS_OT && APP_MODE !== 'unittest';

export const tableNameLoginCount =
  process.env.BFF_LOGIN_COUNT_TABLE ||
  (IS_PRODUCTION ? 'prod_login_count' : 'acc_login_count');

export const tableNameSessionBlacklist =
  process.env.BFF_LOGIN_SESSION_BLACKLIST_TABLE ||
  (IS_PRODUCTION ? 'prod_session_blacklist' : 'acc_session_blacklist');
