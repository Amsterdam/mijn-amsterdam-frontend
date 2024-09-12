import { apiSuccessResult } from '../../universal/helpers/api';
import { AuthProfileAndToken, decodeOIDCToken } from '../helpers/app';

export async function fetchProfile(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return apiSuccessResult({
    tokenData: await decodeOIDCToken(authProfileAndToken.token),
    profile: authProfileAndToken.profile,
  });
}
