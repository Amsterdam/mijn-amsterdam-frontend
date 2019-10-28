import { StateKey } from 'AppState';
import { ErrorMessageMap } from 'components/ErrorMessages/ErrorMessages';
import { isProduction } from 'helpers/App';
import { MyNotification } from 'hooks/api/my-notifications-api.hook';

export type Chapter =
  | 'ROOT'
  | 'BURGERZAKEN'
  | 'WONEN'
  | 'BELASTINGEN'
  | 'ZORG'
  | 'JEUGDHULP'
  | 'INKOMEN'
  | 'MELDINGEN'
  | 'MIJN_BUURT'
  | 'PROFILE'
  | 'MIJN_TIPS';

export const Chapters: { [chapter in Chapter]: Chapter } = {
  ROOT: 'ROOT',
  MIJN_BUURT: 'MIJN_BUURT',
  BURGERZAKEN: 'BURGERZAKEN',
  WONEN: 'WONEN',
  BELASTINGEN: 'BELASTINGEN',
  ZORG: 'ZORG',
  JEUGDHULP: 'JEUGDHULP',
  INKOMEN: 'INKOMEN',
  PROFILE: 'PROFILE',
  MELDINGEN: 'MELDINGEN',
  MIJN_TIPS: 'MIJN_TIPS',
};

export const ChapterTitles: { [chapter in Chapter]: string } = {
  INKOMEN: 'Werk en inkomen',
  BURGERZAKEN: 'Burgerzaken',
  BELASTINGEN: 'Belastingen',
  JEUGDHULP: 'Jeugdhulp',
  WONEN: 'Erfpacht',
  ZORG: 'Zorg en ondersteuning',
  ROOT: 'Home',
  MELDINGEN: 'Actueel',
  PROFILE: 'Mijn gegevens',
  MIJN_BUURT: 'Mijn buurt',
  MIJN_TIPS: 'Mijn tips',
};

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  ZORG: '/zorg-en-ondersteuning',
  ZORG_VOORZIENINGEN: '/zorg-en-ondersteuning/voorzieningen',
  JEUGDHULP: '/jeugdhulp',
  INKOMEN: '/werk-en-inkomen',
  STADSPAS: '/werk-en-inkomen/stadspas',
  BIJSTANDSUITKERING: '/werk-en-inkomen/bijstandsuitkering',
  BIJZONDERE_BIJSTAND: '/werk-en-inkomen/bijzondere-bijstand',
  PROFILE: '/persoonlijke-gegevens',
  MY_AREA: '/buurt',
  ABOUT: '/over-mijn-amsterdam',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: '/api/login',
  MY_TIPS: '/overzicht-tips',
  MY_NOTIFICATIONS: '/overzicht-meldingen',
};

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ATLAS_API_BASE_URL = process.env.REACT_APP_ATLAS_API_BASE_URL;

export type ApiName = StateKey | 'BAG' | 'AUTH';

export const ApiUrls: TypeIndex<ApiName, string> = {
  MY_NOTIFICATIONS: `${API_BASE_URL}/mijn-meldingen`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  MY_TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${ATLAS_API_BASE_URL}/atlas/search/adres/`,
};

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: TypeIndex<ApiName, ApiConfig> = {
  FOCUS: {
    postponeFetch: isProduction(),
  },
  WMO: {
    postponeFetch: isProduction(),
  },
  MY_TIPS: {
    postponeFetch: true,
  },
};

export const FeatureToggle = {
  myTipsoptInOutPersonalization: false,
};

export const errorMessageMap: ErrorMessageMap = {
  BRP: {
    name: 'Persoonsgegevens',
    error: 'Communicatie met api mislukt.',
  },
  MY_NOTIFICATIONS: {
    name: 'Actueel',
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
    name: 'Zorg en ondersteuning',
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

// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';

export const ExternalUrls = {
  CHANGE_PERSONAL_DATA:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B989C04B3-AD81-4ABA-8DFE-465A29E2BF85%7D',
  REPORT_RELOCATION:
    'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/',
  CONTACT_FORM:
    'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/Klachtenformulier.aspx',
  SSO_ERFPACHT: process.env.REACT_APP_ERFPACHT_URL,
  BERICHTENBOX: 'https://mijn.overheid.nl/berichtenbox/inbox/',
  CONTACT_GENERAL: 'https://www.amsterdam.nl/contact/',
  AMSTERDAM_NEWSLETTER:
    'https://www.amsterdam.nl/nieuwsbrieven/actueel/nieuwsbrief/nieuwsbrief/',
  AMSTERDAM_TWITTER: 'https://twitter.com/AmsterdamNL',
  AMSTERDAM_FACEBOOK: 'https://www.facebook.com/gemeenteamsterdam',
  AMSTERDAM_INSTAGRAM: 'https://www.instagram.com/gemeenteamsterdam/',
  AMSTERDAM_LINKEDIN: 'https://www.linkedin.com/company/gemeente-amsterdam',
  AMSTERDAM_VACATURES:
    'https://www.amsterdam.nl/bestuur-organisatie/werkenbij/',
  ZORG_LEES_MEER: 'https://www.amsterdam.nl/zorg-ondersteuning/',
  SSO_BELASTINGEN: 'https://belastingbalie.amsterdam.nl/digid.saml.php?start',
  MIJN_SUBSIDIES: 'https://mijnsubsidies.amsterdam.nl/loket/',
  MIJN_AMSTERDAM_VEELGEVRAAGD:
    'https://www.amsterdam.nl/veelgevraagd/?productid={68422ECA-8C56-43EC-A9AA-B3DF190B5077}',
  AMSTERDAM: 'https://www.amsterdam.nl',
  WPI_CONTACT: 'https://www.amsterdam.nl/werk-inkomen/contact/',
  WPI_REGELINGEN: 'https://www.amsterdam.nl/werk-inkomen/uitkeringen/',
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

// NOTE: Keep up-to-date with _breakpoints.scss
export const Breakpoints = {
  tablet: 1024, // px
  phone: 640, // px
};

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  chapter: Chapters.MELDINGEN,
  datePublished: new Date(2019, 9, 1).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  description:
    'Deze website is nog volop in ontwikkeling. Gaandeweg komt meer informatie voor u beschikbaar.',
  customLink: {
    callback: () => {
      const usabilla = (window as any).usabilla_live;
      if (usabilla) {
        usabilla('click');
      } else {
        window.location.href = ExternalUrls.CONTACT_FORM;
      }
    },
    title: 'Laat ons weten wat u ervan vindt',
  },
};
