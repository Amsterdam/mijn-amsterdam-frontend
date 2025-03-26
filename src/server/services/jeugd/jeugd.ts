import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';

export async function fetchJeugd(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ isKnown: boolean }>> {
  return apiSuccessResult({ isKnown: true });
}
