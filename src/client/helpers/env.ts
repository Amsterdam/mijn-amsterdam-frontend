import { BFFApiUrls } from '../config/api';
import { useBffApi } from '../hooks/api/useBffApi';

type ToggleConfig = {
  [name: string]: boolean;
};

export function useIsBffToggleEnabled<T extends string>(env: T): boolean {
  const bffToggles = useBffApi<ToggleConfig>(BFFApiUrls.FEATURE_TOGGLES);
  return bffToggles.data?.content?.[env] === true;
}
