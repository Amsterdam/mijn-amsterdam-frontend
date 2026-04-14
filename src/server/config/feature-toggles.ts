import { IS_PRODUCTION } from '../../universal/config/env.ts';

// Is mutated by the Appconfiguration. Locally this object will be used as is.
export const featureToggle = {
  ['AFIS.EMandates']: true,
  ['AMSAPP.notificationService']: true,
  ['BRP.aantalBewonersOpAdresTonen']: true,
  ['USER_FEEDBACK.fetchSurvey']: true,
  ['cobrowse']: false,
  ['WONEN.vve']: !IS_PRODUCTION,
};
// globalThis is used to make sure featureToggles imported from frontend *-thema-configs have access.
globalThis.MA_FEATURETOGGLES = featureToggle;
export type FeatureToggles = typeof featureToggle;
export type FeatureToggleKey = keyof FeatureToggles;
