import { isDateInPast } from '../helpers/date';
import { IS_AP, IS_PRODUCTION } from './env';

export const FeatureToggle = {
  garbageInformationPage: true,
  belastingApiActive: true,
  cleopatraApiActive: true,
  overtredingenActive: !IS_PRODUCTION,
  identiteitsbewijzenActive: true,
  eherkenningActive: true,
  vergunningenActive: true,
  cmsFooterActive: true,
  tipsFlipActive: true,
  profileToggleActive: true,
  kvkActive: true,
  residentCountActive: true,
  sportDatasetsActive: true,
  wiorDatasetActive: true,
  siaActive: true,
  siaApiActive: true,
  yiviActive: !IS_PRODUCTION,
  yiviLandingActive:
    !isDateInPast(new Date('2023-12-31 23:59:00')) || !IS_PRODUCTION,
  toeristischeVerhuurActive: true,
  krefiaActive: true,
  isSearchEnabled: true,
  meldingenBuurtActive: true,
  inkomenBBZActive: true,
  erfpachtV2Active: !IS_PRODUCTION,
  erfpachtV2EndpointActive: !IS_PRODUCTION,
  subsidieActive: true,
  wiorMeldingen: true,
  parkerenActive: true,
  bekendmakingenDatasetActive: true,
  evenementenDatasetActive: false,
  klachtenActive: true,
  bezwarenActive: !IS_PRODUCTION,
  horecaActive: !IS_PRODUCTION,
  avgActive: true,
  svwiLinkActive: !IS_PRODUCTION,
  ehKetenmachtigingActive: !IS_PRODUCTION,
  bodemActive: true,
  stadspasRequestsActive: false,
  dbDisabled: false,
  passQueryParamsToStreamUrl: !IS_AP,
};

// For testing and development purposes we can pass a set of arbitrary parameters to the BFF.
// For example, tipsCompareDate=2023-01-31 this will change the date that is used to compare with dates being used in the tips controller.
export const streamEndpointQueryParamKeys = {
  tipsCompareDate: 'tipsCompareDate',
};

export const DEFAULT_PROFILE_TYPE = 'private';

export const ExternalUrls = {
  CHANGE_PERSONAL_DATA:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B989C04B3-AD81-4ABA-8DFE-465A29E2BF85%7D',
  CHANGE_RESIDENT_COUNT:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7BE4C7C5B6-242B-46AF-8EF1-8D65D8EEF918%7D',
  CHANGE_KVK_DATA:
    'https://www.kvk.nl/inschrijven-en-wijzigen/wijziging-doorgeven/',
  REPORT_RELOCATION:
    'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/',
  CONTACT_FORM:
    'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/Klachtenformulier.aspx',
  SSO_ERFPACHT: `https://mijnerfpacht${
    !IS_PRODUCTION ? '.acc' : ''
  }.amsterdam.nl/saml/login/alias/mijnErfpachtBurger`,
  ERFPACHTv2_ZAKELIJK: `https://erfpacht${
    !IS_PRODUCTION ? '.acc' : ''
  }.amsterdam.nl`,
  EH_SSO_ERFPACHT: `https://mijnerfpacht${
    !IS_PRODUCTION ? '.acc' : ''
  }.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk`,
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
  AMSTERDAM_TAXI: 'https://www.amsterdam.nl/parkeren-verkeer/taxi/',
  AMSTERDAM_VAREN: 'https://www.amsterdam.nl/parkeren-verkeer/varen-amsterdam/',
  ZORG_LEES_MEER: 'https://www.amsterdam.nl/zorg-ondersteuning/',
  SSO_BELASTINGEN: 'https://belastingbalie.amsterdam.nl/digid.saml.php?start',
  EH_SSO_BELASTINGEN:
    'https://belastingbalie.amsterdam.nl/eherkenning.saml.php?start',
  SSO_MILIEUZONE: `https://ontheffingen${
    !IS_PRODUCTION ? '-acc' : ''
  }.amsterdam.nl/publiek/aanvragen`,
  SSO_SUBSIDIE: `https://${
    !IS_PRODUCTION ? 'acc.' : ''
  }mijnsubsidies.amsterdam.nl/dashboard`,
  MIJN_SUBSIDIES: 'https://mijnsubsidies.amsterdam.nl/loket/',
  MIJN_AMSTERDAM_VEELGEVRAAGD:
    'https://www.amsterdam.nl/veelgevraagd/?productid={68422ECA-8C56-43EC-A9AA-B3DF190B5077}',
  AMSTERDAM: 'https://www.amsterdam.nl',
  WPI_CONTACT: 'https://www.amsterdam.nl/werk-inkomen/contact/',
  WPI_BIJSTANDSUITKERING:
    'https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/',
  WPI_ALGEMEEN: 'https://www.amsterdam.nl/werk-inkomen',
  WPI_TOZO: 'https://www.amsterdam.nl/ondernemen/ondersteuning/tozo/',
  WPI_TONK: 'https://www.amsterdam.nl/tonk/',
  WPI_BBZ: 'https://www.amsterdam.nl/bbz/',
  SSO_SVWI: !IS_PRODUCTION
    ? 'https://mijnwpi-test.mendixcloud.com/p/overzicht'
    : '',
  AFVAL: 'https://www.amsterdam.nl/afval/',
  AFVAL_COMMERCIAL:
    'https://www.amsterdam.nl/veelgevraagd/?productid={3D70B70E-8A19-4A95-BE31-8743995BC545}',

  AFVAL_AFSPRAAK_MAKEN:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Grofafval.aspx',
  AMSTERDAM_COMPLAINTS_FROM:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scKlachtenformulier.aspx/fKlachtenformulier',
  AMSTERDAM_PRIVACY_PAGE: 'https://www.amsterdam.nl/privacy',
  AFVAL_MELDING_FORMULIER:
    'https://formulier.amsterdam.nl/mail/afval/afvalwijzer/',
  AFVAL_MELDING:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7BD5F9EF09-0F3A-4E59-8435-4873EB7CD609%7D#case_%7B33F0B504-EDEB-42EE-A8C5-7EF394F65D3A%7D',
  KREFIA: `https://krefia${!IS_PRODUCTION ? '-acceptatie' : ''}.amsterdam.nl`,
  STADSBANK_VAN_LENING: 'https://www.amsterdam.nl/sbl/',
  STADSPAS: 'https://www.amsterdam.nl/stadspas',

  DIGID_AANVRAGEN:
    'https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen',
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
