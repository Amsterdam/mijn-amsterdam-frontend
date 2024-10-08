type OtapEnvName = 'development' | 'test' | 'acceptance' | 'production';
type AppModeName = 'development' | 'unittest' | 'production';

function getAppMode(): AppModeName {
  const maAppMode =
    typeof MA_APP_MODE !== 'undefined' ? MA_APP_MODE : process.env.MA_APP_MODE;
  return (maAppMode || 'production') as AppModeName;
}

export function getOtapEnv(): OtapEnvName {
  const maOtapEnv =
    typeof MA_OTAP_ENV !== 'undefined' ? MA_OTAP_ENV : process.env.MA_OTAP_ENV;
  return (maOtapEnv || 'development') as OtapEnvName;
}

export const OTAP_ENV = getOtapEnv();

export const APP_MODE = getAppMode();

APP_MODE !== 'unittest' &&
  console.info(
    `App running in ${APP_MODE} mode on the ${OTAP_ENV} environment.`
  );
export const IS_ACCEPTANCE = OTAP_ENV === 'acceptance';
export const IS_PRODUCTION = OTAP_ENV === 'production';
export const IS_TEST = OTAP_ENV === 'test';
export const IS_DEVELOPMENT = OTAP_ENV === 'development';
export const IS_OT = IS_DEVELOPMENT || IS_TEST;
export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;
export const IS_TAP = IS_TEST || IS_ACCEPTANCE || IS_PRODUCTION;

import { HTTP_STATUS_CODES } from '../constants/errorCodes';

(() => {
  console.info(
    `App running in ${APP_MODE} mode on the ${OTAP_ENV} environment.`
  );
  console.info(
    `Example error code: ${HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR}`
  );
})();
