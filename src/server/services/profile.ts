import { apiSuccessResult } from '../../universal/helpers';
import { AuthProfileAndToken, decodeOIDCToken } from '../helpers/app';

export async function fetchProfile(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return apiSuccessResult({
    tokenData: await decodeOIDCToken(authProfileAndToken.token),
    profile: authProfileAndToken.profile,
  });
}
