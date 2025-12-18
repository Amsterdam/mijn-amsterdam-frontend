import { IS_PRODUCTION } from './env';

/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export const FeatureToggle = {
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

  // VTH vergunningen move from decos to powerbrowser (ligplaats/kameromzettingen/woningvormingen)
  VTHOnPowerbrowserActive: false,
} as const;
