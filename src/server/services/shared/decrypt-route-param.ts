import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { IS_DEBUG } from '../../config/app';
import { decrypt } from '../../helpers/encrypt-decrypt';
import { log } from '../../logging';
import { captureException } from '../monitoring';

export type SessionIDAndROuteParamIdEncrypted = string;

/** Decrypt an encrypted 'sessionid:id' and validate it.
 */
export function decryptEncryptedRouteParamAndValidateSessionID(
  sessionIDAndRouteParamIdEncrypted: SessionIDAndROuteParamIdEncrypted,
  authProfileAndToken: AuthProfileAndToken
) {
  let sessionID: SessionID | null = null;
  let id: string | null = null;

  try {
    [sessionID, id] = decrypt(sessionIDAndRouteParamIdEncrypted).split(':');
  } catch (error) {
    log.error(error);
    captureException(error);
    return apiErrorResult(
      'Bad request: failed to process encrypted param',
      null,
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  if (!sessionID || !id || authProfileAndToken.profile.sid !== sessionID) {
    if (IS_DEBUG) {
      log.info(
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
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  return apiSuccessResult(id);
}
