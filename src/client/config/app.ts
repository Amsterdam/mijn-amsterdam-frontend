import { getOtapEnvItem } from '../../universal/config';

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
  SSO_ERFPACHT: getOtapEnvItem('ssoErfpachtUrl'),
  EH_SSO_ERFPACHT: getOtapEnvItem('ssoErfpachtUrlEH'),
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
  EH_SSO_BELASTINGEN:
    'https://belastingbalie.amsterdam.nl/eherkenning.saml.php?start',
  SSO_MILIEUZONE: getOtapEnvItem('ssoMilieuzoneUrl'),
  MIJN_SUBSIDIES: 'https://mijnsubsidies.amsterdam.nl/loket/',
  MIJN_AMSTERDAM_VEELGEVRAAGD:
    'https://www.amsterdam.nl/veelgevraagd/?productid={68422ECA-8C56-43EC-A9AA-B3DF190B5077}',
  AMSTERDAM: 'https://www.amsterdam.nl',
  WPI_CONTACT: 'https://www.amsterdam.nl/werk-inkomen/contact/',
  WPI_ALGEMEEN: 'https://www.amsterdam.nl/werk-inkomen',
  WPI_TOZO: 'https://www.amsterdam.nl/ondernemen/ondersteuning/tozo/',
  WPI_TONK: 'https://www.amsterdam.nl/tonk/',
  AFVAL: 'https://www.amsterdam.nl/afval/',
  AFVAL_COMMERCIAL:
    'https://www.amsterdam.nl/veelgevraagd/?productid={3D70B70E-8A19-4A95-BE31-8743995BC545}',
  AFVAL_AFSPRAAK_MAKEN:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Grofvuil.aspx',
  AMSTERDAM_COMPLAINTS_FROM:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scKlachtenformulier.aspx/fKlachtenformulier',
  AMSTERDAM_PRIVACY_PAGE: 'https://www.amsterdam.nl/privacy',
  AFVAL_MELDING_FORMULIER:
    'https://formulier.amsterdam.nl/mail/afval/afvalwijzer/',
  KREFIA: getOtapEnvItem('krefiaDirectLink'),
  STADSBANK_VAN_LENING: 'https://www.amsterdam.nl/sbl/',
  STADSPAS: 'https://www.amsterdam.nl/stadspas',
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

// NOTE: Keep up-to-date with _breakpoints.scss
export const Breakpoints = {
  tablet: 1024,
  phone: 640,
  wideScreen: 768,
};

export const DEFAULT_PROFILE_TYPE = 'private';
