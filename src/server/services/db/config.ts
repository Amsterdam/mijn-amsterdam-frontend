import { IS_AP, IS_OT, IS_PRODUCTION } from '../../../universal/config';

export const IS_PG = IS_AP;
export const IS_VERBOSE = IS_OT;

export const tableNameLoginCount =
  process.env.BFF_LOGIN_COUNT_TABLE ??
  (IS_PRODUCTION ? 'prod_login_count' : 'acc_login_count');
