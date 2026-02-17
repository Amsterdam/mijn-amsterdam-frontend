import { useBffApi } from './useBffApi';
import { FeatureToggles } from '../../../server/config/azure-appconfiguration';
import { BFFApiUrls } from '../../config/api';

export function useFeatureToggles() {
  return useBffApi<FeatureToggles>(BFFApiUrls.FEATURE_TOGGLES, {
    fetchImmediately: true,
  });
}
