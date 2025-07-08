import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';

export async function fetchProfile(authProfileAndToken: AuthProfileAndToken) {
  return apiSuccessResult({
    profile: authProfileAndToken.profile,
  });
}
