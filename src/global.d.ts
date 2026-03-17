import { type FeatureToggles } from './server/config/azure-appconfiguration';

declare global {
  var MA_FEATURETOGGLES: FeatureToggles;
}
