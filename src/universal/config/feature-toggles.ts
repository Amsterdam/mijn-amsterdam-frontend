import { IS_AP, IS_DEVELOPMENT, IS_OT, IS_PRODUCTION } from './env';

export const FeatureToggle = {
  // AFIS
  afisActive: !IS_PRODUCTION,
  afisEmandatesActive: false,
  afisFilterOutUndownloadableFacturenActive: IS_OT || IS_PRODUCTION, // We don't filter out the undownloadable facturen for testing purposes. We want to be able to test immediately and not wait until the evening.

  // AVG (Smile)
  avgActive: true,
  // Klachten (Smile)
  klachtenActive: true,

  // Belastingen Centric api
  belastingApiActive: true,

  // Bezwaren  / Octopus
  bezwarenActive: true,

  // Loodmetingen
  bodemActive: true,

  cmsFooterActive: true,

  // Database
  dbEnabled: !IS_DEVELOPMENT,
  dbSessionsEnabled: true,

  // E-herkenning
  ehKetenmachtigingActive: !IS_PRODUCTION,
  eherkenningActive: true,

  // ErfachtV2 VerNise
  erfpachtV2Active: !IS_PRODUCTION,
  erfpachtV2EndpointActive: !IS_PRODUCTION,

  // Afval api + Afval thema
  garbageInformationPage: true,

  // HLI Hulp bij laag inkomen //
  hliThemaActive: true,
  hliThemaStadspasActive: true,
  hliThemaRegelingenActive: true,
  hliRegelingEnabledCZM: true,

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
  passQueryParamsToStreamUrl: !IS_AP,

  // Milieuzone splitising naar Overtredingen en Boetes
  overtredingenActive: !IS_PRODUCTION,
  // Milieuzone patroon C
  cleopatraApiActive: true,

  // Parkeren
  parkerenActive: IS_PRODUCTION, // Two parkeren toggles because in the middle of implementing MIJN-9097.
  parkerenPatroonC: !IS_PRODUCTION,

  // Mijn Gegegvens -> aantal bewoners op adres.
  residentCountActive: true,

  // Sport dataset op de kaart
  sportDatasetsActive: true,
  // Bekendmakingen dataset op de kaart
  bekendmakingenDatasetActive: false,
  // Evenementen dataset op de kaart
  evenementenDatasetActive: false,
  // Laadpalen dataset op de kaart
  laadpalenActive: !IS_PRODUCTION,
  // Meldingen dataset op de kaart
  meldingenBuurtActive: true,

  // Subsidie patroon C
  subsidieActive: true,

  // WPI Portaal
  svwiLinkActive: IS_DEVELOPMENT,

  // Toeristische verhuur
  toeristischeVerhuurActive: true,
  // B&B Vergunningen actief
  powerbrowserActive: !IS_PRODUCTION,
  // B&B Downloads actief
  bbDocumentDownloadsActive: IS_OT,

  // Vergunningen V1 (met koppel api)
  vergunningenActive: true,
  // Vergunningen V2 met BFF integratie
  vergunningenV2Active: IS_DEVELOPMENT, // TODO: Enable when working on MIJN-8914
  decosServiceActive: IS_DEVELOPMENT, // TODO: Enable when working on MIJN-8914

  // WIOR Kaar data
  wiorDatasetActive: true,
  // WIOR Meldingen aan de hand van de kaartdata.
  wiorMeldingen: true,

  // Zorgned WMO documenten
  zorgnedDocumentAttachmentsActive: true,
  // Zorgned besluit obv bijgevoegd document
  zorgnedDocumentDecisionDateActive: true,
  // Zorg thema actief
  zorgv2ThemapaginaActive: true,
};
