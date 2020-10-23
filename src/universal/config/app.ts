import { IS_AP, IS_PRODUCTION } from './env';

// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';

export const FeatureToggle = {
  myTipsoptInOutPersonalization: true,
  garbageInformationPage: true,
  focusDocumentDownload: true,
  belastingApiActive: true,
  milieuzoneApiActive: true,
  focusUitkeringsspecificatiesActive: true,
  focusDocumentDownloadsActive: !IS_PRODUCTION,
  focusAanvragenActive: true,
  focusCombinedActive: true,
  identiteitsbewijzenActive: true,
  tozoActive: true,
  tozo2active: true,
  tozo3active: !IS_PRODUCTION,
  eherkenningActive: !IS_PRODUCTION,
  vergunningenActive: true,
  cmsFooterActive: true,
  KrefiaDirectLinkActive: true,
  tipsFlipActive: true,
  myArea2Active: !IS_PRODUCTION,
  profileToggleActive: !IS_PRODUCTION,
  kvkActive: !IS_PRODUCTION,
  residentCountActive: true,
  myAreaDataSportEnBosActive: !IS_AP,
};

export const DAYS_KEEP_RECENT = 28;
