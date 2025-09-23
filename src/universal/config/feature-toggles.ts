import { IS_OT, IS_PRODUCTION } from './env';

/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export const FeatureToggle = {
  // AFIS
  afisActive: true,
  afisEmandatesActive: false,
  afisBusinesspartnerPhoneActive: false,
  // We don't filter out the undownloadable facturen for testing purposes.
  // We want to be able to test immediately and not wait until the evening.
  afisFilterOutUndownloadableFacturenActive: IS_OT || IS_PRODUCTION,
  // See also MIJN-10042: Bug where migrated documents "$year < 2025" do not have PDF downloads available.
  afisMigratedFacturenDownloadActive: !IS_PRODUCTION,

  // AVG (Smile)
  avgActive: true,
  // Klachten (Smile)
  klachtenActive: true,

  // Belastingen Centric api
  belastingApiActive: true,

  // Bezwaren  / Octopus
  bezwarenActive: true,

  // Database
  dbSessionsEnabled: true,

  // E-herkenning
  ehKetenmachtigingActive: !IS_PRODUCTION,
  eherkenningActive: true,

  // ErfachtV2 VerNise
  erfpachtActive: true,
  erfpachtEndpointActive: true,

  // Afval api + Afval thema
  garbageInformationPage: true,
  adopteerbareAfvalContainerMeldingen: !IS_PRODUCTION,

  // Horeca vergunningen
  horecaActive: true,

  // ID Bewijzen thema
  identiteitsbewijzenActive: true,

  // BBZ inkomen
  inkomenBBZActive: true,

  krefiaActive: true,
  kvkActive: true,

  // OIDC logout hint ipv id_token.
  oidcLogoutHintActive: true,

  // For development purposes
  passQueryParamsToStreamUrl: !IS_PRODUCTION,
  adHocDependencyRequestCacheTtlMs: !IS_PRODUCTION,

  // Milieuzone splitising naar Overtredingen en Boetes
  overtredingenActive: true,
  // Milieuzone patroon C
  cleopatraApiActive: true,

  // Parkeren
  parkerenActive: true,
  parkerenCheckForProductAndPermitsActive: !IS_PRODUCTION,

  // Mijn Gegegvens -> aantal bewoners op adres.
  residentCountActive: true,

  // Subsidie patroon C
  subsidieActive: true,

  // Klant/Contactmomenten (Salesforce) patroon A
  contactmomentenActive: true,

  // Toeristische verhuur
  toeristischeVerhuurActive: true,
  // B&B Vergunningen actief
  powerbrowserActive: true,
  // B&B Downloads actief
  bbDocumentDownloadsActive: true,

  //Varen (komt uit Decos)
  varenActive: !IS_PRODUCTION,

  vergunningenActive: true,
  decosServiceActive: true,

  // Zorgned WMO documenten
  zorgnedDocumentAttachmentsActive: true,
  // Zorgned besluit obv bijgevoegd document
  zorgnedDocumentDecisionDateActive: true,
  // Zorg thema actief
  zorgv2ThemapaginaActive: true,

  // AmsApp notificaties
  amsNotificationsIsActive: !IS_PRODUCTION,

  // Cobrowse widget
  cobrowseIsActive: true,
} as const;
