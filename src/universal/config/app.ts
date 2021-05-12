import { IS_PRODUCTION, IS_AP } from './env';
// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';

export const FeatureToggle = {
  myTipsoptInOutPersonalization: true,
  garbageInformationPage: true,
  focusDocumentDownload: true,
  belastingApiActive: true,
  milieuzoneApiActive: true,
  focusUitkeringsspecificatiesActive: true,
  identiteitsbewijzenActive: true,
  tonkActive: true,
  eherkenningActive: true,
  vergunningenActive: true,
  cmsFooterActive: true,
  KrefiaDirectLinkActive: true,
  tipsFlipActive: true,
  profileToggleActive: true,
  kvkActive: true,
  residentCountActive: true,
  sportDatasetsActive: true,
  wiorDatasetActive: true,
  foreignAddressInfoActive: !IS_PRODUCTION,
  irmaActive: !IS_AP,
  siaActive: !IS_AP,
  siaApiActive: !IS_AP,
  aktesActive: !IS_AP,
  milieuzoneRecentCasesActive: !IS_AP,
};

export const DAYS_KEEP_RECENT = 28;

export const DAYS_LEFT_TO_RENT = 30;
