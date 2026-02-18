import { useBffApi } from './useBffApi';
import {
  type FeatureToggleKey,
  type FeatureToggles,
} from '../../../server/config/azure-appconfiguration';
import { BFFApiUrls } from '../../config/api';

export function useIsFeatureEnabled(featureToggleKey: FeatureToggleKey) {
  const response = useBffApi<FeatureToggles>(BFFApiUrls.FEATURE_TOGGLES);
  return response.data?.content?.[featureToggleKey] === true;
}

export function useFeatureToggles(): Readonly<FeatureToggles> {
  const response = useBffApi<FeatureToggles>(BFFApiUrls.FEATURE_TOGGLES);
  const alwaysFalse = new Proxy(
    {},
    {
      get: () => false,
    }
  ) as FeatureToggles;
  if (!response.data?.content) {
    return alwaysFalse;
  }
  return response.data.content;
}
