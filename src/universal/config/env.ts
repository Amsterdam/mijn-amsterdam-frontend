interface EnvVars {
  analyticsId?: number | string;
  analyticsUrlBase?: string;
  sentryDsn?: string;
  bffSentryDsn?: string;
  ssoErfpachtUrl?: string;
  ssoErfpachtUrlEH?: string;
  ssoMilieuzoneUrl?: string;
  krefiaDirectLink?: string;
  ssoSubsidiesUrl?: string;
  bagUrl?: string;
  ssoSvwi?: string;
}

type OtapEnvName = 'development' | 'test' | 'acceptance' | 'production';
type OtapEnv = { [name in OtapEnvName]: EnvVars };

const DEFAULT_OTAP_ENV = 'development';

export const OTAP_ENV = `${
  (process.env.REACT_APP_OTAP_ENV || process.env.MA_OTAP_ENV) ??
  DEFAULT_OTAP_ENV
}` as OtapEnvName;

process.env.NODE_ENV !== 'test' &&
  console.info(`App running in ${OTAP_ENV} mode.`);

export const IS_DEVELOPMENT = OTAP_ENV === 'development';
export const IS_TEST = OTAP_ENV === 'test';
export const IS_ACCEPTANCE = OTAP_ENV === 'acceptance';
export const IS_PRODUCTION = OTAP_ENV === 'production';
export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;
export const IS_OT = IS_DEVELOPMENT || IS_TEST;
export const IS_TAP = IS_TEST || IS_ACCEPTANCE || IS_PRODUCTION;

const otapServerEnv: OtapEnv = {
  development: {
    krefiaDirectLink: 'https://krefia.amsterdam.nl',
    ssoErfpachtUrl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoMilieuzoneUrl: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',
    ssoSubsidiesUrl: 'https://acc.mijnsubsidies.amsterdam.nl/dashboard',
    bagUrl: 'https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=', // features=2 is een Feature flag zodat ook Weesp resultaten worden weergegeven.
  },
  test: {
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
  },
  acceptance: {
    analyticsId: 'e63312c0-0efe-4c4f-bba1-3ca1f05374a8',
    analyticsUrlBase: 'https://dap.amsterdam.nl/',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry-new.data.amsterdam.nl/13',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoErfpachtUrl:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    ssoMilieuzoneUrl: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvragen',
    krefiaDirectLink: 'https://krefia-acceptatie.amsterdam.nl',
    ssoSubsidiesUrl: 'https://acc.mijnsubsidies.amsterdam.nl/dashboard',
    bagUrl: 'https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=',
    ssoSvwi: 'https://mijnwpi-test.mendixcloud.com/p/overzicht  ',
  },
  production: {
    analyticsId: 'f558164e-e388-49e0-864e-5f172552789c',
    analyticsUrlBase: 'https://dap.amsterdam.nl/',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry-new.data.amsterdam.nl/13',
    bffSentryDsn: process.env.BFF_SENTRY_DSN || '',
    ssoErfpachtUrl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    ssoMilieuzoneUrl: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',
    krefiaDirectLink: 'https://krefia.amsterdam.nl',
    ssoSubsidiesUrl: 'https://mijnsubsidies.amsterdam.nl/dashboard',
    bagUrl: 'https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=',
    ssoSvwi: '',
  },
};

export function getOtapEnvItem<K extends keyof EnvVars>(key: K) {
  return otapServerEnv[OTAP_ENV] && otapServerEnv[OTAP_ENV][key];
}
