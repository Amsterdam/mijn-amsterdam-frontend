import { useProfileTypeValue } from './useProfileType.ts';
import {
  isLoading,
  type ApiResponse_DEPRECATED,
} from '../../universal/helpers/api.ts';

export function useIsLoading(
  apiResponseData?: ApiResponse_DEPRECATED<unknown>
) {
  const profileType = useProfileTypeValue();

  return isLoading(apiResponseData, profileType);
}
