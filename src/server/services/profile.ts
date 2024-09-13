import { apiSuccessResult } from '../../universal/helpers/api';
import { decodeOIDCToken } from '../auth/auth-helpers';
import { AuthProfileAndToken } from '../auth/auth-types';

export async function fetchProfile(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return apiSuccessResult({
    tokenData: await decodeOIDCToken(authProfileAndToken.token),
    profile: authProfileAndToken.profile,
  });
}
