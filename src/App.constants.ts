import { StateKey } from 'AppState';
import { ErrorMessageMap } from 'components/ErrorMessages/ErrorMessages';
import { isProduction } from 'helpers/App';

export type Chapter =
  | 'ROOT'
  | 'BURGERZAKEN'
  | 'WONEN'
  | 'BELASTINGEN'
  | 'ZORG'
  | 'JEUGDHULP'
  | 'INKOMEN'
  | 'PROFILE';

export const Chapters: { [chapter in Chapter]: Chapter } = {
  ROOT: 'ROOT',
  BURGERZAKEN: 'BURGERZAKEN',
  WONEN: 'WONEN',
  BELASTINGEN: 'BELASTINGEN',
  ZORG: 'ZORG',
  JEUGDHULP: 'JEUGDHULP',
  INKOMEN: 'INKOMEN',
  PROFILE: 'PROFILE',
};

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  ZORG: '/zorg',
  ZORG_VOORZIENINGEN: '/zorg/voorzieningen',
  JEUGDHULP: '/jeugdhulp',
  INKOMEN: '/werk-en-inkomen',
  STADSPAS: '/werk-en-inkomen/stadspas',
  BIJSTANDSUITKERING: '/werk-en-inkomen/bijstandsuitkering',
  BIJZONDERE_BIJSTAND: '/werk-en-inkomen/bijzondere-bijstand',
  PROFILE: '/profiel',
  MY_AREA: '/buurt',
  ABOUT: '/over-mijn-amsterdam',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: '/api/login',
  MY_TIPS: '/tips',
  MY_UPDATES: '/meldingen',
};

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ATLAS_API_BASE_URL = process.env.REACT_APP_ATLAS_API_BASE_URL;

export const ApiUrls = {
  MY_UPDATES: `${API_BASE_URL}/mijn-updates`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  MY_TIPS: `${API_BASE_URL}/profiel/mijn-tips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${ATLAS_API_BASE_URL}/atlas/search/adres/`,
};

export interface ApiConfig {
  [apiUrl: string]: {
    postponeFetch: boolean;
  };
}

export const ApiConfig: ApiConfig = {
  [ApiUrls.FOCUS]: {
    postponeFetch: isProduction(),
  },
  [ApiUrls.WMO]: {
    postponeFetch: isProduction(),
  },
  [ApiUrls.MY_TIPS]: {
    postponeFetch: isProduction(),
  },
};

export const errorMessageMap: ErrorMessageMap = {
  BRP: {
    name: 'Persoonsgegevens',
    error: 'Communicatie met api mislukt.',
  },
  MY_UPDATES: {
    name: 'Mijn meldingen',
    error: 'Communicatie met api mislukt.',
  },
  MY_CASES: {
    name: 'Mijn lopende aanvragen',
    error: 'Communicatie met api mislukt.',
  },
  MY_TIPS: {
    name: 'Mijn tips',
    error: 'Communicatie met api mislukt.',
  },
  WMO: {
    name: 'Zorg',
    error: 'Communicatie met api mislukt.',
  },
  FOCUS: {
    name: 'Stadspas of Bijstandsuitkering',
    error: 'Communicatie met api mislukt.',
  },
  ERFPACHT: {
    name: 'Erfpacht',
    error: 'Communicatie met api mislukt.',
  },
};

export const excludedApiKeys: StateKey[] = ['MY_CHAPTERS', 'SESSION'];

// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'DD MMMM YYYY';

export const ExternalUrls = {
  ABOUT_INCOME_SUPPORT: 'https://www.amsterdam.nl/werk-inkomen/',
  BIJSTAND_WHAT_TO_EXPECT:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D',
  BIJSTAND_RIGHTS:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d',
  BIJSTAND_OBLIGATIONS:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d',
  BIJSTAND_PAYMENT_DATE:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D',
  STADSPAS: 'https://www.amsterdam.nl/stadspas',
  CHANGE_PERSONAL_DATA:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B989C04B3-AD81-4ABA-8DFE-465A29E2BF85%7D',
  REPORT_RELOCATION:
    'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/',
  CONTACT_FORM:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scKlachtenformulier.aspx',
  COLOFON: 'https://www.amsterdam.nl/algemene_onderdelen/overige/colofon/',
  PROCLAIMER:
    'https://www.amsterdam.nl/algemene_onderdelen/overige/proclaimer/',
  AMSTERDAM_WASTE: 'https://www.amsterdam.nl/afval',
  DIGID: 'https://digid.nl',
  EHERKENNING:
    'https://www.eherkenning.nl/inloggen-met-eherkenning/middel-aanvragen/',
  KVK_REPORT_CHANGE:
    'https://www.kvk.nl/inschrijven-en-wijzigen/wijziging-doorgeven/',
  SSO_ERFPACHT: process.env.REACT_APP_ERFPACHT_URL,
  BERICHTENBOX: 'https://mijn.overheid.nl/berichtenbox/inbox/',
  TROUWEN_EN_PARTNERSCHAP:
    'https://www.amsterdam.nl/burgerzaken/trouwen-partnerschap/',
  ECHTSCHEIDING:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B531BC4F8-F16D-4196-BFA0-D83C40A4D21F%7D',
  CONTACT_GENERAL: 'https://www.amsterdam.nl/contact/',
  AMSTERDAM_NEWSLETTER:
    'https://www.amsterdam.nl/nieuwsbrieven/actueel/nieuwsbrief/nieuwsbrief/',
  AMSTERDAM_TWITTER: 'https://twitter.com/AmsterdamNL',
  AMSTERDAM_FACEBOOK: 'https://www.facebook.com/gemeenteamsterdam',
  AMSTERDAM_INSTAGRAM: 'https://www.instagram.com/gemeenteamsterdam/',
  AMSTERDAM_LINKEDIN: 'https://www.linkedin.com/company/gemeente-amsterdam',
  AMSTERDAM_VACATURES:
    'https://www.amsterdam.nl/bestuur-organisatie/werkenbij/',
  VOORGENOMEN_HUWELIJK:
    'https://www.amsterdam.nl/burgerzaken/trouwen-partnerschap/trouwen-amsterdam/aankondigen/',
  INCOME_CONTACT: 'https://www.amsterdam.nl/werk-inkomen/contact/',
  ZORG_LEES_MEER: 'https://www.amsterdam.nl/zorg-ondersteuning/',
  SSO_BELASTINGEN: 'https://belastingbalie.amsterdam.nl/digid.info.php',
  MIJN_WERK_EN_INKOMEN: 'https://edison.amsterdam.nl/SignIn?ReturnUrl=%2F',
  MIJN_SUBSIDIES: 'https://mijnsubsidies.amsterdam.nl/loket/',
};

// NOTE: Keep up-to-date with _colors.scss
export const Colors = {
  white: 'white',
  black: 'black',
  primaryRed: '#EC0000',
  primaryDarkblue: '#004699',
  neutralGrey1: '#F5F5F5',
  neutralGrey2: '#E6E6E6',
  neutralGrey3: '#B4B4B4',
  neutralGrey4: '#767676',
  neutralGrey5: '#323232',
  supportValid: '#00A03C',
  supportInvalid: '#EC0000',
  supportFocus: '#FEC813',
  supportPurple: '#A00078',
  supportPink: '#E50082',
  supportOrange: '#FF9100',
  supportYellow: '#FFE600',
  supportLightgreen: '#BED200',
  supportDarkgreen: '#00A03C',
  supportLightblue: '#009DEC',
  overlayBlack50: 'rgba(0, 0, 0, 0.5)',
};

// NOTE: Keep up-to-date with _layout.scss
export const Layout = {
  mainHeaderTopbarHeight: 106, // px
  mainHeaderNavbarHeight: 44, // px
};
