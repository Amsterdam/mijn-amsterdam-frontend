export const Chapters = {
  ROOT: 'ROOT',
  BURGERZAKEN: 'BURGERZAKEN',
  WONEN: 'WONEN',
  BELASTINGEN: 'BELASTINGEN',
  GEZONDHEID: 'GEZONDHEID',
  INKOMEN: 'INKOMEN',
  PROFIEL: 'PROFIEL',

  // TODO: Clarify what this is about
  TIPS: 'tips',
  MIJN_UPDATES: 'mijn-updates',
};

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  GEZONDHEID: '/gezondheid',
  INKOMEN: '/inkomen',
  PROFIEL: '/profiel',
  MIJN_BUURT: '/buurt',
  ABOUT: '/over-mijn-amstedam',
  PRIVACY: '/privacy',

  // NOTE: Route components not implemented, subject to change
  TIPS: '/tips',
  MIJN_UPDATES: '/updates',
};

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const ApiUrls = {
  MIJN_UPDATES: `${API_BASE_URL}/profiel/mijn-updates`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
};

// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'DD MMM YYYY';

export const ExternalUrls = {
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
  ERFPACHT:
    'https://mijnerfpacht.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
  ERFPACHT_ACC:
    'https://mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger',
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
