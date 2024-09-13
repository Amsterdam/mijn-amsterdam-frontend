import { decrypt } from '../../helpers/encrypt-decrypt';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { captureException } from '../monitoring';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';

/** Decrypt an encrypted 'sessionid:id' and validate it.
 */
export function decryptEncryptedRouteParamAndValidateSessionID(
  idsEncrypted: string,
  authProfileAndToken: AuthProfileAndToken
) {
  let sessionID: AuthProfileAndToken['profile']['sid'] | null = null;
  let id: string | null = null;

  try {
    [sessionID, id] = decrypt(idsEncrypted).split(':');
  } catch (error) {
    captureException(error);
    return apiErrorResult(
      'Bad request: failed to process encrypted param',
      null,
      400
    );
  }

  if (!sessionID || !id || authProfileAndToken.profile.sid !== sessionID) {
    return apiErrorResult(
      'Not authorized: incomplete session validation',
      null,
      401
    );
  }

  return apiSuccessResult(id);
}
