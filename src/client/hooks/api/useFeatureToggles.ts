import { useBffApi } from './useBffApi';
import { type FeatureToggles } from '../../../server/config/azure-appconfiguration';
import { BFFApiUrls } from '../../config/api';

export function useFeatureToggles() {
  const response = useBffApi<FeatureToggles>(BFFApiUrls.FEATURE_TOGGLES);
  if (response.isError || !response.data?.content) {
    return false;
  }
  return response.data.content['AFIS.EMandates'];
}
