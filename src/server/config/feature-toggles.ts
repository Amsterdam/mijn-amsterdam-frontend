import { IS_PRODUCTION } from '../../universal/config/env.ts';

// Is mutated by the Appconfiguration. Locally this object will be used as is.
export const featureToggle = {
  ['AFIS.EMandates']: true,
  ['AMSAPP.notificationService']: true,
  ['BRP.aantalBewonersOpAdresTonen']: true,
  ['USER_FEEDBACK.fetchSurvey']: true,
  ['cobrowse']: false,
  ['MA_ADMIN.router']: !IS_PRODUCTION,
  ['WONEN.vve']: !IS_PRODUCTION,
  ['WONEN.vve.monumentstatus']: !IS_PRODUCTION,
  ['VERGUNNINGEN.VTHOnPowerbrowserActive']: !IS_PRODUCTION,
  ['KLANT_CONTACT.afspraken']: !IS_PRODUCTION,
  ['HLI.securityCode']: !IS_PRODUCTION,
};
// globalThis is used to make sure featureToggles imported from frontend *-thema-configs have access.
globalThis.MA_FEATURETOGGLES = featureToggle;
export type FeatureToggles = typeof featureToggle;
export type FeatureToggleKey = keyof FeatureToggles;
