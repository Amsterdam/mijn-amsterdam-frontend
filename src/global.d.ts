import { type FeatureToggles } from './server/config/feature-toggles.ts';

declare global {
  var MA_FEATURETOGGLES: FeatureToggles;

  interface Navigator {
    // Exists in Internet explorer.
    msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  }
}
