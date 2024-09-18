import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { IS_DEBUG } from '../../config/app';
import { decrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';

/** Decrypt an encrypted 'sessionid:id' and validate it.
 */
export function decryptEncryptedRouteParamAndValidateSessionID(
  sessionIDAndRouteParamIdEncrypted: string,
  authProfileAndToken: AuthProfileAndToken
) {
  let sessionID: SessionID | null = null;
  let id: string | null = null;

  try {
    [sessionID, id] = decrypt(sessionIDAndRouteParamIdEncrypted).split(':');
  } catch (error) {
    captureException(error);
    return apiErrorResult(
      'Bad request: failed to process encrypted param',
      null,
      400
    );
  }

  if (!sessionID || !id || authProfileAndToken.profile.sid !== sessionID) {
    if (IS_DEBUG) {
      console.log(
        'ERROR: Incomplete session validation or missing routeParamID',
        'sessionID:',
        sessionID,
        'routeParamID:',
        id,
        'profile.sid:',
        authProfileAndToken.profile.sid
      );
    }
    return apiErrorResult(
      'Not authorized: incomplete session validation',
      null,
      401
    );
  }

  return apiSuccessResult(id);
}
