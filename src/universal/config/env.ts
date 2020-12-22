function getBrowserEnv() {
  return process.env.REACT_APP_ENV || 'production';
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
  ssoErfpachtUrlEH?: string;
  ssoMilieuzoneUrl?: string;
  isMyAreaMapEnabled?: boolean;
  krefiaDirectLink?: string;
}

type OtapEnvName = 'development' | 'test' | 'acceptance' | 'production';

type OtapEnv = { [name in OtapEnvName]: EnvVars };

const otapServerEnv: OtapEnv = {
  development: {
    isMyAreaMapEnabled: false,
    krefiaDirectLink: 'https://krefia.amsterdam.nl',
    ssoErfpachtUrl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    bffSentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
  },
  test: {
    isMyAreaMapEnabled: false,
    krefiaDirectLink: 'https://krefia.amsterdam.nl',
  },
  acceptance: {
    analyticsId: 25,
    analyticsUrlBase: 'https://analytics.data.amsterdam.nl/',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoErfpachtUrl:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    ssoMilieuzoneUrl: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvragen',
    isMyAreaMapEnabled: true,
    krefiaDirectLink: 'https://krefia-acceptatie.amsterdam.nl',
  },
  production: {
    analyticsId: 28,
    analyticsUrlBase: 'https://analytics.data.amsterdam.nl/',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry.data.amsterdam.nl/13',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoErfpachtUrl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    ssoMilieuzoneUrl: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',
    isMyAreaMapEnabled: true,
    krefiaDirectLink: 'https://krefia.amsterdam.nl',
  },
};

export function getOtapEnvItem<K extends keyof EnvVars>(key: K) {
  return otapServerEnv[ENV] && otapServerEnv[ENV][key];
}
