import {
  IS_TEST,
  IS_ACCEPTANCE,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
} from '../../../universal/config/env';
import { ONE_HOUR_MS } from '../../config/app';

export const CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS = ONE_HOUR_MS;
export const notificationEnvMap = {
  tst: IS_TEST,
  acc: IS_ACCEPTANCE,
  prd: IS_PRODUCTION,
  dev: IS_DEVELOPMENT,
} as const;

export const DEFAULT_SEVERITY = 'warning';
export const DEFAULT_OTAP_ENV = 'prd';
export const REPLACE_REL_URL_PARTS =
  'storingsmeldingen/alle-meldingen-mijn-amsterdam';
export const CMS_DATE_REGEX = /(\d{4})(\d{2})(\d{2})/; //20230118
export const CMS_TIME_REGEX = /(\d{2})(\d{2})/; //2359
