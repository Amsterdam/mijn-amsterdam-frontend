import { isDateInPast } from '../helpers/date';
import { IS_AP, IS_OT, IS_PRODUCTION } from './env';

export const FeatureToggle = {
  afisActive: !IS_AP,
  avgActive: true,
  bbDocumentDownloadsActive: false,
  bekendmakingenDatasetActive: false,
  belastingApiActive: true,
  bezwarenActive: true,
  bodemActive: true,
  cleopatraApiActive: true,
  cmsFooterActive: true,
  dbDisabled: false,
  decosServiceActive: IS_OT,
  ehKetenmachtigingActive: !IS_PRODUCTION,
  eherkenningActive: true,
  erfpachtV2Active: !IS_PRODUCTION,
  erfpachtV2EndpointActive: !IS_PRODUCTION,
  evenementenDatasetActive: false,
  garbageInformationPage: true,
  hliThemaActive: !IS_PRODUCTION,
  horecaActive: true,
  identiteitsbewijzenActive: true,
  inkomenBBZActive: true,
  isSearchEnabled: true,
  klachtenActive: true,
  krefiaActive: true,
  kvkActive: true,
  laadpalenActive: !IS_PRODUCTION,
  meldingenBuurtActive: true,
  oidcLogoutHintActive: true,
  overtredingenActive: !IS_PRODUCTION,
  parkerenActive: true,
  passQueryParamsToStreamUrl: !IS_AP,
  powerbrowserActive: !IS_PRODUCTION,
  profileToggleActive: true,
  residentCountActive: true,
  sportDatasetsActive: true,
  stadspasRequestsActive: false,
  subsidieActive: true,
  svwiLinkActive: IS_DEVELOPMENT,
  tipsFlipActive: true,
  toeristischeVerhuurActive: true,
  vergunningenActive: true,
  vergunningenV2Active: IS_OT,
  wiorDatasetActive: true,
  wiorMeldingen: true,
  zorgnedDocumentAttachmentsActive: true,
};

// For testing and development purposes we can pass a set of arbitrary parameters to the BFF.
// For example, tipsCompareDate=2023-01-31 this will change the date that is used to compare with dates being used in the tips controller.
export const streamEndpointQueryParamKeys = {
  tipsCompareDate: 'tipsCompareDate',
};

export const DEFAULT_PROFILE_TYPE = 'private';

export const ExternalUrls = {
  CHANGE_PERSONAL_DATA:
    'https://www.amsterdam.nl/veelgevraagd/persoonlijke-gegevens-inzien-of-een-correctie-doorgeven-2bf85',
  CHANGE_RESIDENT_COUNT:
    'https://www.amsterdam.nl/veelgevraagd/onjuiste-inschrijving-melden-ef918',
  CHANGE_KVK_DATA:
    'https://www.kvk.nl/inschrijven-en-wijzigen/wijziging-doorgeven/',
  REPORT_RELOCATION:
    'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/',
  CONTACT_FORM:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx',
  SSO_ERFPACHT: `https://mijnerfpacht${
    !IS_PRODUCTION ? '.acc' : ''
  }.amsterdam.nl/saml/login/alias/mijnErfpachtBurger`,
  ERFPACHTv2_ZAKELIJK: `https://erfpachtzakelijk${
    !IS_PRODUCTION ? '-ont' : ''
  }.amsterdam.nl`,
  EH_SSO_ERFPACHT: `https://mijnerfpacht${
    !IS_PRODUCTION ? '.acc' : ''
  }.amsterdam.nl/saml/login/alias/mijnErfpachtZakelijk`,
  BERICHTENBOX_BURGERS: 'https://mijn.overheid.nl/berichtenbox/inbox/',
  BERICHTENBOX_ONDERNEMERS:
    'https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/berichtenbox-voor-bedrijven/',
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
    'https://www.amsterdam.nl/veelgevraagd/mijn-amsterdam-b5077',
  AMSTERDAM: 'https://www.amsterdam.nl',
  WPI_CONTACT: 'https://www.amsterdam.nl/werk-inkomen/contact/',
  WPI_BIJSTANDSUITKERING:
    'https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/',
  WPI_ALGEMEEN: 'https://www.amsterdam.nl/werk-inkomen',
  WPI_TOZO: 'https://www.amsterdam.nl/ondernemen/ondersteuning/tozo/',
  WPI_TONK: 'https://www.amsterdam.nl/tonk/',
  WPI_BBZ: 'https://www.amsterdam.nl/bbz/',
  AFVAL: 'https://www.amsterdam.nl/afval/',
  AFVAL_COMMERCIAL: 'https://www.amsterdam.nl/afval-hergebruik/bedrijfsafval/',

  AFVAL_AFSPRAAK_MAKEN:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Grofafval.aspx',
  AMSTERDAM_COMPLAINTS_FROM:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx',
  AMSTERDAM_PRIVACY_PAGE: 'https://www.amsterdam.nl/privacy',
  AFVAL_MELDING_FORMULIER:
    'https://formulier.amsterdam.nl/mail/afval/afvalwijzer/',
  AFVAL_MELDING:
    'https://www.amsterdam.nl/veelgevraagd/melding-openbare-ruimte-en-overlast-cd609',
  KREFIA: `https://krefia${!IS_PRODUCTION ? '-acceptatie' : ''}.amsterdam.nl`,
  STADSBANK_VAN_LENING: 'https://www.amsterdam.nl/sbl/',
  STADSPAS: 'https://www.amsterdam.nl/stadspas',

  DIGID_AANVRAGEN:
    'https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen',
  SVWI: `https://mijn.werkeninkomen${
    !IS_PRODUCTION ? '-acc' : ''
  }.amsterdam.nl/`,
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
