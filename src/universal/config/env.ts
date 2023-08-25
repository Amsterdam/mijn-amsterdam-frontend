type OtapEnvName = 'development' | 'test' | 'acceptance' | 'production';
type AppModeName = 'development' | 'test' | 'production';

function getAppMode(): AppModeName {
  const maAppMode =
    typeof MA_APP_MODE !== 'undefined' ? MA_APP_MODE : process.env.MA_APP_MODE;
  return (maAppMode || 'production') as AppModeName;
}

function getOtapEnv(): OtapEnvName {
  const maOtapEnv =
    typeof MA_OTAP_ENV !== 'undefined' ? MA_OTAP_ENV : process.env.MA_OTAP_ENV;
  return (maOtapEnv || 'development') as OtapEnvName;
}

export const ENV = getOtapEnv();

getAppMode() !== 'test' &&
  console.info(
    `App running in ${getAppMode()} mode on the ${getOtapEnv()} environment.`
  );

export const IS_ACCEPTANCE = ENV === 'acceptance';
export const IS_PRODUCTION = ENV === 'production';
export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;
