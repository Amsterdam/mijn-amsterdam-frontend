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
