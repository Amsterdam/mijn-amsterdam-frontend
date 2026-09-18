import { useProfileType } from './useProfileType.ts';
import {
  isLoading,
  type ApiResponse_DEPRECATED,
} from '../../universal/helpers/api.ts';

export function useIsLoading(
  apiResponseData?: ApiResponse_DEPRECATED<unknown>
) {
  const { profileType } = useProfileType();

  return isLoading(apiResponseData, profileType);
}
