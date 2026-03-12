import { type FeatureToggles } from './server/config/azure-appconfiguration.ts';

declare global {
  var MA_FEATURETOGGLES: FeatureToggles;
}
