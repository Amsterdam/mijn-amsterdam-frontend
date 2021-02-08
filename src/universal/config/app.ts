import { IS_PRODUCTION } from './env';
// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';

export const FeatureToggle = {
  myTipsoptInOutPersonalization: true,
  garbageInformationPage: true,
  focusDocumentDownload: true,
  belastingApiActive: true,
  milieuzoneApiActive: true,
  focusUitkeringsspecificatiesActive: true,
  focusDocumentDownloadsAlert: false,
  identiteitsbewijzenActive: true,
  tozo4active: false,
  eherkenningActive: true,
  vergunningenActive: true,
  cmsFooterActive: true,
  KrefiaDirectLinkActive: true,
  tipsFlipActive: true,
  profileToggleActive: true,
  kvkActive: true,
  residentCountActive: true,
  sportDatasetsActive: !IS_PRODUCTION,
  foreignAddressInfoActive: !IS_PRODUCTION,
  irmaActive: !IS_PRODUCTION,
};

export const DAYS_KEEP_RECENT = 28;
