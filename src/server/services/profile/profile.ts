import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';

export async function fetchProfile(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return apiSuccessResult({
    profile: authProfileAndToken.profile,
  });
}
