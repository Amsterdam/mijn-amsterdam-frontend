function getBrowserEnv() {
  let otapServerEnvFrontend = 'development';

  // @ts-ignore
  const isAcceptanceServer = window.location.host === 'mijn.acc.amsterdam.nl';

  // @ts-ignore
  const isProductionServer = window.location.host === 'amsterdam.nl';

  // @ts-ignore
  const isTestServer = window.location.host === 'mijn.ot.amsterdam.nl';

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
  // @ts-ignore
  return typeof window !== 'undefined' && window.document;
}

export const ENV = `${
  isBrowser() ? getBrowserEnv() : process.env.BFF_ENV || 'development'
}` as OtapEnvName;

process.env.NODE_ENV !== 'test' && console.info(`App running in ${ENV} mode.`);

export const IS_ACCEPTANCE = ENV === 'acceptance';
export const IS_PRODUCTION = ENV === 'production';
export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;

interface EnvVars {
  analyticsId?: number;
  analyticsUrlBase?: string;
  sentryDsn?: string;
  bffSentryDsn?: string;
  ssoErfpachtUrl?: string;
  ssoMilieuzoneUrl?: string;
  isMyAreaMapEnabled?: boolean;
}

type OtapEnvName = 'development' | 'test' | 'acceptance' | 'production';

type OtapEnv = { [name in OtapEnvName]: EnvVars };

const otapServerEnv: OtapEnv = {
  development: {
    isMyAreaMapEnabled: false,
  },
  test: {
    isMyAreaMapEnabled: false,
  },
  acceptance: {
    analyticsId: 25,
    analyticsUrlBase: 'https://analytics.data.amsterdam.nl/',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoErfpachtUrl:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoMilieuzoneUrl: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvragen',
    isMyAreaMapEnabled: true,
  },
  production: {
    analyticsId: 28,
    analyticsUrlBase: 'https://analytics.data.amsterdam.nl/',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoErfpachtUrl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoMilieuzoneUrl: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',
    isMyAreaMapEnabled: true,
  },
};

export function getOtapEnvItem<K extends keyof EnvVars>(key: K) {
  return otapServerEnv[ENV] && otapServerEnv[ENV][key];
}
