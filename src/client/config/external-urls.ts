import { IS_PRODUCTION } from '../../universal/config/env';

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
