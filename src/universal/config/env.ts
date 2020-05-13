function getBrowserEnv() {
  let otapServerEnvFrontend = 'development';
  // eslint-disable-next-line
  const isAcceptanceServer = eval(
    "window.location.host === 'acc.amsterdam.nl'"
  );
  // eslint-disable-next-line
  const isProductionServer = eval("window.location.host === 'amsterdam.nl'");
  // eslint-disable-next-line
  const isTestServer = eval("window.location.host === 'mijn.ot.amsterdam.nl'");
  switch (true) {
    case isTestServer:
      otapServerEnvFrontend = 'test';
      break;
    case isAcceptanceServer:
      otapServerEnvFrontend = 'acceptance';
      break;
    case isProductionServer:
      otapServerEnvFrontend = 'production';
      break;
  }

  if (isAcceptanceServer) {
    otapServerEnvFrontend = 'acceptance';
  }
  if (isProductionServer) {
    otapServerEnvFrontend = 'production';
  }

  return otapServerEnvFrontend;
}

function isBrowser() {
  try {
    // eslint-disable-next-line
    eval('window.location');
    return true;
  } catch (error) {
    return false;
  }
}

export const ENV = `${
  isBrowser() ? getBrowserEnv() : process.env.BFF_ENV || 'development'
}` as keyof OtapEnv;

console.info(`App running in ${ENV} mode.`);

export const IS_ACCEPTANCE = ENV === 'acceptance';
export const IS_PRODUCTION = ENV === 'production';
export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;

interface OtapEnv {
  development: Record<string, any>;
  test: Record<string, any>;
  acceptance: Record<string, any>;
  production: Record<string, any>;
}

const otapServerEnv: OtapEnv = {
  development: {},
  test: {},
  acceptance: {
    analyticsId: 25,
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
    bffSentryDsn: '',
    ssoErfpachturl:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoMilieuzoneUrl: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvragen',
  },
  production: {
    analyticsId: 28,
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
    bffSentryDsn: '',
    ssoErfpachturl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoMilieuzoneUrl: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',
  },
};

export const getOtapEnvItem = (key: string) =>
  otapServerEnv[ENV] && otapServerEnv[ENV][key];
