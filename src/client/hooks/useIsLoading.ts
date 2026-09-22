import { useProfileTypeValue } from './useProfileType.ts';
import { type ApiResponse_DEPRECATED } from '../../universal/helpers/api.ts';
import { isLoading } from '../helpers/api.ts';

export function useIsLoading(
  apiResponseData?: ApiResponse_DEPRECATED<unknown>
) {
  const profileType = useProfileTypeValue();

  return isLoading(apiResponseData, profileType);
}
