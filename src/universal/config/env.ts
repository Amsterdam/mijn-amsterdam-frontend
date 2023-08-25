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

type AppModeName = 'development' | 'test' | 'production';
type AppMode = { [name in OtapEnvName]: EnvVars };

function getAppMode(): AppModeName {
  // @ts-ignore
  const browserAppMode =
    typeof window !== 'undefined' ? (window as any).MA_APP_MODE : undefined;
  return browserAppMode || process.env.MODE || 'production';
}

function getOtapEnv(): OtapEnvName {
  // @ts-ignore
  const browserOtapEnv =
    typeof window !== 'undefined' ? (window as any).MA_OTAP_ENV : undefined;
  const nodeOtapEnv = process.env.MA_OTAP_ENV;
  return browserOtapEnv || nodeOtapEnv || 'development';
}

export const ENV = getOtapEnv();

getAppMode() !== 'test' && console.info(`App running in ${getAppMode()} mode.`);

export const IS_ACCEPTANCE = ENV === 'acceptance';
export const IS_PRODUCTION = ENV === 'production';
export const IS_AP = IS_ACCEPTANCE || IS_PRODUCTION;

const otapServerEnv: OtapEnv = {
  development: {
    krefiaDirectLink: 'https://krefia.amsterdam.nl',
    ssoErfpachtUrl:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    ssoMilieuzoneUrl: 'https://ontheffingen.amsterdam.nl/publiek/aanvragen',
    ssoSubsidiesUrl: 'https://acc.mijnsubsidies.amsterdam.nl/dashboard',
    bagUrl: 'https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=', // features=2 is een Feature flag zodat ook Weesp resultaten worden weergegeven.
    ssoSvwi: 'https://mijnwpi-test.mendixcloud.com/p/overzicht',
  },
  // NOTE: test OTAP_ENV wordt nu misbruikt voor unittesting. TODO: Refactor met onderscheid voor MODE en OTAP_ENV
  test: {
    krefiaDirectLink: 'https://krefia',
    ssoErfpachtUrl: 'https://mijnerfpacht',
    ssoErfpachtUrlEH: 'https://mijnerfpacht',
    ssoMilieuzoneUrl: 'https://ontheffingen',
    ssoSubsidiesUrl: 'https://mijnsubsidies',
    bagUrl: 'http://remote-api-host:80/?q=',
    ssoSvwi: 'https://mijnwpi-test',
  },
  acceptance: {
    analyticsId: 'e63312c0-0efe-4c4f-bba1-3ca1f05374a8',
    analyticsUrlBase: 'https://dap.amsterdam.nl',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry-new.data.amsterdam.nl/13',
    ssoErfpachtUrl:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
    ssoErfpachtUrlEH:
      'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk',
    ssoMilieuzoneUrl: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvragen',
    krefiaDirectLink: 'https://krefia-acceptatie.amsterdam.nl',
    ssoSubsidiesUrl: 'https://acc.mijnsubsidies.amsterdam.nl/dashboard',
    bagUrl: 'https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=',
    ssoSvwi: 'https://mijnwpi-test.mendixcloud.com/p/overzicht',
  },
  production: {
    analyticsId: 'f558164e-e388-49e0-864e-5f172552789c',
    analyticsUrlBase: 'https://dap.amsterdam.nl',
    sentryDsn:
      'https://d9bff634090c4624bce9ba7d8f0875dd@sentry-new.data.amsterdam.nl/13',
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
  return otapServerEnv[ENV] && otapServerEnv[ENV][key];
}
