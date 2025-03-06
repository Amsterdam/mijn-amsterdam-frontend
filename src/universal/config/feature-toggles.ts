import { IS_AP, IS_OT, IS_PRODUCTION } from './env';

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

  // Loodmetingen
  bodemActive: true,

  cmsFooterActive: true,

  // Database
  dbSessionsEnabled: true,

  // E-herkenning
  ehKetenmachtigingActive: !IS_PRODUCTION,
  eherkenningActive: true,

  // ErfachtV2 VerNise
  erfpachtV2Active: !IS_PRODUCTION,
  erfpachtV2EndpointActive: !IS_PRODUCTION,

  // Legacy Mijn Erfpacht
  mijnErfpachtActive: true,

  // Afval api + Afval thema
  garbageInformationPage: true,
  adopteerbareAfvalContainerMeldingen: !IS_PRODUCTION,

  // HLI Hulp bij laag inkomen //
  hliThemaActive: true,
  hliThemaStadspasActive: true,
  hliThemaStadspasBlokkerenActive: !IS_PRODUCTION,
  hliThemaRegelingenActive: true,
  hliRegelingEnabledCZM: true,
  hliRegelingEnabledRTM: !IS_PRODUCTION,

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
  overtredingenActive: true,
  // Milieuzone patroon C
  cleopatraApiActive: true,

  // Parkeren
  parkerenActive: true,
  parkerenCheckForProductAndPermitsActive: true,

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

  // Klant/Contactmomenten (Salesforce) patroon A
  contactmomentenActive: true,

  // WPI Portaal
  svwiLinkActive: false, // NOTE: The status of this feature is unknown.

  // Toeristische verhuur
  toeristischeVerhuurActive: true,
  // B&B Vergunningen actief
  powerbrowserActive: true,
  // B&B Downloads actief
  bbDocumentDownloadsActive: true,

  //Varen (komt uit Decos)
  varenActive: !IS_PRODUCTION,

  // Vergunningen V1 (met koppel api)
  vergunningenActive: true,
  // Vergunningen V2 met BFF integratie
  vergunningenV2Active: false, // TODO: Enable when working on MIJN-8914
  decosServiceActive: !IS_PRODUCTION, // TODO: Enable when working on MIJN-8914

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
