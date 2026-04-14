import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const featureToggle = {
  // VTH zaken are fetched from Powerbrowser instead of Decos
  vthOnPowerbrowserActive: isEnabled('VERGUNNINGEN.VTHOnPowerbrowserActive'),
};
