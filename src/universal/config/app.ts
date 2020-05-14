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
  focusAanvragenActive: true,
  focusCombinedActive: true,
  identiteitsbewijzenActive: true,
  tozoActive: true,
  eherkenningActive: !IS_PRODUCTION,
};
