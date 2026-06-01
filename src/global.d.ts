import { type FeatureToggles } from './server/config/feature-toggles.ts';

declare global {
  var MA_FEATURETOGGLES: FeatureToggles;

  interface Navigator {
    // Internet explorer compatibility.
    msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  }
}
